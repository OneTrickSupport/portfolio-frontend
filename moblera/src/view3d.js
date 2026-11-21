// 3D-vyn: bygger lägenheten av planen och låter dig flytta möbler, snurra runt och gå omkring.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { app, commit, emit, find, on, select } from './store.js';
import * as D from './derive.js';
import { CATALOG } from './catalog.js';
import { addItem } from './actions.js';
import { buildModel, floorMaterial, M } from './models.js';
import { distToPoly, pointInPoly, rad } from './geom.js';

let host, renderer, scene, camera, controls, structGroup, itemsGroup;
let ready = false, raf = 0, last = 0, structSig = '', framed = null;
let wallGroups = [], ceilings = [], selBox = null, structMats = [];
const itemObjs = new Map();
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let drag = null, down = null;
const walk = { on: false, yaw: 0, pitch: 0, x: 0, z: 0, keys: new Set(), look: null, saved: null };
const EYE = 1.62;

export function init(el) {
  host = el;
  on((kind) => { if (kind !== 'zoom') sync(); });
  window.addEventListener('keydown', (e) => {
    if (app.view !== '3d' || e.metaKey || e.ctrlKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    // pilarna flyttar en markerad möbel; annars styr de kameran
    if (!walk.on && app.sel && e.key.startsWith('Arrow')) return;
    walk.keys.add(e.key.toLowerCase());
    if (e.key.startsWith('Arrow')) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => walk.keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => walk.keys.clear());
}

function ensure() {
  if (ready) return;
  ready = true;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  host.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#e6eaec');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.38;

  const b = D.bounds(), cx = (b.x0 + b.x1) / 200, cz = (b.y0 + b.y1) / 200;
  camera = new THREE.PerspectiveCamera(42, 1, 0.05, 300);
  camera.position.set(cx + 1.5, 15, cz + 13);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(cx, 0.4, cz);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.minDistance = 1.2;
  controls.maxDistance = 60;
  controls.screenSpacePanning = false;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b2a6, 0.72));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.1);
  sun.position.set(cx - 7, 17, cz + 6);
  sun.target.position.set(cx, 0, cz);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.13 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(cx, -0.004, cz);
  ground.receiveShadow = true;
  scene.add(ground);

  itemsGroup = new THREE.Group();
  scene.add(itemsGroup);

  const el = renderer.domElement;
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
  el.addEventListener('dblclick', (e) => {
    if (walk.on) return;
    const p = floorPoint(e);
    if (!p) return;
    const d = p.clone().sub(controls.target);
    d.y = 0;
    controls.target.add(d);
    camera.position.add(d);
  });
  el.addEventListener('dragover', (e) => e.preventDefault());
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain'), p = floorPoint(e);
    if (CATALOG[type] && p) addItem(type, p.x * 100, p.z * 100);
  });
  new ResizeObserver(resize).observe(host);
}

function resize() {
  if (!ready) return;
  const w = host.clientWidth, h = host.clientHeight;
  if (w < 10 || h < 10) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

export function setActive(active) {
  if (active) {
    ensure();
    resize();
    sync();
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  } else if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

function loop(t) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  if (walk.on) updateWalk(dt); else { orbitKeys(dt); controls.update(); }
  updateWalls(dt);
  renderer.render(scene, camera);
}

// ---------- Bygga scenen ----------
function disposeTree(o) {
  o.traverse((m) => { if (m.geometry) m.geometry.dispose(); });
}
function bx(parent, w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.002), Math.max(h, 0.002), Math.max(d, 0.002)), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}

