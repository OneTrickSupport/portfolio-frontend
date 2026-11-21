// Planvyn: ritar planen som SVG och sköter all redigering med musen.

import { app, commit, emit, find, newId, on, select, setFocus, setTool } from './store.js';
import * as D from './derive.js';
import { CATALOG, draw2d, FLOORS, shapeOf } from './catalog.js';
import { addItem, esc, fmt } from './actions.js';
import { clamp, deg, dist, pointInPoly, pts, rotPt, segParam } from './geom.js';

let svg;
const L = {};
const view = { cx: 500, cy: 600, z: 0.6 }; // z = skärmpixlar per cm
let size = { w: 800, h: 600 };
let drag = null, hover = null, space = false, drawStart = null, fitted = false, fitFor = null;

export const getZoom = () => view.z;
export const center = () => [view.cx, view.cy];

export function init(el) {
  svg = el;
  svg.innerHTML = ['floor', 'img', 'walls', 'open', 'items', 'labels', 'dims', 'edit', 'measure'].map((n) => `<g id="l-${n}"></g>`).join('');
  for (const g of svg.children) L[g.id.slice(2)] = g;
  new ResizeObserver(() => {
    const r = svg.getBoundingClientRect();
    if (r.width < 10) return;
    size = { w: r.width, h: r.height };
    if (!fitted) { fitted = true; fit(); } else { applyView(); }
  }).observe(svg);
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);
  svg.addEventListener('wheel', onWheel, { passive: false });
  svg.addEventListener('contextmenu', (e) => e.preventDefault());
  // dubbelklick på ett golv visar bara det rummet; dubbelklick utanför visar alla igen
  svg.addEventListener('dblclick', (e) => {
    if (app.tool !== 'select') return;
    const p = toWorld(e);
    if (app.state.items.some((m) => D.inFocus(m) && D.itemPolys(m).some((poly) => pointInPoly(p, poly)))) return;
    const r = D.structure().rooms.find((x) => pointInPoly(p, x.poly));
    if (D.focus()) { if (!pointInPoly(p, D.focus().room.poly)) setFocus(null); } else if (r) setFocus(r.id);
  });
  svg.addEventListener('dragover', (e) => e.preventDefault());
  svg.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (CATALOG[type]) { const p = toWorld(e); addItem(type, p[0], p[1]); }
  });
  window.addEventListener('keydown', (e) => { if (e.code === 'Space' && !isTyping(e)) { space = true; svg.classList.add('panning'); } });
  window.addEventListener('keyup', (e) => { if (e.code === 'Space') { space = false; svg.classList.remove('panning'); } });
  on((kind) => {
    if (kind === 'zoom') return;
    if (kind === 'tool') drawStart = null;
    render();
  });
}
const isTyping = (e) => /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);

export function fit() {
  // lämna plats för namnrutan nere till höger
  const b = D.viewBounds(), m = 60, padX = 40, padTop = 30, padBottom = size.h > 520 ? 130 : 30;
  view.z = clamp(Math.min((size.w - 2 * padX) / (b.x1 - b.x0 + 2 * m), (size.h - padTop - padBottom) / (b.y1 - b.y0 + 2 * m)), 0.08, 6);
  view.cx = (b.x0 + b.x1) / 2;
  view.cy = (b.y0 + b.y1) / 2 + (padBottom - padTop) / 2 / view.z;
  applyView();
  render();
  emit('zoom');
}
export function zoomBy(f) { zoomAt(size.w / 2, size.h / 2, f); }
function zoomAt(sx, sy, f) {
  const wx = view.cx + (sx - size.w / 2) / view.z, wy = view.cy + (sy - size.h / 2) / view.z;
  view.z = clamp(view.z * f, 0.08, 6);
  view.cx = wx - (sx - size.w / 2) / view.z;
  view.cy = wy - (sy - size.h / 2) / view.z;
  applyView();
  render();
  emit('zoom');
}
function applyView() {
  svg.setAttribute('viewBox', `${view.cx - size.w / 2 / view.z} ${view.cy - size.h / 2 / view.z} ${size.w / view.z} ${size.h / view.z}`);
}
function toWorld(e) {
  const r = svg.getBoundingClientRect();
  return [view.cx + (e.clientX - r.left - r.width / 2) / view.z, view.cy + (e.clientY - r.top - r.height / 2) / view.z];
}

