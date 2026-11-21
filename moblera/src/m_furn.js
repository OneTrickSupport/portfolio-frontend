// 3D-modeller: sittmöbler, bord, stolar, sängar och förvaring.
// Varje funktion får möbeln (it) och dess mått i meter (W bredd, D djup, H höjd). −z är baksidan.

import * as THREE from 'three';
import { curveBand, curveGeom, def } from './catalog.js';
import { M, shade, box, cyl, sph, rod, lathe, torus, seeded, DS, WHITE, CHROME, BRASS, LEGWOOD, BLACKMETAL, CLEAR, MIRROR } from './kit.js';

const G = () => new THREE.Group();
const BOOKS = ['#7a5c4a', '#40566b', '#a8763e', '#5d6e58', '#e5dcc8', '#8b3d3a', '#2f3b46', '#c9b48e'];
const LINEN = '#e7e3da';

/** Fyra ben i hörnen. splay > 0 ger ben som spretar utåt. */
function legs4(g, W, D, h, m, { r = 0.016, inset = 0.05, splay = 0, sq = false } = {}) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (W / 2 - inset), z = sz * (D / 2 - inset);
    if (sq) box(g, r * 2, h, r * 2, m, x, h / 2, z, 0.004);
    else rod(g, [x + sx * splay, 0, z + sz * splay], [x, h, z], r * 0.75, m, r);
  }
}
/** En rad böcker på en hylla, från x0 till x1 med underkant y. */
function books(g, rnd, x0, x1, y, maxH, depth, z = 0) {
  let x = x0, n = 0;
  while (x < x1 - 0.03 && n < 9) {
    const bw = 0.025 + rnd() * 0.035;
    if (rnd() < 0.3 || x + bw > x1) { x += 0.08; continue; }
    const bh = Math.min(maxH, 0.17 + rnd() * 0.1);
    box(g, bw, bh, depth, M(BOOKS[Math.floor(rnd() * BOOKS.length)], 0.9), x + bw / 2, y + bh / 2, z);
    x += bw + 0.004;
    n++;
  }
}
/** Madrass, täcke och kuddar med ovankant på madrassen vid y0 + 0.2. */
function bedding(g, W, D, y0) {
  const white = M(WHITE, 0.95);
  box(g, W - 0.03, 0.2, D - 0.05, white, 0, y0 + 0.1, 0.01, 0.06);
  box(g, W + 0.01, 0.09, D * 0.62, M(LINEN, 1), 0, y0 + 0.205, D / 2 - D * 0.31 - 0.01, 0.045);
  const n = W >= 1.2 ? 2 : 1, pw = (W - 0.1 * (n + 1)) / n;
  for (let i = 0; i < n; i++) box(g, pw, 0.12, 0.4, white, -W / 2 + 0.1 + pw / 2 + i * (pw + 0.1), y0 + 0.255, -D / 2 + 0.33, 0.055).rotation.x = -0.12;
}