function rebuildStructure() {
  const st = app.state, S = D.structure(), H = S.H / 100;
  if (structGroup) { scene.remove(structGroup); disposeTree(structGroup); structMats.forEach((m) => m.dispose()); }
  structGroup = new THREE.Group();
  scene.add(structGroup);
  wallGroups = [];
  ceilings = [];
  const wallMat = new THREE.MeshStandardMaterial({ color: st.wallColor, roughness: 0.95 });
  const capMat = new THREE.MeshStandardMaterial({ color: '#2c3238', roughness: 0.9 });
  const ceilMat = new THREE.MeshBasicMaterial({ color: '#f3f2ee' });
  const glass = new THREE.MeshStandardMaterial({ color: '#cfe6f2', roughness: 0.05, transparent: true, opacity: 0.24, depthWrite: false });
  structMats = [wallMat, capMat, ceilMat, glass];
  const capped = [wallMat, wallMat, capMat, wallMat, wallMat, wallMat];
  const frame = M('#f7f6f2', 0.6), sill = M('#e4e1d8', 0.5);

  // ett rum i taget: bara det rummets golv och de väggbitar som vetter mot det
  const F = D.focus();
  for (const r of F ? [F.room] : S.rooms) {
    const geo = new THREE.ShapeGeometry(new THREE.Shape(r.poly.map(([x, y]) => new THREE.Vector2(x / 100, -y / 100))));
    geo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(geo, floorMaterial(r.floor));
    floor.receiveShadow = true;
    structGroup.add(floor);
    const cg = new THREE.ShapeGeometry(new THREE.Shape(r.poly.map(([x, y]) => new THREE.Vector2(x / 100, y / 100))));
    cg.rotateX(Math.PI / 2);
    const ceil = new THREE.Mesh(cg, ceilMat);
    ceil.position.y = H;
    ceil.visible = walk.on;
    structGroup.add(ceil);
    ceilings.push(ceil);
  }

  for (const g of S.real) {
    const fw = F && F.walls.get(g.w.id);
    if (F && !fw) continue;
    const c0 = fw ? fw.c0 : -Infinity, c1 = fw ? fw.c1 : Infinity;
    const grp = new THREE.Group(), t = g.w.t / 100;
    grp.position.set(g.a[0] / 100, 0, g.a[1] / 100);
    grp.rotation.y = -Math.atan2(g.u[1], g.u[0]);
    for (const p of g.pieces) {
      const s0 = Math.max(p.s0, c0), s1 = Math.min(p.s1, c1);
      if (s1 - s0 < 0.5) continue;
      bx(grp, (s1 - s0) / 100, (p.y1 - p.y0) / 100, t, p.y1 >= S.H - 0.5 ? capped : wallMat, (s0 + s1) / 200, (p.y0 + p.y1) / 200, 0);
    }
    for (const x of g.ops) {
      if (fw && (x.o.pos < fw.s0 || x.o.pos > fw.s1)) continue;
      const op = x.o, s0 = x.s0 / 100, s1 = x.s1 / 100, w = s1 - s0, cx = (s0 + s1) / 2;
      const y0 = x.sill / 100, y1 = x.top / 100, h = y1 - y0;
      if (op.type === 'window') {
        const f = 0.06, dp = Math.min(0.1, t * 0.6);
        bx(grp, w, f, dp, frame, cx, y0 + f / 2, 0);
        bx(grp, w, f, dp, frame, cx, y1 - f / 2, 0);
        bx(grp, f, h, dp, frame, s0 + f / 2, y0 + h / 2, 0);
        bx(grp, f, h, dp, frame, s1 - f / 2, y0 + h / 2, 0);
        if (w > 0.9) bx(grp, 0.045, h, dp * 0.8, frame, cx, y0 + h / 2, 0);
        if (h > 1.25) bx(grp, w, 0.045, dp * 0.8, frame, cx, y0 + h * 0.7, 0);
        const pane = bx(grp, w - 2 * f, h - 2 * f, 0.008, glass, cx, y0 + h / 2, 0);
        pane.castShadow = false;
        if (y0 > 0.05) bx(grp, w, 0.03, t + 0.05, sill, cx, y0 - 0.015, 0);
      } else if (op.type === 'door') {
        bx(grp, 0.035, h, t + 0.03, frame, s0 + 0.0175, y0 + h / 2, 0);
        bx(grp, 0.035, h, t + 0.03, frame, s1 - 0.0175, y0 + h / 2, 0);
        bx(grp, w, 0.035, t + 0.03, frame, cx, y1 - 0.0175, 0);
        const sg = op.side === -1 ? -1 : 1, lw = w - 0.07;
        const pivot = new THREE.Group();
        pivot.position.set(op.hinge ? s1 - 0.035 : s0 + 0.035, y0, sg * (t / 2));
        pivot.rotation.y = (op.hinge ? 1 : -1) * sg * rad(84);
        bx(pivot, lw, h - 0.04, 0.04, M('#ecebe6', 0.5), ((op.hinge ? -1 : 1) * lw) / 2, (h - 0.04) / 2, 0);
        bx(pivot, 0.12, 0.02, 0.09, M('#b9bec2', 0.3, 0.9), (op.hinge ? -1 : 1) * (lw - 0.09), 1.02, 0);
        grp.add(pivot);
      }
    }
    const sm = (Math.max(c0, 0) + Math.min(c1, g.len)) / 2;
    grp.userData.mid = new THREE.Vector3((g.a[0] + g.u[0] * sm) / 100, 0, (g.a[1] + g.u[1] * sm) / 100);
    grp.userData.H = H;
    structGroup.add(grp);
    wallGroups.push(grp);
  }
  updateWalls(1); // rätt höjd direkt, utan animation
}