// ---------- Ritning ----------
const isSel = (kind, id) => app.sel?.kind === kind && app.sel.id === id;
const ln = (a, b, cls) => `<line class="${cls}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k];

function chip(p, text, angle = 0, cls = '') {
  const u = 1 / view.z, w = (text.length * 6.1 + 10) * u, h = 16 * u;
  let a = angle;
  if (a > 90) a -= 180;
  if (a <= -90) a += 180;
  return `<g class="chip ${cls}" transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${a.toFixed(1)})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${2 * u}"/><text font-size="${11.5 * u}" dy="${4 * u}">${text}</text></g>`;
}
function dimLine(a, b, text, cls = '') {
  const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / l, d[0] / l], t = 4 / view.z;
  return `<g class="dim ${cls}">${ln(a, b, 'dl')}${ln(add(a, n, t), add(a, n, -t), 'dl')}${ln(add(b, n, t), add(b, n, -t), 'dl')}</g>` + chip([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], text, deg(Math.atan2(d[1], d[0])), cls);
}

export function render() {
  if (!svg || app.view !== '2d') return;
  const st = app.state, S = D.structure(), u = 1 / view.z;
  const wallsMode = app.tool === 'walls' || app.tool === 'draw';
  // ett rum i taget: bara det rummets golv, väggbitar och möbler ritas
  const F = D.focus(), rooms = F ? [F.room] : S.rooms;
  const fid = F ? app.ui.focus : null;
  if (fitFor !== fid) { fitFor = fid; fit(); return; }
  svg.dataset.tool = app.tool;
  svg.classList.toggle('overlay', app.ui.overlay);

  L.floor.innerHTML = rooms.map((r) => `<polygon class="floor${isSel('room', r.id) ? ' sel' : ''}" data-kind="room" data-id="${r.id}" points="${pts(r.poly)}" fill="${(FLOORS[r.floor] || FLOORS.fiskben).c2d}"/>`).join('');
  L.img.innerHTML = app.ui.overlay && st.image ? `<image href="planritning.png" x="${st.image.x}" y="${st.image.y}" width="${st.image.w}" height="${st.image.h}" preserveAspectRatio="none"/>` : '';

  // väggar
  let w = '';
  const shown = [];
  for (const g of S.list) {
    const fw = F && F.walls.get(g.w.id);
    if (F && !(g.virtual ? F.dividers.has(g.w.id) : fw)) continue;
    shown.push(g);
    const sel = isSel('wall', g.w.id) ? ' sel' : '';
    // i väggläget ritas hela väggen, så att handtagen sitter där väggen faktiskt slutar
    if (fw && !wallsMode) w += `<polygon class="wall${sel}" data-kind="wall" data-id="${g.w.id}" points="${pts(fw.poly)}"/>`;
    else if (g.virtual) w += `<g data-kind="wall" data-id="${g.w.id}">${ln(g.a, g.b, 'vhit')}${ln(g.a, g.b, 'vwall' + sel)}</g>`;
    else w += `<polygon class="wall${sel}" data-kind="wall" data-id="${g.w.id}" points="${pts(g.poly)}"/>`;
  }
  L.walls.innerHTML = w;

  // dörrar, fönster och öppningar
  let o = '';
  for (const g of S.real) {
    const fw = F && F.walls.get(g.w.id);
    if (F && !fw) continue;
    for (const x of g.ops) {
      const op = x.o, h = g.w.t / 2;
      if (fw && !wallsMode && (op.pos < fw.s0 || op.pos > fw.s1)) continue;
      const p0 = add(g.a, g.u, x.s0), p1 = add(g.a, g.u, x.s1);
      o += `<g class="op ${op.type}${isSel('opening', op.id) ? ' sel' : ''}" data-kind="opening" data-id="${op.id}"><polygon class="gap" points="${pts(x.poly)}"/>`;
      o += ln(add(p0, g.n, h), add(p0, g.n, -h), 'jamb') + ln(add(p1, g.n, h), add(p1, g.n, -h), 'jamb');
      if (op.type === 'window') {
        o += ln(add(p0, g.n, h), add(p1, g.n, h), 'jamb') + ln(add(p0, g.n, -h), add(p1, g.n, -h), 'jamb');
        o += ln(add(p0, g.n, h * 0.22), add(p1, g.n, h * 0.22), 'glass') + ln(add(p0, g.n, -h * 0.22), add(p1, g.n, -h * 0.22), 'glass');
      } else if (op.type === 'door') {
        const sg = op.side === -1 ? -1 : 1;
        const hp = add(op.hinge ? p1 : p0, g.n, sg * h), fp = add(op.hinge ? p0 : p1, g.n, sg * h);
        const W = dist(hp, fp), le = add(hp, g.n, sg * W);
        const cr = (le[0] - hp[0]) * (fp[1] - hp[1]) - (le[1] - hp[1]) * (fp[0] - hp[0]);
        o += ln(hp, le, 'leaf') + `<path class="swing" d="M${le[0].toFixed(1)} ${le[1].toFixed(1)}A${W.toFixed(1)} ${W.toFixed(1)} 0 0 ${cr > 0 ? 1 : 0} ${fp[0].toFixed(1)} ${fp[1].toFixed(1)}"/>`;
      }
      o += '</g>';
    }
  }
  L.open.innerHTML = o;

  // möbler
  const bad = D.collisions();
  // högre upp ritas överst; den markerade möbeln vinner bara över andra på samma höjd,
  // så att lampan på bordet går att ta tag i även när bordet är markerat
  const rank = (m) => (D.isRug(m) ? -1000 : (m.elev || 0)) + (isSel('item', m.id) ? 0.5 : 0);
  let it = '', lab = '';
  for (const m of st.items.filter(D.inFocus).sort((a, b) => rank(a) - rank(b))) {
    const cls = ['item', 's-' + shapeOf(m)];
    if (isSel('item', m.id)) cls.push('sel');
    if (bad.has(m.id)) cls.push('bad');
    if (m.locked) cls.push('locked');
    it += `<g class="${cls.join(' ')}" data-kind="item" data-id="${m.id}" transform="translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${m.rot})">${draw2d(m)}</g>`;
    if (m.d < 12 || D.isRug(m)) continue;
    const r = (m.rot * Math.PI) / 180, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
    const ex = m.w * c + m.d * s, ey = m.w * s + m.d * c;
    const tw = m.name.length * 5.6 * u + 8 * u, th = 15 * u;
    const lc = `ilabel${m.locked ? ' fx' : ''}`;
    if (tw < ex && th < ey) lab += `<text class="${lc}" x="${m.x.toFixed(1)}" y="${m.y.toFixed(1)}" font-size="${10.5 * u}" dy="${3.6 * u}">${esc(m.name)}</text>`;
    else if (tw < ey && th < ex) lab += `<text class="${lc}" font-size="${10.5 * u}" dy="${3.6 * u}" transform="translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(-90)">${esc(m.name)}</text>`;
  }
  L.items.innerHTML = it;

  // rumsnamn och ytor
  for (const r of rooms) {
    lab += `<text class="rname" x="${r.label[0].toFixed(1)}" y="${r.label[1].toFixed(1)}" font-size="${13 * u}">${esc(r.name)}</text>`;
    lab += `<text class="rarea" x="${r.label[0].toFixed(1)}" y="${(r.label[1] + 15 * u).toFixed(1)}" font-size="${11.5 * u}">${fmt(r.area, 1)} m²</text>`;
  }
  L.labels.innerHTML = lab;

  // mått
  let dm = '';
  if (app.ui.dims) {
    for (const r of rooms) for (const d of r.dims) {
      if (d.len * view.z < 46) continue;
      const off = 13 * u;
      dm += dimLine(add(d.a, d.n, off), add(d.b, d.n, off), `${fmt(d.len)}`, 'room');
    }
  }
  const selItem = app.sel?.kind === 'item' && find(app.sel);
  let ed = '';
  if (selItem && app.tool === 'select') {
    for (const c of D.clearances(selItem)) dm += dimLine(c.from, c.to, `${fmt(c.dist)}`, 'free');
    if (!selItem.locked) {
      const top = rotPt(0, -selItem.d / 2, selItem.rot), hp = rotPt(0, -selItem.d / 2 - 26 * u, selItem.rot);
      const a = [selItem.x + top[0], selItem.y + top[1]], b = [selItem.x + hp[0], selItem.y + hp[1]];
      ed += ln(a, b, 'rotline') + `<circle class="rothandle" data-kind="rot" cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="${6.5 * u}"/>`;
    }
  }
  L.dims.innerHTML = dm;

  // väggredigering
  if (wallsMode) {
    const selWall = app.sel?.kind === 'wall' && S.geoms.get(app.sel.id);
    if (selWall) ed += chip(add(add(selWall.a, selWall.u, selWall.len / 2), selWall.n, selWall.w.t / 2 + 14 * u), `${fmt(selWall.len)} cm`, deg(Math.atan2(selWall.u[1], selWall.u[0])), 'wallen');
    const ends = shown.flatMap((g) => [g.a, g.b]);
    for (const j of D.joints()) if (!F || ends.some((q) => dist(q, j) < D.JOIN_EPS)) ed += `<circle class="joint" data-kind="joint" cx="${j[0].toFixed(1)}" cy="${j[1].toFixed(1)}" r="${5 * u}"/>`;
    if (app.tool === 'draw' && drawStart) {
      const q = hover ? snapDraw(hover) : drawStart;
      ed += ln(drawStart, q, 'preview') + `<circle class="joint on" cx="${drawStart[0]}" cy="${drawStart[1]}" r="${5 * u}"/>`;
      if (dist(drawStart, q) > 10) ed += chip([(drawStart[0] + q[0]) / 2, (drawStart[1] + q[1]) / 2 - 14 * u], `${fmt(dist(drawStart, q))} cm`, 0, 'wallen');
    }
  }
  L.edit.innerHTML = ed;

  // mätverktyget
  let ms = '';
  if (app.tool === 'measure' && app.measure.length) {
    const [a, b] = app.measure;
    const q = b || (hover ? snapMeasure(hover) : null);
    ms += `<circle class="mpt" cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="${4 * u}"/>`;
    if (q) {
      ms += dimLine(a, q, `${fmt(dist(a, q))} cm`, 'measure');
      if (b) ms += `<circle class="mpt" cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="${4 * u}"/>`;
    }
  }
  L.measure.innerHTML = ms;
}

