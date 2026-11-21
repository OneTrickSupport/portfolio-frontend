// Byggklossar för 3D-modellerna: material, lådor, cylindrar, stavar, svarvade former och blad.
// Mått i meter. Varje funktion lägger ett nät i gruppen `g` och ger tillbaka det.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const mats = new Map();
export function M(color, rough = 0.85, metal = 0, extra = null) {
  const key = `${color}|${rough}|${metal}|${extra ? JSON.stringify(extra) : ''}`;
  if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }));
  return mats.get(key);
}
export const shade = (hex, dl) => '#' + new THREE.Color(hex).offsetHSL(0, 0, dl).getHexString();

export function box(g, w, h, d, m, x = 0, y = 0, z = 0, r = 0) {
  w = Math.max(w, 0.002); h = Math.max(h, 0.002); d = Math.max(d, 0.002);
  const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const geo = rr > 0.004 ? new RoundedBoxGeometry(w, h, d, 3, rr) : new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(x, y, z);
  g.add(mesh);
  return mesh;
}
export function cyl(g, rt, rb, h, m, x = 0, y = 0, z = 0, seg = 28) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(rt, 0.0005), Math.max(rb, 0.0005), Math.max(h, 0.001), seg), m);
  mesh.position.set(x, y, z);
  g.add(mesh);
  return mesh;
}
/** Klot, hoptryckt eller utdraget med sx/sy/sz. */
export function sph(g, r, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, seg = 20) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(Math.max(r, 0.001), seg, Math.max(8, Math.round(seg * 0.7))), m);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  g.add(mesh);
  return mesh;
}
export function cone(g, r, h, m, x = 0, y = 0, z = 0, seg = 20) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(Math.max(r, 0.001), Math.max(h, 0.001), seg), m);
  mesh.position.set(x, y, z);
  g.add(mesh);
  return mesh;
}
const UP = new THREE.Vector3(0, 1, 0);
/** Rak stav från punkt a till punkt b. r = radie vid a, r2 = radie vid b. */
export function rod(g, a, b, r, m, r2 = r, seg = 10) {
  const va = new THREE.Vector3(...a), d = new THREE.Vector3(...b).sub(va), len = Math.max(d.length(), 0.001);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(r2, 0.0005), Math.max(r, 0.0005), len, seg), m);
  mesh.position.copy(va).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  g.add(mesh);
  return mesh;
}
/** Svarvad form: profilen [[radie, höjd], …] roteras runt y-axeln. */
export function lathe(g, pts, m, x = 0, y = 0, z = 0, seg = 28) {
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(Math.max(r, 0), h)), seg), m);
  mesh.position.set(x, y, z);
  g.add(mesh);
  return mesh;
}
/** Ring (eller del av ring). Ligger i xy-planet tills den vrids. */
export function torus(g, R, r, m, x = 0, y = 0, z = 0, arc = Math.PI * 2, seg = 28) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(R, r, 8, seg, arc), m);
  mesh.position.set(x, y, z);
  g.add(mesh);
  return mesh;
}
/**
 * Ett blad: en smal yta som växer ut från (x, y, z) åt hållet `yaw`, reser sig med vinkeln
 * `pitch` (radianer från vågrätt) och böjer sig nedåt med `droop`. `strap` ger ett jämnsmalt
 * gräsblad, annars ett löv som är bredast på mitten.
 */
export function blade(g, m, { len, wid, pitch = 1.2, droop = 0, yaw = 0, x = 0, y = 0, z = 0, fold = 0.25, strap = false, segs = 6 }) {
  const geo = new THREE.PlaneGeometry(wid, len, 2, segs), p = geo.attributes.position;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  for (let i = 0; i < p.count; i++) {
    const t = Math.min(1, Math.max(0, p.getY(i) / len + 0.5));
    const k = strap ? (1 - t * t * t) * (0.55 + 0.45 * Math.min(1, t * 4)) : Math.pow(Math.max(0, Math.sin(Math.PI * (0.07 + 0.93 * t))), 0.65);
    const lx = p.getX(i) * k, r = len * t;
    p.setXYZ(i, lx, r * sp - droop * len * t * t + Math.abs(lx) * fold, r * cp + 0.6 * droop * len * t * t);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(x, y, z);
  mesh.rotation.y = yaw;
  g.add(mesh);
  return mesh;
}
/** Slumptal som blir samma varje gång för samma frö (så att en möbel inte ändrar utseende). */
export function seeded(seed) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Målad yta (canvas) som material. `draw(ctx, storlek, slump)` ritar motivet. Sparas under `key`. */
const texMats = new Map();
export function painted(key, draw, { rough = 0.9, size = 256, emissive = null } = {}) {
  if (!texMats.has(key)) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    texMats.set(key, new THREE.MeshStandardMaterial({ map: t, roughness: rough, ...(emissive ? { emissive, emissiveIntensity: 0.25, emissiveMap: t } : {}) }));
  }
  return texMats.get(key);
}

export const DS = { side: THREE.DoubleSide };
export const WHITE = '#f4f3ef';
export const STEEL = M('#b9bec2', 0.35, 0.85), DARK = M('#26282b', 0.5, 0.2), GLASS = M('#101418', 0.12, 0.3);
export const WORKTOP = M('#d6d0c4', 0.5), CHROME = M('#d8dcdf', 0.2, 0.95), BRASS = M('#b08d57', 0.3, 0.9);
export const LEGWOOD = M('#3a2f27', 0.6), BLACKMETAL = M('#25272a', 0.45, 0.7);
export const CLEAR = M('#cfe6f2', 0.05, 0, { transparent: true, opacity: 0.28, depthWrite: false });
export const MIRROR = M('#cfdbe1', 0.06, 0.55);
export const GLOW = M('#f7ecd2', 0.9, 0, { emissive: '#ffd89a', emissiveIntensity: 0.6 });
export const FLAME = M('#ffb347', 0.6, 0, { emissive: '#ff8a1f', emissiveIntensity: 1.4 });