const itemSig = (it) => [it.type, it.w, it.d, it.h, it.color, it.mirror ? 1 : 0].join('|');

function syncItems() {
  const seen = new Set();
  for (const it of app.state.items) {
    seen.add(it.id);
    const sig = itemSig(it);
    let o = itemObjs.get(it.id);
    if (!o || o.sig !== sig) {
      if (o) { itemsGroup.remove(o.group); disposeTree(o.group); }
      const group = buildModel(it);
      group.userData.itemId = it.id;
      itemsGroup.add(group);
      o = { group, sig };
      itemObjs.set(it.id, o);
    }
    o.group.visible = D.inFocus(it);
    o.group.position.set(it.x / 100, (it.elev || 0) / 100, it.y / 100);
    o.group.rotation.y = -rad(it.rot);
  }
  for (const [id, o] of itemObjs) {
    if (!seen.has(id)) { itemsGroup.remove(o.group); disposeTree(o.group); itemObjs.delete(id); }
  }
  // markeringsram
  if (selBox) { selBox.parent?.remove(selBox); selBox.geometry.dispose(); selBox.material.dispose(); selBox = null; }
  const it = app.sel?.kind === 'item' && find(app.sel);
  const o = it && itemObjs.get(it.id);
  if (o) {
    const bad = D.collisions().has(it.id);
    selBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(it.w / 100 + 0.04, it.h / 100 + 0.04, it.d / 100 + 0.04)),
      new THREE.LineBasicMaterial({ color: bad ? 0xd8432e : 0x2456e6 })
    );
    selBox.position.y = it.h / 200;
    selBox.raycast = () => {};
    o.group.add(selBox);
  }
}

export function sync() {
  if (!ready || app.view !== '3d') return;
  const st = app.state;
  const fid = D.focus() ? app.ui.focus : null;
  // nytt rum valt: rikta kameran mot det
  if (framed !== fid) { framed = fid; if (walk.on) setWalk(false); frame(); }
  const sig = JSON.stringify([st.walls, st.openings, st.wallHeight, st.wallColor, st.rooms, fid]);
  if (sig !== structSig) { structSig = sig; rebuildStructure(); }
  syncItems();
}

// Väggar som står mellan kameran och det du tittar på sänks, så att du ser in.
function updateWalls(dt) {
  const mode = walk.on ? 'full' : app.ui.wallMode;
  const vx = controls.target.x - camera.position.x, vz = controls.target.z - camera.position.z;
  const vl = Math.hypot(vx, vz) || 1;
  for (const grp of wallGroups) {
    const H = grp.userData.H;
    let target = 1;
    if (mode === 'low') target = Math.min(1, 1 / H);
    else if (mode === 'auto' && camera.position.y > H * 0.9) {
      const s = ((grp.userData.mid.x - controls.target.x) * vx + (grp.userData.mid.z - controls.target.z) * vz) / vl;
      if (s < -0.25) target = 0.12 / H;
    }
    grp.scale.y += (target - grp.scale.y) * Math.min(1, dt * 9);
  }
}

// ---------- Mus ----------
function setRay(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
}
function pickItem(e) {
  setRay(e);
  for (const h of ray.intersectObjects(itemsGroup.children.filter((c) => c.visible), true)) {
    let o = h.object;
    while (o && o.userData.itemId == null) o = o.parent;
    if (o) return o.userData.itemId;
  }
  return null;
}
function floorPoint(e, plane = floorPlane) {
  setRay(e);
  const p = new THREE.Vector3();
  return ray.ray.intersectPlane(plane, p) ? p : null;
}