// ---------- Mus ----------
function onDown(e) {
  if (e.button === 2) return;
  const p = toWorld(e);
  const t = e.target.closest?.('[data-kind]');
  const kind = t?.dataset.kind;
  const id = t?.dataset.id != null && !isNaN(+t.dataset.id) ? +t.dataset.id : t?.dataset.id;
  svg.setPointerCapture(e.pointerId);
  const base = { sx: e.clientX, sy: e.clientY, p0: p, moved: false };
  const pan = (click) => ({ ...base, type: 'pan', cx: view.cx, cy: view.cy, click });
  if (e.button === 1 || space) { drag = pan(); return; }

  if (app.tool === 'measure') {
    drag = pan(() => {
      const q = snapMeasure(p);
      app.measure = app.measure.length >= 2 ? [q] : [...app.measure, q];
      emit('tool');
    });
  } else if (app.tool === 'draw') {
    drag = pan(() => drawClick(p));
  } else if (app.tool === 'walls') {
    if (kind === 'joint') {
      const j = [+t.getAttribute('cx'), +t.getAttribute('cy')];
      const ends = [], others = [];
      for (const w of app.state.walls) {
        for (const end of ['a', 'b']) {
          const q = [w[end + 'x'], w[end + 'y']];
          if (dist(q, j) < D.JOIN_EPS) ends.push({ w, end }); else others.push(q);
        }
      }
      drag = { ...base, type: 'joint', ends, others, ops: absOps(ends.map((x) => x.w)) };
    } else if (kind === 'opening') {
      select({ kind: 'opening', id });
      drag = { ...base, type: 'opening', id };
    } else if (kind === 'wall') {
      select({ kind: 'wall', id });
      drag = startWallDrag(base, id);
    } else {
      drag = pan(() => select(null));
    }
  } else {
    if (kind === 'rot') {
      drag = { ...base, type: 'rot', id: app.sel.id, riders: D.riders(find(app.sel)) };
    } else if (kind === 'item') {
      select({ kind: 'item', id });
      const m = find({ kind: 'item', id });
      drag = m.locked ? pan() : { ...base, type: 'item', id, dx: p[0] - m.x, dy: p[1] - m.y, riders: e.shiftKey ? D.sofaGroup(m) : D.riders(m) };
    } else if (kind === 'room') {
      drag = pan(() => select({ kind: 'room', id }));
    } else {
      drag = pan(() => select(null));
    }
  }
}