export const FURN = {
  // ---------- Sittmöbler ----------
  /** Soffmodul: sits, hörn, ändbit med arm, schäslong, puff eller löst armstöd. Hörnets extra rygg sitter till höger. */
  module(it, W, D, H) {
    const g = G(), dd = def(it), k = dd.kind, fab = M(it.color, 0.96), fab2 = M(shade(it.color, 0.035), 0.96);
    // low = sockel ända ner mot golvet (inga synliga ben); sh = sitthöjd i cm
    const legH = dd.low ? 0.03 : 0.09, b = Math.min(0.22, D * 0.3), a = 0.2, bodyH = H - legH, sh = (dd.sh || 46) / 100;
    const baseH = dd.low ? Math.max(0.12, sh - 0.2) : 0.2, top = legH + baseH, cush = Math.max(0.06, sh - top);
    if (!dd.low) legs4(g, W, D, legH, LEGWOOD, { r: 0.02, inset: Math.min(0.07, W * 0.3) });
    else box(g, W - 0.04, legH, D - 0.04, M('#2b2d30', 0.8), 0, legH / 2, 0);
    if (k === 'arm') { box(g, W, bodyH, D, fab, 0, legH + bodyH / 2, 0, 0.05); return g; }
    if (k === 'ottoman') { box(g, W, H - legH, D, fab, 0, legH + (H - legH) / 2, 0, 0.06); return g; }
    box(g, W, baseH, D, fab, 0, legH + baseH / 2, 0, 0.03);
    const arm = k === 'armL' ? -1 : k === 'armR' ? 1 : 0, side = k === 'corner';
    const x0 = -W / 2 + (arm < 0 ? a : 0), x1 = W / 2 - (arm > 0 ? a : 0) - (side ? b : 0), bh = Math.min(0.36, H - sh - 0.04);
    box(g, W, bodyH, b, fab, 0, legH + bodyH / 2, -D / 2 + b / 2, 0.05);
    if (side) box(g, b, bodyH, D, fab, W / 2 - b / 2, legH + bodyH / 2, 0, 0.05);
    if (arm) { const ah = Math.min(bodyH - 0.14, 0.55); box(g, a, ah, D, fab, arm * (W / 2 - a / 2), legH + ah / 2, 0, 0.05); }
    // en sittdyna per ungefär 75 cm, så att en 3-sits ser ut som en 3-sits
    const n = Math.max(1, Math.round((x1 - x0) / 0.75)), sw = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const xc = x0 + sw * (i + 0.5);
      box(g, sw - 0.012, cush, D - b - 0.01, fab2, xc, top + cush / 2, b / 2, 0.05);
      if (bh > 0.12) box(g, sw - 0.03, bh, 0.15, fab2, xc, sh + bh / 2, -D / 2 + b + 0.06, 0.06).rotation.x = -0.14;
    }
    if (side && bh > 0.12) box(g, 0.15, bh, D - b - 0.2, fab2, W / 2 - b - 0.06, sh + bh / 2, b / 2 + 0.08, 0.06).rotation.z = -0.14;
    return g;
  },
  /** Svängd soffmodul: samma uppbyggnad som de raka (sockel, sits, rygg, ryggkudde) men formad som en bit av en ring. */
  curve(it, W, D, H) {
    const g = G(), c = curveGeom(it), fab = M(it.color, 0.96), fab2 = M(shade(it.color, 0.035), 0.96);
    const slab = (r0, r1, y, h, m, a0 = 0, a1 = c.th, bevel = 0.012) => {
      const pts = curveBand(c, r0, r1, a0, a1, 0.09), s = new THREE.Shape();
      pts.forEach(([x, z], i) => (i ? s.lineTo(x / 100, -z / 100) : s.moveTo(x / 100, -z / 100)));
      const geo = new THREE.ExtrudeGeometry(s, bevel ? { depth: h - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelOffset: -bevel, bevelSegments: 2 } : { depth: h, bevelEnabled: false });
      const mesh = new THREE.Mesh(geo, m);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = y + bevel;
      g.add(mesh);
    };
    const dd = def(it), legH = dd.low ? 0.03 : 0.09, b = 22, bk = c.back, dir = c.out ? 1 : -1; // dir: från ryggen mot framkanten i radie
    const sh = (dd.sh || 46) / 100, baseH = dd.low ? Math.max(0.12, sh - 0.2) : 0.2, top = legH + baseH, cush = Math.max(0.06, sh - top);
    const backIn = bk + dir * b, bh = Math.min(0.36, H - sh - 0.04), e = 0.012 / (c.th || 1);
    slab(c.ri, c.ro, legH, baseH, fab);
    slab(Math.min(bk, backIn), Math.max(bk, backIn), legH, H - legH, fab, 0, c.th, 0.02);
    slab(Math.min(backIn, c.front), Math.max(backIn, c.front), top, cush, fab2, e, c.th - e, Math.min(0.03, cush / 3));
    if (bh > 0.12) slab(Math.min(backIn, backIn + dir * 15), Math.max(backIn, backIn + dir * 15), sh, bh, fab2, e * 2, c.th - e * 2, 0.035);
    if (!dd.low) for (const a of [0.06, c.th - 0.06]) for (const r of [c.ri + 7, c.ro - 7]) { const [x, z] = c.pt(r, Math.min(Math.max(a, 0.02), c.th - 0.02)); cyl(g, 0.02, 0.016, legH, LEGWOOD, x / 100, legH / 2, z / 100, 10); }
    return g;
  },
  chaise(it, W, D, H) {
    const g = G(), fab = M(it.color, 0.96), fab2 = M(shade(it.color, 0.035), 0.96);
    box(g, W, 0.2, D, fab, 0, 0.19, 0, 0.03);
    box(g, W - 0.02, 0.16, D - 0.22, fab2, 0, 0.37, 0.1, 0.05);
    box(g, W, H - 0.09, 0.2, fab, 0, 0.09 + (H - 0.09) / 2, -D / 2 + 0.1, 0.05);
    box(g, 0.16, 0.46, D * 0.45, fab, -W / 2 + 0.08, 0.32, -D / 2 + D * 0.225, 0.05);
    box(g, W - 0.3, 0.3, 0.14, fab2, 0.06, 0.6, -D / 2 + 0.27, 0.06).rotation.x = -0.2;
    legs4(g, W, D, 0.09, LEGWOOD, { r: 0.02, inset: 0.07 });
    return g;
  },
  daybed(it, W, D, H) {
    const g = G(), frame = M(it.color, 0.6);
    legs4(g, W, D, 0.2, frame, { r: 0.022, inset: 0.03, sq: true });
    box(g, W, 0.1, D, frame, 0, 0.25, 0);
    box(g, W - 0.08, 0.18, D - 0.06, M(LINEN, 1), 0, 0.39, 0.02, 0.05);
    box(g, W, H - 0.2, 0.04, frame, 0, 0.2 + (H - 0.2) / 2, -D / 2 + 0.02);
    for (const sx of [-1, 1]) box(g, 0.04, H - 0.2, D, frame, sx * (W / 2 - 0.02), 0.2 + (H - 0.2) / 2, 0);
    for (let i = -1; i <= 1; i++) box(g, 0.5, 0.36, 0.14, M(i ? '#c7b299' : '#8d9a8a', 1), i * 0.58, 0.62, -D / 2 + 0.14, 0.06).rotation.x = -0.2;
    return g;
  },
  lounge(it, W, D, H) {
    const g = G(), wood = M('#8a6240', 0.6), fab = M(it.color, 0.9);
    box(g, W - 0.14, 0.12, D - 0.2, fab, 0, 0.38, 0.04, 0.05).rotation.x = -0.08;
    box(g, W - 0.14, H - 0.4, 0.12, fab, 0, 0.42 + (H - 0.4) / 2, -D / 2 + 0.16, 0.05).rotation.x = -0.25;
    for (const sx of [-1, 1]) {
      const x = sx * (W / 2 - 0.03);
      box(g, 0.05, 0.03, D - 0.1, wood, x, 0.56, 0, 0.01);
      box(g, 0.04, 0.56, 0.04, wood, x, 0.28, D / 2 - 0.09);
      box(g, 0.04, 0.56, 0.04, wood, x, 0.28, -D / 2 + 0.09);
    }
    for (const sz of [-1, 1]) box(g, W - 0.06, 0.04, 0.04, wood, 0, 0.3, sz * (D / 2 - 0.09));
    return g;
  },
  swivel(it, W, D, H) {
    const g = G(), r = W / 2, cy = Math.max(r + 0.12, H - r);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), M(it.color, 0.9, 0, DS));
    shell.rotation.x = -1.92;
    shell.position.set(0, cy, 0);
    shell.scale.z = D / W;
    g.add(shell);
    const fab2 = M(shade(it.color, 0.06), 1);
    sph(g, r * 0.72, fab2, 0, cy - r * 0.42, 0.04, 1, 0.3, 0.9);
    sph(g, r * 0.62, fab2, 0, cy + 0.02, -r * 0.42 * (D / W), 1, 1, 0.3);
    cyl(g, 0.03, 0.03, cy - r * 0.8, CHROME, 0, (cy - r * 0.8) / 2, 0, 14);
    cyl(g, r * 0.62, r * 0.66, 0.025, CHROME, 0, 0.0125, 0, 32);
    return g;
  },
  rocking(it, W, D, H) {
    const g = G(), wood = M(it.color, 0.6), zb = -D * 0.2;
    box(g, W - 0.1, 0.035, D * 0.5, wood, 0, 0.42, 0.02, 0.012);
    for (let i = 0; i < 5; i++) {
      const x = ((i - 2) * (W - 0.2)) / 4;
      rod(g, [x, 0.43, zb], [x * 1.05, H - 0.04, zb - 0.14], 0.009, wood);
    }
    box(g, W - 0.1, 0.07, 0.025, wood, 0, H - 0.04, zb - 0.145, 0.01);
    for (const sx of [-1, 1]) {
      const x = sx * (W / 2 - 0.07);
      rod(g, [x, 0.05, D * 0.24], [x, 0.42, D * 0.22], 0.016, wood);
      rod(g, [x, 0.05, zb - 0.02], [x, 0.42, zb + 0.02], 0.016, wood);
      box(g, 0.04, 0.025, D * 0.5, wood, sx * (W / 2 - 0.05), 0.62, 0.01, 0.008);
      rod(g, [x, 0.43, D * 0.22], [x, 0.61, D * 0.23], 0.012, wood);
      const R = 1.25, a = (D * 0.98) / R;
      const rk = torus(g, R, 0.018, wood, x, R + 0.018, 0, a, 20);
      rk.rotation.set(0, Math.PI / 2, -Math.PI / 2 - a / 2);
    }
    return g;
  },
  pouf(it, W, D, H) {
    const g = G(), r = W / 2;
    const m = lathe(g, [[0, 0], [r * 0.8, 0], [r, H * 0.2], [r, H * 0.8], [r * 0.8, H], [0, H]], M(it.color, 1));
    m.scale.z = D / W;
    return g;
  },
  ottoman(it, W, D, H) {
    const g = G();
    legs4(g, W, D, 0.1, LEGWOOD, { r: 0.02, inset: 0.07 });
    box(g, W, H - 0.1, D, M(it.color, 0.96), 0, 0.1 + (H - 0.1) / 2, 0, 0.06);
    return g;
  },
  beanbag(it, W, D, H) {
    const g = G(), fab = M(it.color, 1);
    sph(g, W / 2, fab, 0, H * 0.42, 0, 1, (H * 0.84) / W, D / W, 24);
    sph(g, W * 0.3, fab, 0, H * 0.72, -D * 0.12, 1, 0.8, 1, 20);
    return g;
  },
  bench(it, W, D, H) {
    const g = G(), d = def(it), wood = M(it.color, 0.6);
    const sh = d.back ? 0.45 : H - 0.02 - (d.cushion ? 0.06 : 0);
    legs4(g, W, D, sh - 0.02, wood, { r: 0.022, inset: 0.04, sq: true });
    box(g, W, 0.04, D, wood, 0, sh, 0, 0.008);
    for (const sz of [-1, 1]) box(g, W - 0.12, 0.05, 0.02, wood, 0, sh - 0.045, sz * (D / 2 - 0.05));
    if (d.cushion) box(g, W - 0.02, 0.06, D - 0.02, M('#c7b299', 1), 0, sh + 0.05, 0, 0.025);
    if (d.shelf) box(g, W - 0.08, 0.02, D - 0.06, wood, 0, 0.14, 0);
    if (d.back) {
      for (const sx of [-1, 1]) box(g, 0.045, H, 0.045, wood, sx * (W / 2 - 0.0225), H / 2, -D / 2 + 0.0225);
      box(g, W - 0.06, H - 0.58, 0.03, wood, 0, 0.56 + (H - 0.58) / 2, -D / 2 + 0.02);
      box(g, W - 0.1, 0.06, D - 0.08, M('#b9ab97', 1), 0, sh + 0.05, 0.02, 0.025);
    }
    return g;
  },

  // ---------- Bord ----------
  table(it, W, D, H) {
    const g = G(), d = def(it);
    const top = d.glass ? M('#bcd6df', 0.05, 0, { transparent: true, opacity: 0.42 }) : M(it.color, 0.5);
    const leg = d.glass ? M(it.color, 0.4, 0.7) : M(shade(it.color, -0.1), 0.6);
    const t = Math.min(0.04, H * 0.1), s = H < 0.55 ? 0.04 : 0.055;
    box(g, W, d.glass ? 0.012 : t, D, top, 0, H - (d.glass ? 0.006 : t / 2), 0, 0.006);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, s, H - t, s, leg, sx * (W / 2 - s / 2 - 0.03), (H - t) / 2, sz * (D / 2 - s / 2 - 0.03), 0.008);
    if (H > 0.55 || d.glass) for (const sz of [-1, 1]) box(g, W - 0.16, d.glass ? 0.03 : 0.06, 0.02, leg, 0, H - t - 0.03, sz * (D / 2 - 0.06));
    if (d.shelf) box(g, W - 0.1, 0.02, D - 0.1, M(it.color, 0.5), 0, 0.12, 0);
    if (d.drawers) {
      const dw = Math.min(0.4, W * 0.3), body = M(shade(it.color, -0.03), 0.6);
      box(g, dw, H * 0.62, D - 0.08, body, W / 2 - dw / 2 - 0.02, H - t - H * 0.31, 0);
      for (let i = 0; i < 3; i++) {
        const y = H - t - 0.02 - (i + 0.5) * ((H * 0.62 - 0.02) / 3);
        box(g, dw - 0.012, (H * 0.62) / 3 - 0.012, 0.012, M(it.color, 0.55), W / 2 - dw / 2 - 0.02, y, D / 2 - 0.034);
        box(g, 0.1, 0.01, 0.014, CHROME, W / 2 - dw / 2 - 0.02, y + 0.03, D / 2 - 0.022);
      }
    }
    if (d.net) {
      box(g, W + 0.06, 0.15, 0.006, M('#20262b', 0.9, 0, { transparent: true, opacity: 0.6 }), 0, H + 0.075, 0);
      box(g, 0.012, 0.002, D, M('#f4f3ef', 0.6), 0, H + 0.001, 0);
    }
    return g;
  },
  roundtable(it, W, D, H) {
    const g = G(), d = def(it);
    const top = d.glass ? M('#bcd6df', 0.05, 0, { transparent: true, opacity: 0.42 }) : M(it.color, d.marble ? 0.25 : 0.5);
    const leg = d.metal ? BLACKMETAL : M(shade(it.color, -0.1), 0.6);
    const sc = G();
    sc.scale.z = D / W;
    g.add(sc);
    cyl(sc, W / 2, W / 2, 0.03, top, 0, H - 0.015, 0, 48);
    if (d.legs) {
      for (let i = 0; i < d.legs; i++) {
        const a = (i / d.legs) * Math.PI * 2 + 0.5;
        rod(sc, [Math.cos(a) * W * 0.42, 0, Math.sin(a) * W * 0.42], [Math.cos(a) * W * 0.3, H - 0.03, Math.sin(a) * W * 0.3], 0.012, leg, 0.018);
      }
    } else {
      cyl(sc, W * 0.3, W * 0.32, 0.025, leg, 0, 0.0125, 0, 40);
      cyl(g, 0.035, 0.045, H - 0.05, leg, 0, H / 2, 0, 20);
    }
    return g;
  },
  nest(it, W, D, H) {
    const g = G(), top = M(it.color, 0.45), leg = BLACKMETAL;
    const one = (r, h, x, z) => {
      cyl(g, r, r, 0.022, top, x, h - 0.011, z, 40);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.4;
        rod(g, [x + Math.cos(a) * r * 0.85, 0, z + Math.sin(a) * r * 0.85], [x + Math.cos(a) * r * 0.7, h - 0.02, z + Math.sin(a) * r * 0.7], 0.008, leg);
      }
    };
    const r1 = Math.min(D / 2, W * 0.36), r2 = r1 * 0.68;
    one(r1, H, -W / 2 + r1, 0);
    one(r2, H * 0.8, W / 2 - r2, D / 2 - r2);
    return g;
  },
  vanitytable(it, W, D, H) {
    const g = G(), body = M(it.color, 0.55), th = Math.min(0.76, H * 0.6);
    box(g, W, 0.03, D, body, 0, th - 0.015, 0, 0.006);
    box(g, W - 0.08, 0.11, D - 0.05, body, 0, th - 0.085, 0);
    for (const sx of [-1, 1]) sph(g, 0.012, BRASS, sx * W * 0.22, th - 0.085, D / 2 - 0.02);
    legs4(g, W, D, th - 0.14, body, { r: 0.018, inset: 0.05, splay: 0.02 });
    const r = Math.min(W * 0.28, (H - th - 0.06) / 2);
    cyl(g, r, r, 0.012, MIRROR, 0, th + r + 0.05, -D / 2 + 0.05, 40).rotation.x = Math.PI / 2;
    torus(g, r, 0.012, BRASS, 0, th + r + 0.05, -D / 2 + 0.05, Math.PI * 2, 40);
    cyl(g, 0.012, 0.012, 0.06, BRASS, 0, th + 0.03, -D / 2 + 0.05, 10);
    return g;
  },
  standdesk(it, W, D, H) {
    const g = G(), frame = M('#e6e6e3', 0.5, 0.3);
    box(g, W, 0.028, D, M(it.color, 0.5), 0, H - 0.014, 0, 0.006);
    for (const sx of [-1, 1]) {
      const x = sx * (W / 2 - 0.2);
      box(g, 0.08, H - 0.05, 0.05, frame, x, (H - 0.05) / 2 + 0.01, 0, 0.006);
      box(g, 0.08, 0.025, D * 0.85, frame, x, 0.0125, 0, 0.006);
    }
    box(g, W - 0.4, 0.04, 0.03, frame, 0, H - 0.07, 0);
    return g;
  },

  // ---------- Stolar ----------
  chair(it, W, D, H) {
    const g = G(), k = def(it).kind, m = M(it.color, 0.6), sh = Math.min(0.45, H * 0.55);
    if (k === 'spindle') {
      box(g, W - 0.02, 0.035, D - 0.08, m, 0, sh, 0.02, 0.016);
      legs4(g, W - 0.04, D - 0.1, sh - 0.015, m, { r: 0.014, inset: 0.05, splay: 0.035 });
      for (let i = 0; i < 6; i++) {
        const x = ((i - 2.5) * (W - 0.12)) / 5;
        rod(g, [x, sh, -D / 2 + 0.08], [x * 1.08, H - 0.03, -D / 2 + 0.01], 0.007, m);
      }
      box(g, W - 0.02, 0.05, 0.025, m, 0, H - 0.03, -D / 2 + 0.01, 0.012);
    } else if (k === 'padded') {
      const fab = M(it.color, 0.98);
      legs4(g, W, D, sh - 0.05, LEGWOOD, { r: 0.016, inset: 0.05, splay: 0.02 });
      box(g, W, 0.09, D - 0.06, fab, 0, sh - 0.01, 0.02, 0.035);
      box(g, W - 0.02, H - sh - 0.02, 0.07, fab, 0, sh + (H - sh) / 2, -D / 2 + 0.07, 0.03).rotation.x = -0.1;
    } else if (k === 'shell') {
      const wood = M('#b98d5e', 0.6), pl = M(it.color, 0.4);
      legs4(g, W - 0.06, D - 0.1, sh - 0.01, wood, { r: 0.012, inset: 0.05, splay: 0.05 });
      box(g, W, 0.03, D - 0.08, pl, 0, sh, 0.03, 0.014);
      box(g, W - 0.02, H - sh, 0.03, pl, 0, sh + (H - sh) / 2 - 0.01, -D / 2 + 0.07, 0.014).rotation.x = -0.16;
    } else {
      box(g, W - 0.02, 0.035, D - 0.06, m, 0, sh, 0.02, 0.012);
      for (const sx of [-1, 1]) {
        cyl(g, 0.015, 0.012, sh, m, sx * (W / 2 - 0.04), sh / 2, D / 2 - 0.06, 10);
        cyl(g, 0.015, 0.012, H, m, sx * (W / 2 - 0.04), H / 2, -D / 2 + 0.04, 10);
      }
      box(g, W - 0.06, Math.min(0.2, H * 0.24), 0.025, m, 0, H - 0.12, -D / 2 + 0.04, 0.01);
      if (k === 'arm') for (const sx of [-1, 1]) {
        box(g, 0.04, 0.025, D - 0.1, m, sx * (W / 2 - 0.03), sh + 0.2, 0, 0.008);
        cyl(g, 0.012, 0.012, 0.2, m, sx * (W / 2 - 0.04), sh + 0.1, D / 2 - 0.08, 8);
      }
    }
    return g;
  },
  stool(it, W, D, H) {
    const g = G(), d = def(it), m = M(it.color, 0.6), r = W / 2;
    cyl(g, r, r * 0.96, 0.035, m, 0, H - 0.0175, 0, 32);
    const n = d.ring ? 4 : 3, lm = d.ring ? BLACKMETAL : m;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.6;
      rod(g, [Math.cos(a) * r * 1.02, 0, Math.sin(a) * r * 1.02], [Math.cos(a) * r * 0.7, H - 0.03, Math.sin(a) * r * 0.7], 0.011, lm, 0.015);
    }
    if (d.ring) torus(g, r * 0.9, 0.008, BLACKMETAL, 0, H * 0.36, 0, Math.PI * 2, 28).rotation.x = Math.PI / 2;
    return g;
  },
  officechair(it, W, D, H) {
    const g = G(), gaming = def(it).kind === 'gaming', fab = M(it.color, 0.9), metal = M('#8f9498', 0.35, 0.8), dark = M('#26282b', 0.5, 0.2);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      rod(g, [0, 0.07, 0], [Math.cos(a) * W * 0.46, 0.05, Math.sin(a) * W * 0.46], 0.018, dark);
      sph(g, 0.028, dark, Math.cos(a) * W * 0.46, 0.028, Math.sin(a) * W * 0.46);
    }
    cyl(g, 0.025, 0.025, 0.38, metal, 0, 0.26, 0, 12);
    box(g, W * 0.78, 0.08, D * 0.76, fab, 0, 0.49, 0.02, 0.035);
    box(g, W * 0.72, H - 0.6, 0.07, fab, 0, 0.6 + (H - 0.6) / 2, -D / 2 + 0.1, 0.03).rotation.x = -0.1;
    if (gaming) {
      const acc = M('#c8362e', 0.8);
      for (const sx of [-1, 1]) {
        box(g, 0.05, H - 0.66, 0.075, acc, sx * W * 0.33, 0.62 + (H - 0.66) / 2, -D / 2 + 0.1, 0.02).rotation.x = -0.1;
        box(g, 0.06, 0.03, D * 0.4, dark, sx * W * 0.42, 0.68, 0.02, 0.01);
        cyl(g, 0.012, 0.012, 0.16, dark, sx * W * 0.42, 0.59, 0.02, 8);
      }
      box(g, W * 0.34, 0.12, 0.06, acc, 0, H - 0.1, -D / 2 + 0.06, 0.03);
    }
    return g;
  },
  highchair(it, W, D, H) {
    const g = G(), wood = M('#b98d5e', 0.6), pl = M(it.color, 0.5), sh = Math.min(0.56, H * 0.62);
    legs4(g, W - 0.14, D - 0.14, sh, wood, { r: 0.014, inset: 0.03, splay: 0.07 });
    box(g, W * 0.6, 0.04, D * 0.55, pl, 0, sh + 0.02, 0, 0.015);
    box(g, W * 0.6, H - sh - 0.04, 0.035, pl, 0, sh + (H - sh) / 2, -D * 0.27, 0.015).rotation.x = -0.1;
    box(g, W * 0.74, 0.025, D * 0.32, pl, 0, sh + 0.2, D * 0.3, 0.01);
    box(g, W * 0.5, 0.02, 0.08, wood, 0, sh * 0.5, D * 0.3);
    return g;
  },

  // ---------- Sängar ----------
  bed(it, W, D, H) {
    const g = G(), k = def(it).kind, frame = M(it.color, k ? 0.6 : 0.95);
    if (!k) {
      legs4(g, W, D, 0.06, LEGWOOD, { r: 0.025, inset: 0.08 });
      box(g, W, 0.26, D, frame, 0, 0.19, 0, 0.03);
      bedding(g, W, D, 0.32);
      box(g, W + 0.04, H, 0.08, frame, 0, H / 2, -D / 2 + 0.04, 0.03);
      return g;
    }
    const metal = k === 'metal', post = metal ? 0.036 : 0.07, hh = k === 'canopy' ? 1.05 : H;
    for (const sx of [-1, 1]) {
      box(g, 0.03, metal ? 0.05 : 0.16, D - 0.06, frame, sx * (W / 2 - 0.015), 0.3, 0);
      const x = sx * (W / 2 - post / 2);
      box(g, post, k === 'canopy' ? H : hh, post, frame, x, (k === 'canopy' ? H : hh) / 2, -D / 2 + post / 2, 0.006);
      box(g, post, k === 'canopy' ? H : Math.min(0.55, hh * 0.6), post, frame, x, (k === 'canopy' ? H : Math.min(0.55, hh * 0.6)) / 2, D / 2 - post / 2, 0.006);
    }
    box(g, W - 0.04, 0.03, D - 0.08, M('#b9ab97', 0.9), 0, 0.3, 0);
    bedding(g, W - 0.06, D - 0.08, 0.31);
    const zb = -D / 2 + post / 2, zf = D / 2 - post / 2, fh = Math.min(0.55, hh * 0.6);
    if (metal) {
      rod(g, [-W / 2 + 0.02, hh - 0.02, zb], [W / 2 - 0.02, hh - 0.02, zb], 0.016, frame);
      rod(g, [-W / 2 + 0.02, fh - 0.02, zf], [W / 2 - 0.02, fh - 0.02, zf], 0.016, frame);
      const n = Math.max(4, Math.round(W / 0.2));
      for (let i = 1; i < n; i++) {
        const x = -W / 2 + (i * W) / n;
        rod(g, [x, 0.3, zb], [x, hh - 0.02, zb], 0.007, frame);
        rod(g, [x, 0.3, zf], [x, fh - 0.02, zf], 0.007, frame);
      }
    } else {
      box(g, W - post * 2, 0.1, 0.03, frame, 0, hh - 0.07, zb);
      box(g, W - post * 2, hh - 0.5, 0.02, frame, 0, 0.3 + (hh - 0.5) / 2, zb);
      box(g, W - post * 2, fh - 0.28, 0.025, frame, 0, 0.22 + (fh - 0.28) / 2, zf);
    }
    if (k === 'canopy') {
      for (const sz of [zb, zf]) box(g, W, post, post, frame, 0, H - post / 2, sz);
      for (const sx of [-1, 1]) box(g, post, post, D, frame, sx * (W / 2 - post / 2), H - post / 2, 0);
    }
    return g;
  },
  bunk(it, W, D, H) {
    const g = G(), loft = def(it).loft, frame = M(it.color, 0.6), p = 0.06, top = H - 0.42;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, p, H, p, frame, sx * (W / 2 - p / 2), H / 2, sz * (D / 2 - p / 2), 0.006);
    for (const y of loft ? [top] : [0.28, top]) {
      box(g, W - 0.02, 0.12, D - 0.02, frame, 0, y, 0);
      box(g, W - p * 2 - 0.02, 0.12, D - p * 2 - 0.02, M(WHITE, 0.95), 0, y + 0.11, 0, 0.04);
      box(g, W * 0.6, 0.09, 0.34, M(LINEN, 1), 0, y + 0.2, -D / 2 + 0.26, 0.04);
      box(g, W - p * 2, 0.09, D * 0.58, M(y === top ? '#6f7f8c' : '#a3554a', 1), 0, y + 0.19, D / 2 - D * 0.29 - p, 0.04);
    }
    for (const sx of [-1, 1]) box(g, 0.025, 0.1, sx > 0 ? D * 0.62 : D - p * 2, frame, sx * (W / 2 - 0.0125), top + 0.3, sx > 0 ? -D / 2 + p + D * 0.31 : 0);
    for (const sz of [-1, 1]) box(g, W - p * 2, 0.1, 0.025, frame, 0, top + 0.3, sz * (D / 2 - 0.0125));
    const lx = W / 2 + 0.012, z0 = D / 2 - 0.42;
    for (const dz of [0, 0.34]) box(g, 0.025, top + 0.34, 0.04, frame, lx, (top + 0.34) / 2, z0 + dz);
    for (let i = 1; i <= 4; i++) box(g, 0.025, 0.03, 0.34, frame, lx, (i * top) / 4.4, z0 + 0.17);
    if (loft) box(g, W - 0.1, 0.03, 0.55, M(shade(it.color, -0.04), 0.6), 0, 0.74, -D / 2 + 0.33);
    return g;
  },
  crib(it, W, D, H) {
    const g = G(), frame = M(it.color, 0.55), p = 0.045, base = 0.42;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, p, H, p, frame, sx * (W / 2 - p / 2), H / 2, sz * (D / 2 - p / 2), 0.008);
    box(g, W - 0.02, 0.04, D - 0.02, frame, 0, base, 0);
    box(g, W - p * 2, 0.1, D - p * 2, M(WHITE, 0.95), 0, base + 0.07, 0, 0.03);
    box(g, W - p * 2 - 0.04, 0.05, D * 0.5, M('#d9c9a8', 1), 0, base + 0.14, D * 0.18, 0.02);
    for (const sx of [-1, 1]) {
      const x = sx * (W / 2 - p / 2), n = Math.round(D / 0.085);
      box(g, 0.03, 0.035, D - p, frame, x, H - 0.0175, 0);
      for (let i = 1; i < n; i++) cyl(g, 0.007, 0.007, H - base, frame, x, base + (H - base) / 2, -D / 2 + (i * D) / n, 6);
    }
    for (const sz of [-1, 1]) {
      const z = sz * (D / 2 - p / 2), n = Math.round(W / 0.085);
      box(g, W - p, 0.035, 0.03, frame, 0, H - 0.0175, z);
      for (let i = 1; i < n; i++) cyl(g, 0.007, 0.007, H - base, frame, -W / 2 + (i * W) / n, base + (H - base) / 2, z, 6);
    }
    return g;
  },

  // ---------- Förvaring ----------
  drawers(it, W, D, H) {
    const g = G(), d = def(it), rows = d.rows || 3, cols = d.cols || 1;
    const body = M(it.color, 0.6), front = M(shade(it.color, 0.02), 0.55);
    const legH = d.legs === 'none' ? 0 : d.legs === 'plinth' ? 0.06 : Math.min(0.14, H * 0.16);
    box(g, W, H - legH, D - 0.012, body, 0, legH + (H - legH) / 2, -0.006, 0.006);
    box(g, W + 0.012, 0.018, D + 0.006, M(shade(it.color, -0.04), 0.5), 0, H - 0.009, 0, 0.004);
    const fh = (H - legH - 0.03) / rows, fw = (W - 0.02) / cols;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = -W / 2 + 0.01 + fw * (c + 0.5), y = legH + 0.006 + fh * (r + 0.5);
      box(g, fw - 0.006, fh - 0.006, 0.014, front, x, y, D / 2 - 0.007, 0.003);
      if (d.brass) { for (const sx of fw > 0.5 ? [-1, 1] : [0]) sph(g, 0.013, BRASS, x + sx * fw * 0.28, y, D / 2 + 0.01); }
      else if (d.knob) sph(g, 0.014, M(shade(it.color, -0.3), 0.6), x, y, D / 2 + 0.01);
      else box(g, Math.min(0.16, fw * 0.4), 0.01, 0.016, CHROME, x, y + fh * 0.2, D / 2 + 0.008);
    }
    if (d.legs === 'plinth') box(g, W - 0.04, 0.06, D - 0.06, M('#26282b', 0.5), 0, 0.03, -0.01);
    else if (d.legs === 'bun') for (const sx of [-1, 1]) for (const sz of [-1, 1]) sph(g, 0.04, body, sx * (W / 2 - 0.06), legH * 0.5, sz * (D / 2 - 0.06), 1, legH / 0.08, 1);
    else if (d.wheels) for (const sx of [-1, 1]) for (const sz of [-1, 1]) sph(g, legH * 0.45, M('#26282b', 0.5), sx * (W / 2 - 0.05), legH * 0.45, sz * (D / 2 - 0.06));
    else if (legH) legs4(g, W, D, legH, LEGWOOD, { r: 0.018, inset: 0.05, splay: 0.012 });
    return g;
  },
  doors(it, W, D, H) {
    const g = G(), d = def(it), body = M(it.color, 0.6), front = M(shade(it.color, 0.02), 0.55), seam = M(shade(it.color, -0.25), 0.8);
    const legH = H > 1.5 ? 0.07 : H < 0.6 ? 0.09 : 0.13, n = d.doors || Math.max(1, Math.round(W / 0.5));
    const y0 = legH, bh = H - legH;
    if (H > 1.5) box(g, W - 0.03, legH, D - 0.05, M(shade(it.color, -0.08), 0.6), 0, legH / 2, -0.01);
    else legs4(g, W, D, legH, LEGWOOD, { r: 0.018, inset: 0.05, splay: 0.012 });
    if (d.glass) {
      const t = 0.022, low = Math.min(0.6, bh * 0.3), rnd = seeded(it.id || 5);
      box(g, W, bh, 0.01, M(shade(it.color, -0.04), 0.7), 0, y0 + bh / 2, -D / 2 + 0.005);
      for (const sx of [-1, 1]) box(g, t, bh, D, body, sx * (W / 2 - t / 2), y0 + bh / 2, 0);
      box(g, W + 0.03, 0.035, D + 0.02, body, 0, H - 0.0175, 0.005, 0.006);
      box(g, W - 0.002, low, D - 0.004, body, 0, y0 + low / 2, 0);
      const ns = Math.max(2, Math.round((bh - low) / 0.36));
      for (let j = 1; j <= ns; j++) {
        const y = y0 + low + ((j - 1) * (bh - low - 0.04)) / ns;
        if (j > 1) box(g, W - t * 2, 0.012, D - 0.03, M('#cfe6f2', 0.1, 0, { transparent: true, opacity: 0.45 }), 0, y, 0);
        const k = 2 + Math.floor(rnd() * 3);
        for (let i = 0; i < k; i++) {
          const x = -W / 2 + 0.1 + ((W - 0.2) * (i + 0.5)) / k, col = ['#e9e6e0', '#b9cbd6', '#c7b299', '#8d9a8a', '#d9a441'][Math.floor(rnd() * 5)];
          if (rnd() < 0.5) lathe(g, [[0, 0], [0.03, 0], [0.045, 0.06], [0.02, 0.12], [0.028, 0.15]], M(col, 0.4), x, y + 0.008, -0.02, 14);
          else cyl(g, 0.055, 0.04, 0.05, M(col, 0.4), x, y + 0.033, -0.02, 18);
        }
      }
      for (let i = 0; i < n; i++) {
        const dw = W / n, x = -W / 2 + dw * (i + 0.5), gy = y0 + low + (bh - low - 0.035) / 2, gh = bh - low - 0.035;
        box(g, dw - 0.07, gh - 0.07, 0.006, CLEAR, x, gy, D / 2 - 0.008);
        for (const sx of [-1, 1]) box(g, 0.035, gh, 0.02, front, x + sx * (dw / 2 - 0.0175), gy, D / 2 - 0.01);
        for (const sy of [-1, 1]) box(g, dw, 0.035, 0.02, front, x, gy + sy * (gh / 2 - 0.0175), D / 2 - 0.01);
        box(g, dw - 0.006, low - 0.006, 0.014, front, x, y0 + low / 2, D / 2 + 0.005, 0.003);
        sph(g, 0.012, BRASS, x + (i % 2 ? -1 : 1) * (dw / 2 - 0.05), y0 + low * 0.7, D / 2 + 0.02);
        sph(g, 0.012, BRASS, x + (i % 2 ? -1 : 1) * (dw / 2 - 0.05), gy, D / 2 + 0.012);
      }
      return g;
    }
    box(g, W, bh, D - 0.012, body, 0, y0 + bh / 2, -0.006, 0.006);
    box(g, W + 0.012, 0.018, D + 0.006, M(shade(it.color, -0.04), 0.5), 0, H - 0.009, 0, 0.004);
    const dr = d.drawerRow ? Math.min(0.16, bh * 0.25) : 0, dh = bh - 0.03 - dr, dw = (W - 0.02) / n;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.01 + dw * (i + 0.5);
      if (d.open && i === Math.floor(n / 2)) {
        box(g, dw - 0.01, dh - 0.01, 0.004, M('#26282b', 0.8), x, y0 + 0.006 + dh / 2, D / 2 - 0.004);
        box(g, dw - 0.02, 0.012, 0.03, body, x, y0 + 0.006 + dh / 2, D / 2 - 0.015);
      } else {
        box(g, dw - 0.006, dh - 0.006, 0.014, front, x, y0 + 0.006 + dh / 2, D / 2 - 0.007, 0.003);
        if (H < 0.6) box(g, 0.12, 0.01, 0.016, CHROME, x, y0 + dh - 0.03, D / 2 + 0.008);
        else box(g, 0.012, Math.min(0.2, dh * 0.3), 0.018, CHROME, x + (i % 2 ? -1 : 1) * (dw / 2 - 0.04), y0 + dh * (H > 1.5 ? 0.5 : 0.62), D / 2 + 0.009);
      }
      if (dr) {
        box(g, dw - 0.006, dr - 0.006, 0.014, front, x, y0 + 0.006 + dh + dr / 2, D / 2 - 0.007, 0.003);
        box(g, 0.12, 0.01, 0.016, CHROME, x, y0 + 0.006 + dh + dr / 2, D / 2 + 0.008);
      }
    }
    if (H > 1.5) box(g, W - 0.02, 0.004, 0.003, seam, 0, y0 + bh * 0.42, D / 2 + 0.001);
    return g;
  },
  wardrobe(it, W, D, H) {
    const g = G(), sliding = def(it).kind === 'sliding', body = M(it.color, 0.55), seam = M(shade(it.color, -0.25), 0.8);
    box(g, W, H, sliding ? D - 0.04 : D, body, 0, H / 2, sliding ? -0.02 : 0, 0.004);
    if (sliding) {
      const n = Math.max(2, Math.round(W / 0.9)), pw = W / n;
      for (let i = 0; i < n; i++) {
        const x = -W / 2 + pw * (i + 0.5), z = D / 2 - 0.03 + (i % 2 ? 0.018 : 0);
        box(g, pw + (i % 2 ? 0.03 : 0), H - 0.1, 0.016, i === 1 ? MIRROR : M(shade(it.color, 0.02), 0.5), x, H / 2, z);
        for (const sx of [-1, 1]) box(g, 0.02, H - 0.1, 0.022, CHROME, x + sx * (pw / 2 - 0.01), H / 2, z);
      }
      box(g, W, 0.05, 0.05, body, 0, H - 0.025, D / 2 - 0.025);
      box(g, W, 0.05, 0.05, body, 0, 0.025, D / 2 - 0.025);
      return g;
    }
    const n = Math.max(1, Math.round(W / 0.5));
    for (let i = 0; i < n; i++) {
      const x0 = -W / 2 + (i * W) / n;
      if (i) box(g, 0.004, H - 0.02, 0.003, seam, x0, H / 2, D / 2);
      box(g, 0.012, 0.16, 0.022, CHROME, x0 + (i % 2 ? 0.045 : W / n - 0.045), Math.min(1.05, H * 0.5), D / 2 + 0.012);
    }
    return g;
  },
  shelf(it, W, D, H) {
    const g = G(), cube = def(it).cube, body = M(it.color, 0.6), t = cube ? 0.035 : 0.02, rnd = seeded(it.id || 7);
    const nSec = Math.max(1, Math.round(W / (cube ? 0.36 : 0.8))), nSh = Math.max(1, Math.round(H / 0.36)), base = cube ? t / 2 : 0.06;
    if (!cube) box(g, W, H, 0.008, M(shade(it.color, -0.05), 0.7), 0, H / 2, -D / 2 + 0.004);
    for (let i = 0; i <= nSec; i++) box(g, t, H, D, body, -W / 2 + t / 2 + (i * (W - t)) / nSec, H / 2, 0);
    for (let j = 0; j <= nSh; j++) box(g, W, t, D, body, 0, Math.min(H - t / 2, base + (j * (H - base - t / 2)) / nSh), 0);
    const gap = (H - base - t / 2) / nSh;
    for (let i = 0; i < nSec; i++) for (let j = 0; j < nSh; j++) {
      const x0 = -W / 2 + t + (i * (W - t)) / nSec, x1 = -W / 2 + ((i + 1) * (W - t)) / nSec, y = base + t / 2 + j * gap;
      if (cube) {
        const k = rnd();
        if (k < 0.3) box(g, x1 - x0 - 0.02, gap - t - 0.03, D - 0.04, M(['#c7b299', '#8d9a8a', '#6f7f8c', '#e7e3da'][Math.floor(rnd() * 4)], 1), (x0 + x1) / 2, y + (gap - t - 0.03) / 2, 0.01, 0.01);
        else if (k < 0.7) books(g, rnd, x0 + 0.012, x1 - 0.012, y, gap - t - 0.05, D * 0.7, 0.01);
      } else books(g, rnd, x0 + 0.015, x1 - 0.02, y, gap - 0.05, D * 0.7, 0.01);
    }
    return g;
  },
  laddershelf(it, W, D, H) {
    const g = G(), frame = M(it.color, 0.5, 0.3), wood = M('#c9a67a', 0.6), rnd = seeded(it.id || 9);
    const zAt = (y) => D / 2 - 0.03 - ((D - 0.06) * y) / H;
    for (const sx of [-1, 1]) rod(g, [sx * (W / 2 - 0.015), 0, zAt(0)], [sx * (W / 2 - 0.015), H, zAt(H)], 0.014, frame, 0.014, 6);
    for (let i = 0; i < 4; i++) {
      const y = 0.22 + (i * (H - 0.5)) / 3, dp = zAt(y) + 0.03 + D / 2;
      box(g, W - 0.05, 0.022, dp, wood, 0, y, -D / 2 + dp / 2);
      if (i < 3) books(g, rnd, -W / 2 + 0.06, W * 0.1, y + 0.011, 0.24, Math.min(0.16, dp * 0.7), -D / 2 + dp / 2);
    }
    lathe(g, [[0, 0], [0.05, 0], [0.07, 0.1], [0.06, 0.11]], M('#b9735a', 0.8), W * 0.26, 0.233, -D / 2 + 0.16, 16);
    sph(g, 0.09, M('#5c7d55', 1, 0, { flatShading: true }), W * 0.26, 0.4, -D / 2 + 0.16, 1, 0.9, 1, 8);
    return g;
  },
  wallshelf(it, W, D, H) {
    const g = G(), tiers = def(it).tiers || 1, wood = M(it.color, 0.6), rnd = seeded(it.id || 11);
    for (let i = 0; i < tiers; i++) {
      const y = tiers === 1 ? 0.0125 : 0.02 + (i * (H - 0.26)) / (tiers - 1);
      box(g, W, 0.025, D, wood, 0, y, 0, 0.004);
      books(g, rnd, -W / 2 + 0.04, i % 2 ? W / 2 - 0.05 : W * 0.12, y + 0.0125, 0.2, D * 0.7, 0);
      if (!(i % 2)) lathe(g, [[0, 0], [0.035, 0], [0.05, 0.07], [0.022, 0.15], [0.03, 0.18]], M(['#e9e6e0', '#b9cbd6', '#d9a441'][i % 3], 0.4), W * 0.3, y + 0.0125, 0, 14);
    }
    if (tiers > 1) for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.005, 0.005, H, BLACKMETAL, sx * (W / 2 - 0.006), H / 2, sz * (D / 2 - 0.02), 6);
    else for (const sx of [-1, 1]) box(g, 0.02, 0.012, D * 0.8, BLACKMETAL, sx * W * 0.32, -0.004, 0);
    return g;
  },
  shoerack(it, W, D, H) {
    const g = G(), frame = M(it.color, 0.5, 0.4), rnd = seeded(it.id || 13), n = Math.max(2, Math.round(H / 0.22));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.009, 0.009, H, frame, sx * (W / 2 - 0.01), H / 2, sz * (D / 2 - 0.01), 8);
    for (let j = 0; j < n; j++) {
      const y = 0.06 + (j * (H - 0.1)) / (n - 0.6);
      box(g, W - 0.02, 0.012, D - 0.02, M('#c9a67a', 0.6), 0, y, 0);
      const k = Math.max(1, Math.floor(W / 0.26));
      for (let i = 0; i < k; i++) {
        if (rnd() < 0.2) continue;
        const col = M(['#2f3336', '#7b5b45', '#f2f1ec', '#a3554a', '#6f7f8c'][Math.floor(rnd() * 5)], 0.7), x = -W / 2 + ((i + 0.5) * W) / k;
        for (const dx of [-0.05, 0.05]) sph(g, 0.045, col, x + dx, y + 0.045, 0.01, 1, 0.9, Math.min(2.6, (D - 0.06) / 0.09), 12);
      }
    }
    return g;
  },
  clothesrail(it, W, D, H) {
    const g = G(), m = M(it.color, 0.45, 0.6), rnd = seeded(it.id || 15);
    for (const sx of [-1, 1]) {
      const x = sx * (W / 2 - 0.02);
      box(g, 0.03, 0.03, D, m, x, 0.015, 0);
      cyl(g, 0.012, 0.012, H, m, x, H / 2, 0, 10);
    }
    rod(g, [-W / 2 + 0.02, H - 0.012, 0], [W / 2 - 0.02, H - 0.012, 0], 0.012, m);
    box(g, W - 0.06, 0.018, D * 0.8, M('#c9a67a', 0.6), 0, 0.14, 0);
    const n = Math.max(3, Math.round(W / 0.16));
    for (let i = 0; i < n; i++) {
      const len = 0.65 + rnd() * 0.4, col = ['#4a5560', '#8a6f52', '#2f3336', '#e7e3da', '#8d9a8a', '#a3554a', '#6f7f8c'][Math.floor(rnd() * 7)];
      box(g, 0.045, len, D * 0.82, M(col, 1), -W / 2 + 0.1 + ((W - 0.2) * i) / (n - 1), H - 0.07 - len / 2, 0, 0.02);
    }
    return g;
  },
  coatstand(it, W, D, H) {
    const g = G(), m = M(it.color, 0.5, 0.3), r = W / 2;
    cyl(g, r * 0.7, r * 0.75, 0.03, m, 0, 0.015, 0, 28);
    cyl(g, 0.016, 0.02, H - 0.03, m, 0, H / 2, 0, 12);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2, y = H - 0.12 - (i % 2) * 0.16;
      rod(g, [0, y, 0], [Math.cos(a) * r * 0.75, y + 0.1, Math.sin(a) * r * 0.75], 0.008, m);
      sph(g, 0.014, m, Math.cos(a) * r * 0.75, y + 0.1, Math.sin(a) * r * 0.75);
    }
    box(g, 0.08, 0.85, 0.3, M('#4a5560', 1), r * 0.45, H - 0.52, 0, 0.035);
    sph(g, 0.11, M('#8a6f52', 1), -r * 0.5, H - 0.02, r * 0.3, 1, 0.55, 1, 16);
    return g;
  },
  trunk(it, W, D, H) {
    const g = G(), m = M(it.color, 0.7), bh = H * 0.62;
    box(g, W, bh, D, m, 0, bh / 2, 0, 0.012);
    const lid = cyl(g, D / 2, D / 2, W, m, 0, bh, 0, 24);
    lid.rotation.z = Math.PI / 2;
    lid.scale.x = (H - bh) / (D / 2);
    for (const sx of [-1, 1]) box(g, 0.04, bh + 0.004, D + 0.008, M(shade(it.color, -0.14), 0.7), sx * W * 0.3, bh / 2, 0);
    box(g, 0.07, 0.07, 0.014, BRASS, 0, bh - 0.02, D / 2 + 0.006, 0.006);
    return g;
  },
  basket(it, W, D, H) {
    const g = G(), r = W / 2, sc = G(), d = def(it);
    sc.scale.z = D / W;
    g.add(sc);
    lathe(sc, [[0, 0], [r * 0.78, 0], [r, H], [r * 0.93, H], [r * 0.73, 0.02], [0, 0.02]], M(it.color, 1, 0, DS));
    torus(sc, r * 0.965, 0.014, M(shade(it.color, -0.08), 1), 0, H, 0, Math.PI * 2, 28).rotation.x = Math.PI / 2;
    if (!d.empty) sph(sc, r * 0.82, M(d.fill || LINEN, 1), 0, H * 0.86, 0, 1, 0.34, 1, 16);
    return g;
  },
  cart(it, W, D, H) {
    const g = G(), d = def(it), m = M(it.color, 0.45, 0.4), rnd = seeded(it.id || 17);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(g, 0.008, 0.008, H - 0.06, m, sx * (W / 2 - 0.012), 0.06 + (H - 0.06) / 2, sz * (D / 2 - 0.012), 8);
      sph(g, 0.028, M('#26282b', 0.5), sx * (W / 2 - 0.012), 0.028, sz * (D / 2 - 0.012));
    }
    const ys = [0.13, H * 0.52, H - 0.07];
    for (const y of ys) {
      box(g, W, 0.012, D, m, 0, y, 0);
      for (const sz of [-1, 1]) box(g, W, 0.045, 0.008, m, 0, y + 0.028, sz * (D / 2 - 0.004));
      for (const sx of [-1, 1]) box(g, 0.008, 0.045, D, m, sx * (W / 2 - 0.004), y + 0.028, 0);
    }
    if (d.bar) {
      for (let i = 0; i < 4; i++) {
        const x = -W / 2 + 0.09 + i * ((W - 0.18) / 3), c = M(['#3f5a3a', '#6b3a2a', '#d9dde0', '#2f3336'][i], 0.25);
        cyl(g, 0.036, 0.036, 0.2, c, x, ys[2] + 0.106, -D * 0.12, 14);
        cyl(g, 0.012, 0.03, 0.09, c, x, ys[2] + 0.25, -D * 0.12, 12);
      }
      for (let i = 0; i < 3; i++) cyl(g, 0.03, 0.022, 0.08, CLEAR, -W * 0.25 + i * W * 0.2, ys[1] + 0.046, 0, 12);
    } else {
      for (const y of ys) for (let i = 0; i < 2; i++) box(g, W * 0.3, 0.07 + rnd() * 0.08, D * 0.6, M(['#e7e3da', '#c7b299', '#8d9a8a', '#b9cbd6'][Math.floor(rnd() * 4)], 1), (i ? 1 : -1) * W * 0.2, y + 0.06, 0, 0.01);
    }
    return g;
  },
};