function onDown(e) {
  if (e.button !== 0) return;
  if (walk.on) {
    walk.look = { x: e.clientX, y: e.clientY, yaw: walk.yaw, pitch: walk.pitch };
    renderer.domElement.setPointerCapture(e.pointerId);
    return;
  }
  down = { x: e.clientX, y: e.clientY };
  const id = pickItem(e);
  if (id == null) return;
  select({ kind: 'item', id });
  const it = find({ kind: 'item', id });
  if (it.locked) return;
  // dra i ett plan på möbelns egen höjd, så att tavlor och taklampor följer pekaren
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -((it.elev || 0) + Math.min(it.h || 0, 120) / 2) / 100);
  const p = floorPoint(e, plane);
  if (!p) return;
  drag = { id, plane, dx: it.x - p.x * 100, dy: it.y - p.z * 100, moved: false, riders: e.shiftKey ? D.sofaGroup(it) : D.riders(it) };
  controls.enabled = false;
  renderer.domElement.setPointerCapture(e.pointerId);
}
function onMove(e) {
  if (walk.on) {
    if (walk.look) {
      walk.yaw = walk.look.yaw - (e.clientX - walk.look.x) * 0.0045;
      walk.pitch = Math.max(-1.2, Math.min(1.2, walk.look.pitch - (e.clientY - walk.look.y) * 0.0045));
    }
    return;
  }
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 4) return;
  const p = floorPoint(e, drag.plane), it = find({ kind: 'item', id: drag.id });
  if (!p || !it) return;
  drag.moved = true;
  D.dragItem(it, Math.round(p.x * 100 + drag.dx), Math.round(p.z * 100 + drag.dy), e.altKey, drag.riders);
  emit('live');
}
function onUp(e) {
  try { renderer.domElement.releasePointerCapture(e.pointerId); } catch { /* redan släppt */ }
  if (walk.on) { walk.look = null; return; }
  if (drag) {
    const moved = drag.moved;
    drag = null;
    controls.enabled = true;
    if (moved) commit();
  } else if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 4 && pickItem(e) == null) {
    select(null);
  }
  down = null;
}