function onMove(e) {
  const p = toWorld(e);
  hover = p;
  if (!drag) {
    if ((app.tool === 'draw' && drawStart) || (app.tool === 'measure' && app.measure.length === 1)) render();
    return;
  }
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
  drag.moved = true;
  const st = app.state;
  if (drag.type === 'pan') {
    view.cx = drag.cx - (e.clientX - drag.sx) / view.z;
    view.cy = drag.cy - (e.clientY - drag.sy) / view.z;
    applyView();
  } else if (drag.type === 'item') {
    const m = find({ kind: 'item', id: drag.id });
    D.dragItem(m, Math.round(p[0] - drag.dx), Math.round(p[1] - drag.dy), e.altKey, drag.riders);
    emit('live');
  } else if (drag.type === 'rot') {
    const m = find({ kind: 'item', id: drag.id });
    let a = deg(Math.atan2(p[1] - m.y, p[0] - m.x)) + 90;
    const near = Math.round(a / 15) * 15;
    a = Math.abs(a - near) < 5 && !e.altKey ? near : Math.round(a);
    D.rotateItem(m, a, drag.riders);
    emit('live');
  } else if (drag.type === 'joint') {
    const q = snapJoint(p, drag);
    for (const { w, end } of drag.ends) { w[end + 'x'] = q[0]; w[end + 'y'] = q[1]; }
    reproject(drag.ops);
    emit('live');
  } else if (drag.type === 'wall') {
    const k = Math.round((p[0] - drag.p0[0]) * drag.n[0] + (p[1] - drag.p0[1]) * drag.n[1]);
    for (const r of drag.recs) {
      // grannväggen behåller sin ände om något annat sitter fast i biten som annars skulle försvinna
      const keep = r.slide && k * r.slide.sign > 0 && Math.abs(k) >= r.slide.attach - 3;
      r.w[r.end + 'x'] = keep ? r.x : r.x + drag.n[0] * k;
      r.w[r.end + 'y'] = keep ? r.y : r.y + drag.n[1] * k;
    }
    reproject(drag.ops);
    emit('live');
  } else if (drag.type === 'opening') {
    const op = st.openings.find((x) => x.id === drag.id), g = D.structure().geoms.get(op.wall);
    const s = (p[0] - g.a[0]) * g.u[0] + (p[1] - g.a[1]) * g.u[1];
    op.pos = Math.round(clamp(s, op.w / 2, Math.max(op.w / 2, g.len - op.w / 2)));
    emit('live');
  }
}