// ---------- Gå runt ----------
function blocked(x, z) {
  const p = [x * 100, z * 100];
  for (const s of D.structure().solids) {
    if (s.y0 > 170 || s.y1 < 25) continue;
    if (pointInPoly(p, s.poly) || distToPoly(p, s.poly) < 22) return true;
  }
  for (const it of app.state.items) {
    if (D.isRug(it)) continue;
    const [y0, y1] = D.vrange(it);
    if (y0 > 150 || y1 < 30) continue;
    for (const poly of D.itemPolys(it)) if (pointInPoly(p, poly) || distToPoly(p, poly) < 14) return true;
  }
  return false;
}
/** En ledig plats att stå på i rummet, så nära rummets mitt som möjligt. */
function freeSpot(room) {
  const [lx, ly] = room.label;
  if (!blocked(lx / 100, ly / 100)) return room.label;
  const xs = room.poly.map((q) => q[0]), ys = room.poly.map((q) => q[1]);
  let best = room.label, bd = Infinity;
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += 15) {
    for (let y = Math.min(...ys); y <= Math.max(...ys); y += 15) {
      const d = Math.hypot(x - lx, y - ly);
      if (d < bd && pointInPoly([x, y], room.poly) && !blocked(x / 100, y / 100)) { best = [x, y]; bd = d; }
    }
  }
  return best;
}
/** Piltangenter och WASD flyttar kameran över golvet, Q/E snurrar, +/− zoomar. */
function orbitKeys(dt) {
  const k = walk.keys;
  if (!k.size) return;
  const off = camera.position.clone().sub(controls.target);
  const sph = new THREE.Spherical().setFromVector3(off);
  const rot = (k.has('q') ? 1 : 0) - (k.has('e') ? 1 : 0);
  const tilt = (k.has('pageup') ? 1 : 0) - (k.has('pagedown') ? 1 : 0);
  const zoom = (k.has('-') ? 1 : 0) - (k.has('+') || k.has('=') ? 1 : 0);
  sph.theta -= rot * 1.4 * dt;
  sph.phi = Math.min(controls.maxPolarAngle, Math.max(0.05, sph.phi - tilt * 0.9 * dt));
  sph.radius = Math.min(controls.maxDistance, Math.max(controls.minDistance, sph.radius * (1 + zoom * 1.2 * dt)));
  const f = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0), s = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
  if (f || s) {
    const sp = (k.has('shift') ? 2.5 : 1) * Math.max(2, sph.radius * 0.6) * dt;
    const sin = Math.sin(sph.theta), cos = Math.cos(sph.theta);
    controls.target.x += (-sin * f + cos * s) * sp;
    controls.target.z += (-cos * f - sin * s) * sp;
  }
  camera.position.copy(controls.target).add(off.setFromSpherical(sph));
}
function updateWalk(dt) {
  const k = walk.keys, sp = (k.has('shift') ? 2.8 : 1.5) * dt;
  if (k.has('arrowleft') || k.has('q')) walk.yaw += 1.9 * dt;
  if (k.has('arrowright') || k.has('e')) walk.yaw -= 1.9 * dt;
  const f = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0);
  const s = (k.has('d') ? 1 : 0) - (k.has('a') ? 1 : 0);
  if (f || s) {
    const sin = Math.sin(walk.yaw), cos = Math.cos(walk.yaw);
    const nx = walk.x + (-sin * f + cos * s) * sp, nz = walk.z + (-cos * f - sin * s) * sp;
    if (!blocked(nx, nz)) { walk.x = nx; walk.z = nz; }
    else if (!blocked(nx, walk.z)) walk.x = nx;
    else if (!blocked(walk.x, nz)) walk.z = nz;
  }
  camera.position.set(walk.x, EYE, walk.z);
  camera.rotation.set(walk.pitch, walk.yaw, 0, 'YXZ');
}
export function setWalk(active) {
  ensure();
  if (active === walk.on) return;
  walk.on = active;
  app.ui.walk = active;
  if (active) {
    walk.saved = { pos: camera.position.clone(), target: controls.target.clone() };
    const rooms = D.structure().rooms;
    // börja i rummet som visas, annars i hallen om det finns en, annars där du tittar
    const F = D.focus();
    const hall = F ? F.room : rooms.find((r) => /hall/i.test(r.name));
    let p = hall ? freeSpot(hall) : [controls.target.x * 100, controls.target.z * 100];
    if (!hall && (!rooms.some((r) => pointInPoly(p, r.poly)) || blocked(p[0] / 100, p[1] / 100)) && rooms[0]) p = freeSpot(rooms[0]);
    walk.x = p[0] / 100;
    walk.z = p[1] / 100;
    walk.yaw = -Math.PI / 2;
    walk.pitch = -0.05;
    camera.fov = 68;
    controls.enabled = false;
  } else {
    camera.fov = 42;
    camera.position.copy(walk.saved.pos);
    controls.target.copy(walk.saved.target);
    controls.enabled = true;
    walk.keys.clear();
  }
  ceilings.forEach((c) => { c.visible = active; });
  camera.updateProjectionMatrix();
  emit('view');
}

/** Rikta kameran så att hela lägenheten, eller rummet som visas, ryms. */
function frame() {
  const b = D.viewBounds(), cx = (b.x0 + b.x1) / 200, cz = (b.y0 + b.y1) / 200;
  const s = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 100, k = D.focus() ? 1 : 0; // ett ensamt rum behöver lite mer luft för de höga väggarna
  controls.target.set(cx, 0.4, cz);
  camera.position.set(cx + 0.13 * s, 1.3 * s + 1.6 * k, cz + 1.13 * s + 2.2 * k);
}
export function resetCamera() {
  if (!ready) return;
  if (walk.on) setWalk(false);
  frame();
}
export function topView() {
  if (!ready) return;
  if (walk.on) setWalk(false);
  const b = D.viewBounds(), cx = (b.x0 + b.x1) / 200, cz = (b.y0 + b.y1) / 200;
  const s = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 100;
  controls.target.set(cx, 0, cz);
  camera.position.set(cx, Math.max(7, s * 1.83), cz + 0.4);
}
export const center = () => (ready ? [controls.target.x * 100, controls.target.z * 100] : [0, 0]);
export function snapshot() {
  if (!ready) return null;
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}