function onUp(e) {
  try { svg.releasePointerCapture(e.pointerId); } catch { /* redan släppt */ }
  const d = drag;
  drag = null;
  if (!d) return;
  if (!d.moved) d.click?.();
  else if (d.type !== 'pan') commit();
}

function onWheel(e) {
  e.preventDefault();
  const r = svg.getBoundingClientRect();
  zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0018)));
}

// ---------- Väggredigering ----------
function absOps(walls) {
  const ids = new Set(walls.map((w) => w.id));
  return app.state.openings.filter((o) => ids.has(o.wall)).map((o) => {
    const w = app.state.walls.find((x) => x.id === o.wall);
    const len = Math.hypot(w.bx - w.ax, w.by - w.ay) || 1;
    return { o, c: [w.ax + ((w.bx - w.ax) / len) * o.pos, w.ay + ((w.by - w.ay) / len) * o.pos] };
  });
}
function reproject(ops) {
  for (const { o, c } of ops) {
    const w = app.state.walls.find((x) => x.id === o.wall);
    const len = Math.hypot(w.bx - w.ax, w.by - w.ay);
    const r = segParam(c, [w.ax, w.ay], [w.bx, w.by]);
    o.pos = clamp(r.t * len, o.w / 2, Math.max(o.w / 2, len - o.w / 2));
  }
}
function startWallDrag(base, id) {
  const st = app.state, w = st.walls.find((x) => x.id === id);
  const a = [w.ax, w.ay], b = [w.bx, w.by], len = dist(a, b) || 1;
  const n = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
  const recs = [{ w, end: 'a', x: w.ax, y: w.ay }, { w, end: 'b', x: w.bx, y: w.by }];
  for (const o of st.walls) {
    if (o === w) continue;
    for (const end of ['a', 'b']) {
      const q = [o[end + 'x'], o[end + 'y']];
      const r = segParam(q, a, b);
      if (r.d >= D.JOIN_EPS) continue;
      const far = end === 'a' ? [o.bx, o.by] : [o.ax, o.ay];
      const ol = dist(q, far) || 1, along = ((far[0] - q[0]) * n[0] + (far[1] - q[1]) * n[1]) / ol;
      let slide = null;
      if ((dist(q, a) < D.JOIN_EPS || dist(q, b) < D.JOIN_EPS) && Math.abs(along) > 0.98) {
        let attach = Infinity;
        for (const t of st.walls) {
          if (t === o || t === w) continue;
          for (const e2 of ['a', 'b']) {
            const r2 = segParam([t[e2 + 'x'], t[e2 + 'y']], q, far);
            if (r2.d < D.JOIN_EPS && r2.t > 0.01 && r2.t < 0.99) attach = Math.min(attach, r2.t * ol);
          }
        }
        slide = { sign: Math.sign(along), attach };
      }
      recs.push({ w: o, end, x: q[0], y: q[1], slide });
    }
  }
  return { ...base, type: 'wall', n, recs, ops: absOps([...new Set(recs.map((r) => r.w))]) };
}
function snapJoint(p, d) {
  let x = Math.round(p[0]), y = Math.round(p[1]);
  const tol = 9 / view.z;
  for (const { w, end } of d.ends) {
    const ox = end === 'a' ? w.bx : w.ax, oy = end === 'a' ? w.by : w.ay;
    if (Math.abs(x - ox) < tol) x = ox;
    if (Math.abs(y - oy) < tol) y = oy;
  }
  for (const j of d.others) if (dist(j, [x, y]) < tol) return [j[0], j[1]];
  return [x, y];
}
function snapDraw(p) {
  const tol = 9 / view.z;
  for (const j of D.joints()) if (dist(j, p) < tol) return [j[0], j[1]];
  let q = [Math.round(p[0]), Math.round(p[1])];
  if (drawStart) {
    if (Math.abs(q[0] - drawStart[0]) < tol * 1.5) q[0] = drawStart[0];
    if (Math.abs(q[1] - drawStart[1]) < tol * 1.5) q[1] = drawStart[1];
  }
  for (const w of app.state.walls) {
    const r = segParam(q, [w.ax, w.ay], [w.bx, w.by]);
    if (r.d < tol && r.t > 0 && r.t < 1) return [Math.round(r.q[0] * 10) / 10, Math.round(r.q[1] * 10) / 10];
  }
  return q;
}
function drawClick(p) {
  const q = snapDraw(p);
  if (!drawStart) { drawStart = q; render(); return; }
  if (dist(drawStart, q) < 8) { drawStart = null; render(); return; }
  app.state.walls.push({ id: newId(), ax: drawStart[0], ay: drawStart[1], bx: q[0], by: q[1], t: 12, kind: 'inner' });
  drawStart = q;
  commit();
}
/** Esc: avbryt pågående vägg. Ger true om något avbröts. */
export function cancelDraw() {
  if (app.tool === 'draw' && drawStart) { drawStart = null; render(); return true; }
  if (app.tool === 'draw' || app.tool === 'measure') { setTool(app.tool === 'draw' ? 'walls' : 'select'); return true; }
  return false;
}
function snapMeasure(p) {
  const tol = 8 / view.z;
  let best = null;
  for (const s of D.structure().solids) {
    for (let i = 0; i < 4; i++) {
      const r = segParam(p, s.poly[i], s.poly[(i + 1) % 4]);
      if (r.d < tol && (!best || r.d < best.d)) best = r;
    }
  }
  return best ? best.q : p;
}
