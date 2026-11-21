// 3D-modeller: TV och ljud, instrument, arbetsplats, kök, badrum, hall, barnrum, träning, balkong och övrigt.

import * as THREE from 'three';
import { def } from './catalog.js';
import { M, shade, box, cyl, sph, rod, lathe, torus, seeded, painted, DS, STEEL, DARK, GLASS, CHROME, BRASS, BLACKMETAL, CLEAR, MIRROR } from './kit.js';
import { FURN } from './m_furn.js';

const G = () => new THREE.Group();
const TAU = Math.PI * 2;
const RUBBER = M('#1d1f21', 0.9);
const keys = () => painted('keys', (c, S) => {
  c.fillStyle = '#f8f6f0';
  c.fillRect(0, 0, S, S);
  c.strokeStyle = '#8d9296';
  c.lineWidth = 1;
  for (let i = 0; i <= 36; i++) { c.beginPath(); c.moveTo((i * S) / 36, 0); c.lineTo((i * S) / 36, S); c.stroke(); }
  c.fillStyle = '#17191b';
  for (let i = 0; i < 36; i++) if (![2, 6].includes(i % 7)) c.fillRect(((i + 0.68) * S) / 36, 0, (S / 36) * 0.64, S * 0.6);
}, { rough: 0.35 });
/** Hjul som rullar längs z-axeln. */
function wheel(g, r, t, m, x, y, z) {
  const w = cyl(g, r, r, t, m, x, y, z, 20);
  w.rotation.z = Math.PI / 2;
  return w;
}
function screen(g, W, H, x, y, z, glow = false) {
  box(g, W, H, 0.03, M('#17191b', 0.4, 0.3), x, y, z, 0.006);
  box(g, W - 0.02, H - 0.02, 0.003, glow ? M('#2c4a6e', 0.2, 0, { emissive: '#3b6ea8', emissiveIntensity: 0.5 }) : GLASS, x, y, z + 0.016);
}

export const MISC = {
  // ---------- TV, ljud och musik ----------
  tvstand(it, W, D, H) {
    const g = G(), wood = M(it.color, 0.6), sh = Math.min(0.84, H * 0.6);
    rod(g, [-W * 0.22, 0, D / 2 - 0.04], [-W * 0.06, H - 0.1, -D * 0.1], 0.016, wood);
    rod(g, [W * 0.22, 0, D / 2 - 0.04], [W * 0.06, H - 0.1, -D * 0.1], 0.016, wood);
    rod(g, [0, 0, -D / 2 + 0.03], [0, H - 0.2, -D * 0.1], 0.016, wood);
    box(g, W * 0.5, 0.02, D * 0.4, wood, 0, 0.28, D * 0.1);
    screen(g, W, sh, 0, H - sh / 2, -D * 0.02);
    return g;
  },
  speaker(it, W, D, H) {
    const g = G(), tall = H > 0.6;
    box(g, W, H - (tall ? 0.03 : 0), D, M(it.color, 0.5), 0, (H + (tall ? 0.03 : 0)) / 2, 0, 0.012);
    if (tall) box(g, W + 0.04, 0.03, D + 0.04, DARK, 0, 0.015, 0, 0.006);
    const n = tall ? 3 : 2, rr = Math.min(W * 0.36, (H / n) * 0.36);
    for (let i = 0; i < n; i++) {
      const y = H - (H * (i + 0.6)) / (n + 0.4), r = i ? rr : rr * 0.45;
      cyl(g, r, r, 0.01, M('#2b2d30', 0.7), 0, y, D / 2 + 0.003, 24).rotation.x = Math.PI / 2;
      sph(g, r * 0.32, M('#16181a', 0.4), 0, y, D / 2 + 0.004, 1, 1, 0.4, 12);
    }
    return g;
  },
  soundbar(it, W, D, H) {
    const g = G();
    box(g, W, H, D, M(it.color, 0.6), 0, H / 2, 0, Math.min(0.02, H * 0.3));
    box(g, W - 0.04, H * 0.7, 0.004, M('#3a3d40', 1), 0, H / 2, D / 2 + 0.001);
    return g;
  },
  turntable(it, W, D, H) {
    const g = G(), r = Math.min(W, D) * 0.36;
    box(g, W, H * 0.45, D, M(it.color, 0.5), 0, H * 0.225, 0, 0.008);
    cyl(g, r, r, 0.012, STEEL, -W * 0.08, H * 0.45 + 0.006, 0, 36);
    cyl(g, r * 0.95, r * 0.95, 0.004, M('#141516', 0.35), -W * 0.08, H * 0.45 + 0.014, 0, 36);
    cyl(g, r * 0.3, r * 0.3, 0.005, M('#c8362e', 0.6), -W * 0.08, H * 0.45 + 0.015, 0, 20);
    cyl(g, 0.014, 0.014, 0.03, CHROME, W * 0.36, H * 0.45 + 0.015, -D * 0.3, 10);
    rod(g, [W * 0.36, H * 0.45 + 0.03, -D * 0.3], [W * 0.1, H * 0.45 + 0.022, D * 0.12], 0.004, CHROME);
    box(g, W - 0.01, H * 0.5, D - 0.01, CLEAR, 0, H * 0.72, 0);
    return g;
  },
  monitor(it, W, D, H) {
    const g = G(), sh = H * 0.72;
    box(g, W * 0.36, 0.012, D * 0.9, M(it.color, 0.4, 0.5), 0, 0.006, 0, 0.004);
    box(g, 0.04, H - sh * 0.5, 0.025, M(it.color, 0.4, 0.5), 0, (H - sh * 0.5) / 2, -D * 0.2);
    screen(g, W, sh, 0, H - sh / 2, -D * 0.05, true);
    return g;
  },
  laptop(it, W, D, H) {
    const g = G(), al = M(it.color, 0.35, 0.7);
    box(g, W, 0.014, D, al, 0, 0.007, 0, 0.004);
    box(g, W - 0.04, 0.002, D * 0.52, M('#26282b', 0.6), 0, 0.015, -D * 0.1);
    const lid = G();
    lid.position.set(0, 0.014, -D / 2 + 0.006);
    lid.rotation.x = -0.3;
    g.add(lid);
    box(lid, W, H - 0.015, 0.008, al, 0, (H - 0.015) / 2, 0, 0.003);
    box(lid, W - 0.016, H - 0.035, 0.002, M('#2c4a6e', 0.2, 0, { emissive: '#3b6ea8', emissiveIntensity: 0.5 }), 0, (H - 0.015) / 2, 0.005);
    return g;
  },
  printer(it, W, D, H) {
    const g = G(), m = M(it.color, 0.5);
    box(g, W, H, D, m, 0, H / 2, 0, 0.015);
    box(g, W * 0.7, 0.01, D * 0.4, M('#fbfbf9', 0.8), 0, H * 0.3, D / 2 + 0.03).rotation.x = 0.15;
    box(g, W * 0.8, 0.01, 0.06, DARK, 0, H * 0.42, D / 2 + 0.001);
    box(g, W * 0.3, 0.006, D * 0.2, DARK, W * 0.25, H + 0.002, D * 0.2);
    return g;
  },
  piano(it, W, D, H) {
    const g = G(), d = def(it), m = M(it.color, 0.18), bd = D * 0.5;
    if (d.kind === 'digital') {
      for (const sx of [-1, 1]) box(g, 0.03, H - 0.1, D, m, sx * (W / 2 - 0.015), (H - 0.1) / 2, 0);
      box(g, W - 0.06, H * 0.45, 0.02, m, 0, H * 0.45, -D / 2 + 0.03);
      box(g, W, 0.11, D, m, 0, H - 0.055, 0, 0.01);
      box(g, W - 0.1, 0.012, D * 0.42, keys(), 0, H - 0.0, D * 0.24);
      box(g, 0.24, 0.03, 0.12, m, 0, 0.05, D * 0.1);
      return g;
    }
    box(g, W, H, bd, m, 0, H / 2, -D / 2 + bd / 2, 0.012);
    box(g, W - 0.04, 0.09, D - bd + 0.02, m, 0, 0.7, -D / 2 + bd + (D - bd) / 2 - 0.01, 0.01);
    box(g, W - 0.14, 0.014, (D - bd) * 0.8, keys(), 0, 0.752, D / 2 - (D - bd) * 0.42);
    for (const sx of [-1, 1]) {
      box(g, 0.06, 0.66, 0.06, m, sx * (W / 2 - 0.05), 0.33, D / 2 - 0.05, 0.01);
      box(g, 0.035, 0.012, 0.09, BRASS, sx * 0.07, 0.07, -D / 2 + bd + 0.04);
    }
    box(g, W * 0.5, 0.012, 0.2, m, 0, 1.0, -D / 2 + bd + 0.02).rotation.x = -1.2;
    return g;
  },
  grandpiano(it, W, D, H) {
    const g = G(), m = M(it.color, 0.15), kb = 0.26, y0 = H - 0.32;
    const s = new THREE.Shape(), f = -D / 2 + kb, b = D / 2;
    s.moveTo(-W / 2, f);
    s.lineTo(-W / 2, b - 0.35);
    s.quadraticCurveTo(-W / 2, b, -W / 2 + 0.36, b);
    s.bezierCurveTo(-W / 2 + 0.8, b, -W * 0.05, D * 0.12, W * 0.18, D * 0.02);
    s.quadraticCurveTo(W / 2, -D * 0.08, W / 2, f + 0.15);
    s.lineTo(W / 2, f);
    s.lineTo(-W / 2, f);
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.27, bevelEnabled: false, curveSegments: 20 }), m);
    body.rotation.x = -Math.PI / 2;
    body.position.y = y0;
    g.add(body);
    const lid = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.018, bevelEnabled: false, curveSegments: 20 }), m);
    lid.rotation.x = -Math.PI / 2;
    lid.position.y = y0 + 0.275;
    lid.scale.set(1.012, 1.012, 1);
    g.add(lid);
    box(g, W, 0.12, kb, m, 0, y0 + 0.02, D / 2 - kb / 2, 0.008);
    box(g, W - 0.12, 0.014, kb * 0.62, keys(), 0, y0 + 0.086, D / 2 - kb * 0.42);
    box(g, W, 0.1, 0.03, m, 0, y0 + 0.14, D / 2 - kb + 0.015);
    box(g, W * 0.5, 0.012, 0.22, m, 0, y0 + 0.4, D / 2 - kb - 0.05).rotation.x = -1.15;
    for (const [x, z] of [[-W / 2 + 0.14, D / 2 - kb - 0.08], [W / 2 - 0.14, D / 2 - kb - 0.08], [-W / 2 + 0.36, -D / 2 + 0.25]]) {
      rod(g, [x, 0.05, z], [x, y0, z], 0.03, m, 0.05, 10);
      sph(g, 0.03, BRASS, x, 0.03, z);
    }
    box(g, 0.2, 0.03, 0.1, m, 0, 0.06, D / 2 - kb - 0.06);
    for (const sx of [-1, 1]) rod(g, [sx * 0.07, 0.07, D / 2 - kb - 0.06], [sx * 0.07, y0, D / 2 - kb - 0.1], 0.012, m);
    return g;
  },
  guitar(it, W, D, H) {
    const g = G(), wood = M(it.color, 0.4), t = G();
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + Math.PI / 2; rod(g, [Math.cos(a) * W * 0.45, 0, Math.sin(a) * D * 0.45], [0, H * 0.32, 0], 0.008, BLACKMETAL); }
    rod(g, [0, H * 0.32, 0], [0, H * 0.72, -D * 0.25], 0.008, BLACKMETAL);
    t.position.set(0, 0.1, D * 0.1);
    t.rotation.x = -0.17;
    g.add(t);
    for (const [r, y] of [[0.19, 0.2], [0.15, 0.45]]) cyl(t, r, r, 0.09, wood, 0, y, 0, 28).rotation.x = Math.PI / 2;
    cyl(t, 0.045, 0.045, 0.004, M('#17191b', 0.8), 0, 0.36, 0.046, 20).rotation.x = Math.PI / 2;
    box(t, 0.05, H - 0.72, 0.025, M('#3a2f27', 0.5), 0, 0.56 + (H - 0.72) / 2, 0.035);
    box(t, 0.075, 0.16, 0.02, M('#3a2f27', 0.5), 0, H - 0.2, 0.03, 0.008);
    return g;
  },

  // ---------- Kök ----------
  wallcab(it, W, D, H) {
    const g = G(), n = Math.max(1, Math.round(W / 0.6));
    box(g, W, H, D - 0.014, M(it.color, 0.6), 0, H / 2, -0.007);
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + ((i + 0.5) * W) / n;
      box(g, W / n - 0.006, H - 0.006, 0.014, M(shade(it.color, 0.02), 0.55), x, H / 2, D / 2 - 0.007, 0.003);
      box(g, 0.012, 0.12, 0.016, CHROME, x + (i % 2 ? -1 : 1) * (W / n / 2 - 0.04), 0.1, D / 2 + 0.008);
    }
    return g;
  },
  hood(it, W, D, H) {
    const g = G(), m = M(it.color, 0.3, 0.8);
    box(g, W, 0.07, D, m, 0, 0.035, 0, 0.006);
    lathe(g, [[W * 0.5, 0], [0.13, 0.2]], M(it.color, 0.3, 0.8, DS), 0, 0.07, -D * 0.1, 4).rotation.y = Math.PI / 4;
    box(g, 0.24, H - 0.27, 0.22, m, 0, 0.27 + (H - 0.27) / 2, -D / 2 + 0.11);
    box(g, W * 0.5, 0.004, D * 0.5, DARK, 0, -0.001, 0);
    return g;
  },
  range(it, W, D, H) {
    const g = G(), m = M(it.color, 0.4, it.color === '#b9bec2' ? 0.7 : 0);
    box(g, W, H - 0.06, D - 0.02, m, 0, 0.06 + (H - 0.06) / 2, -0.01, 0.006);
    box(g, W - 0.04, 0.06, D - 0.1, DARK, 0, 0.03, -0.02);
    box(g, W - 0.08, H * 0.48, 0.012, GLASS, 0, H * 0.4, D / 2 - 0.004, 0.004);
    box(g, W - 0.14, 0.016, 0.03, CHROME, 0, H * 0.7, D / 2 + 0.018);
    box(g, W - 0.02, 0.008, D - 0.08, GLASS, 0, H + 0.004, -0.01, 0.003);
    for (let i = 0; i < 4; i++) cyl(g, 0.016, 0.016, 0.02, CHROME, -W / 2 + 0.09 + (i * (W - 0.18)) / 3, H * 0.86, D / 2, 12).rotation.x = Math.PI / 2;
    const r = Math.min(W, D) * 0.14;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, r, r, 0.002, M('#33373b', 0.3, 0.2), sx * W * 0.21, H + 0.009, sz * D * 0.19 - 0.01, 28);
    return g;
  },
  fridge(it, W, D, H) {
    const g = G(), k = def(it).kind, m = M(it.color, 0.35, 0.7);
    box(g, W, H, D - 0.02, m, 0, H / 2, -0.01, 0.012);
    if (k === 'double') {
      box(g, 0.006, H - 0.04, 0.004, DARK, 0, H / 2, D / 2 - 0.01);
      for (const sx of [-1, 1]) box(g, 0.018, H * 0.5, 0.03, CHROME, sx * 0.04, H * 0.55, D / 2 + 0.005);
      box(g, W * 0.22, 0.26, 0.006, DARK, -W * 0.25, H * 0.62, D / 2 - 0.008, 0.01);
    } else if (k === 'wine') {
      box(g, W - 0.08, H - 0.14, 0.01, M('#101418', 0.1, 0.3, { transparent: true, opacity: 0.75 }), 0, H / 2 + 0.02, D / 2 - 0.006, 0.004);
      const n = Math.max(3, Math.round(H / 0.14));
      for (let j = 1; j < n; j++) {
        box(g, W - 0.1, 0.008, 0.004, M('#b98d5e', 0.6), 0, 0.1 + ((H - 0.2) * j) / n, D / 2 - 0.012);
        for (let i = 0; i < 4; i++) cyl(g, 0.03, 0.03, 0.002, M('#1b2a1f', 0.3), -W / 2 + 0.12 + (i * (W - 0.24)) / 3, 0.1 + ((H - 0.2) * j) / n + 0.04, D / 2 - 0.013, 12).rotation.x = Math.PI / 2;
      }
      box(g, 0.016, H * 0.5, 0.026, CHROME, W / 2 - 0.05, H / 2, D / 2 + 0.008);
    } else if (k === 'single') {
      box(g, 0.018, H * 0.3, 0.03, CHROME, -W / 2 + 0.06, H * 0.55, D / 2 + 0.005);
    } else {
      box(g, W - 0.01, 0.006, 0.004, DARK, 0, H * 0.36, D / 2 - 0.01);
      for (const y of [H * 0.36 - 0.25, H * 0.36 + 0.3]) box(g, 0.018, 0.34, 0.03, CHROME, -W / 2 + 0.06, y, D / 2 + 0.005);
    }
    return g;
  },
  microwave(it, W, D, H) {
    const g = G();
    box(g, W, H, D, M(it.color, 0.4, 0.5), 0, H / 2, 0, 0.012);
    box(g, W * 0.66, H * 0.72, 0.006, GLASS, -W * 0.13, H / 2, D / 2 + 0.001, 0.006);
    box(g, W * 0.2, H * 0.72, 0.006, DARK, W * 0.36, H / 2, D / 2 + 0.001, 0.006);
    cyl(g, 0.022, 0.022, 0.012, CHROME, W * 0.36, H * 0.3, D / 2 + 0.008, 14).rotation.x = Math.PI / 2;
    return g;
  },
  coffeemaker(it, W, D, H) {
    const g = G(), m = M(it.color, 0.3, 0.8);
    box(g, W, H * 0.9, D * 0.62, m, 0, H * 0.45, -D * 0.19, 0.012);
    box(g, W, 0.03, D, DARK, 0, 0.015, 0, 0.006);
    box(g, W * 0.8, H * 0.2, D * 0.34, m, 0, H * 0.74, D * 0.24, 0.01);
    cyl(g, 0.028, 0.022, 0.03, CHROME, 0, H * 0.6, D * 0.26, 14);
    rod(g, [0, H * 0.6, D * 0.26], [W * 0.3, H * 0.58, D * 0.4], 0.008, DARK);
    cyl(g, 0.035, 0.028, 0.06, M('#f6f4ee', 0.4), 0, 0.06, D * 0.26, 16);
    for (const sx of [-1, 1]) cyl(g, 0.035, 0.028, 0.055, M('#f6f4ee', 0.4), sx * W * 0.22, H * 0.9 + 0.028, -D * 0.2, 14);
    return g;
  },
  bin(it, W, D, H) {
    const g = G(), d = def(it), r = W / 2;
    if (d.kind === 'paper') {
      lathe(g, [[0, 0], [r * 0.72, 0], [r, H], [r * 0.96, H], [r * 0.7, 0.012], [0, 0.012]], M(it.color, 0.5, 0.4, DS), 0, 0, 0, 24);
      return g;
    }
    cyl(g, r, r * 0.94, H * 0.86, M(it.color, 0.3, 0.8), 0, H * 0.43, 0, 28);
    cyl(g, r * 0.98, r * 0.98, 0.03, DARK, 0, 0.015, 0, 28);
    sph(g, r, M(it.color, 0.3, 0.8), 0, H * 0.86, 0, 1, (H * 0.14) / r, 1, 24);
    box(g, r * 0.6, 0.02, 0.09, DARK, 0, 0.02, r * 0.95, 0.008);
    return g;
  },

  // ---------- Badrum och tvätt ----------
  shower(it, W, D, H) {
    const g = G(), walkin = def(it).kind === 'walkin';
    box(g, W, 0.04, D, M('#f3f1ea', 0.2), 0, 0.02, 0, 0.01);
    cyl(g, 0.05, 0.05, 0.004, CHROME, 0, 0.042, 0, 20);
    box(g, 0.008, H - 0.04, D, CLEAR, W / 2 - 0.004, 0.04 + (H - 0.04) / 2, 0);
    if (!walkin) box(g, W, H - 0.04, 0.008, CLEAR, 0, 0.04 + (H - 0.04) / 2, D / 2 - 0.004);
    for (const [x, z] of [[W / 2 - 0.008, D / 2 - 0.008], [W / 2 - 0.008, -D / 2 + 0.008], ...(walkin ? [] : [[-W / 2 + 0.008, D / 2 - 0.008]])]) box(g, 0.016, H - 0.04, 0.016, CHROME, x, 0.04 + (H - 0.04) / 2, z);
    if (!walkin) box(g, 0.02, 0.26, 0.03, CHROME, 0, H * 0.5, D / 2 + 0.012);
    const x = -W / 2 + 0.12, z = -D / 2 + 0.05;
    cyl(g, 0.012, 0.012, H - 1.05, CHROME, x, 0.95 + (H - 1.05) / 2, z, 10);
    rod(g, [x, H - 0.1, z], [x + 0.06, H - 0.08, z + 0.34], 0.01, CHROME);
    cyl(g, 0.11, 0.11, 0.012, CHROME, x + 0.06, H - 0.1, z + 0.34, 24);
    box(g, 0.26, 0.05, 0.05, CHROME, x + 0.05, 1.0, z, 0.02);
    return g;
  },
  tubfree(it, W, D, H) {
    const g = G(), R = D / 2, sc = G();
    sc.scale.x = W / D;
    g.add(sc);
    lathe(sc, [[0, 0.1], [R * 0.7, 0.1], [R * 0.9, 0.24], [R, H], [R * 0.94, H], [R * 0.84, 0.3], [R * 0.66, 0.17], [0, 0.17]], M(it.color, 0.15, 0, DS), 0, 0, 0, 36);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) sph(g, 0.04, BRASS, sx * W * 0.26, 0.06, sz * D * 0.3, 1, 1.5, 1, 10);
    const x = W / 2 + 0.07;
    cyl(g, 0.014, 0.014, H + 0.28, CHROME, x, (H + 0.28) / 2, -D * 0.22, 10);
    rod(g, [x, H + 0.26, -D * 0.22], [x - 0.2, H + 0.2, -D * 0.22], 0.012, CHROME);
    return g;
  },
  pedsink(it, W, D, H) {
    const g = G(), m = M(it.color, 0.15);
    cyl(g, 0.07, 0.09, H - 0.16, m, 0, (H - 0.16) / 2, -D * 0.1, 20);
    const sc = G();
    sc.scale.z = D / W;
    sc.position.y = H - 0.18;
    g.add(sc);
    lathe(sc, [[0, 0], [W * 0.2, 0], [W / 2, 0.16], [W / 2, 0.18], [W / 2 - 0.03, 0.18], [W * 0.2, 0.04], [0, 0.04]], M(it.color, 0.15, 0, DS), 0, 0, 0, 32);
    cyl(g, 0.012, 0.012, 0.14, CHROME, 0, H + 0.07, -D / 2 + 0.07, 10);
    box(g, 0.018, 0.018, 0.1, CHROME, 0, H + 0.13, -D / 2 + 0.11);
    return g;
  },
  mirrorcab(it, W, D, H) {
    const g = G(), n = W > 0.75 ? 2 : 1;
    box(g, W, H, D - 0.01, M(it.color, 0.5), 0, H / 2, -0.005);
    for (let i = 0; i < n; i++) box(g, W / n - 0.006, H - 0.006, 0.008, MIRROR, -W / 2 + ((i + 0.5) * W) / n, H / 2, D / 2 - 0.004);
    return g;
  },
  towelrail(it, W, D, H) {
    const g = G(), n = Math.max(4, Math.round(H / 0.13)), col = def(it).towel || '#c7b299';
    for (const sx of [-1, 1]) cyl(g, 0.012, 0.012, H, CHROME, sx * (W / 2 - 0.012), H / 2, 0, 10);
    for (let i = 0; i < n; i++) rod(g, [-W / 2 + 0.012, 0.05 + ((H - 0.1) * i) / (n - 1), 0], [W / 2 - 0.012, 0.05 + ((H - 0.1) * i) / (n - 1), 0], 0.008, CHROME);
    box(g, W - 0.1, H * 0.42, 0.03, M(col, 1), 0, H * 0.66, 0.014, 0.012);
    box(g, W - 0.14, H * 0.22, 0.03, M('#f2f1ec', 1), 0, H * 0.2, 0.014, 0.012);
    return g;
  },
  dryrack(it, W, D, H) {
    const g = G(), m = M('#e6e6e3', 0.4, 0.4), rnd = seeded(it.id || 27);
    for (const sz of [-1, 1]) {
      const z = sz * D * 0.28;
      rod(g, [-W / 2 + 0.02, 0, z - 0.12], [W / 2 - 0.02, H, z + 0.12], 0.009, m);
      rod(g, [W / 2 - 0.02, 0, z - 0.12], [-W / 2 + 0.02, H, z + 0.12], 0.009, m);
    }
    for (const sx of [-1, 1]) rod(g, [sx * (W / 2 - 0.01), H, -D / 2], [sx * (W / 2 - 0.01), H, D / 2], 0.008, m);
    const n = Math.max(5, Math.round(W / 0.07));
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.03 + ((W - 0.06) * i) / (n - 1);
      rod(g, [x, H, -D / 2], [x, H, D / 2], 0.004, m, 0.004, 5);
      if (i % 3 === 1) box(g, 0.012, 0.3 + rnd() * 0.25, D * (0.25 + rnd() * 0.2), M(['#e7e3da', '#6f7f8c', '#8d9a8a', '#a3554a'][Math.floor(rnd() * 4)], 1), x, H - 0.2, (rnd() - 0.5) * D * 0.4, 0.005);
    }
    return g;
  },
  ironing(it, W, D, H) {
    const g = G(), m = M('#e6e6e3', 0.4, 0.4), cover = M(it.color, 1);
    box(g, W, 0.03, D * 0.78, cover, 0, H - 0.015, -D * 0.11, 0.012);
    const nose = cyl(g, W / 2, W / 2, 0.03, cover, 0, H - 0.015, D * 0.28, 24);
    nose.scale.z = (D * 0.44) / W;
    rod(g, [0, 0, -D * 0.34], [0, H - 0.03, D * 0.2], 0.01, m);
    rod(g, [0, 0, D * 0.3], [0, H - 0.03, -D * 0.26], 0.01, m);
    for (const z of [-D * 0.34, D * 0.3]) rod(g, [-W * 0.45, 0.01, z], [W * 0.45, 0.01, z], 0.01, m);
    return g;
  },

  // ---------- Hall ----------
  umbrella(it, W, D, H) {
    const g = G(), r = W / 2;
    lathe(g, [[0, 0], [r * 0.85, 0], [r, H * 0.62], [r * 0.95, H * 0.62], [r * 0.8, 0.012], [0, 0.012]], M(it.color, 0.4, 0.5, DS), 0, 0, 0, 24);
    [['#27364a', 0.06, 0.02], ['#a3554a', -0.05, -0.03]].forEach(([c, x, z], i) => {
      rod(g, [x * 0.3, 0.03, z * 0.3], [x * 1.4, H - 0.06, z * 1.4], 0.028, M(c, 0.9), 0.012, 10);
      torus(g, 0.03, 0.006, M('#5b4a38', 0.6), x * 1.4 + 0.03, H - 0.05, z * 1.4, Math.PI, 12).rotation.z = i ? 0.2 : -0.2;
    });
    return g;
  },

  // ---------- Barnrum ----------
  changing(it, W, D, H) {
    const g = FURN.drawers(it, W, D, H - 0.1);
    const m = M(it.color, 0.6);
    box(g, W - 0.06, 0.05, D - 0.08, M('#f6f4ee', 0.95), 0, H - 0.075, 0.01, 0.02);
    for (const sx of [-1, 1]) box(g, 0.02, 0.1, D, m, sx * (W / 2 - 0.01), H - 0.05, 0);
    box(g, W, 0.1, 0.02, m, 0, H - 0.05, -D / 2 + 0.01);
    return g;
  },
  teepee(it, W, D, H) {
    const g = G(), r = W / 2, a = r / Math.SQRT2, fab = M(it.color, 1, 0, { flatShading: true, side: THREE.DoubleSide });
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, H * 0.9, 4, 1, true), fab);
    c.position.y = H * 0.45;
    c.rotation.y = Math.PI / 4;
    g.add(c);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) rod(g, [sx * a, 0, sz * a], [-sx * a * 0.12, H, -sz * a * 0.12], 0.012, M('#b98d5e', 0.6));
    const s = new THREE.Shape();
    s.moveTo(-a * 0.42, 0); s.lineTo(a * 0.42, 0); s.lineTo(0, H * 0.5); s.lineTo(-a * 0.42, 0);
    const door = new THREE.Mesh(new THREE.ShapeGeometry(s), M('#3a2f27', 1, 0, DS));
    door.position.set(0, 0.005, a + 0.004);
    door.rotation.x = -Math.atan2(a, H * 0.9);
    g.add(door);
    return g;
  },
  stroller(it, W, D, H) {
    const g = G(), fab = M(it.color, 0.95), y = H * 0.58, bw = W * 0.72;
    box(g, bw, 0.26, D * 0.56, fab, 0, y, 0.02, 0.07);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(bw / 2, 20, 12, 0, TAU, 0, Math.PI / 2), M(it.color, 0.95, 0, DS));
    hood.position.set(0, y + 0.1, -D * 0.12);
    hood.scale.set(1, 1.05, 0.8);
    g.add(hood);
    for (const sx of [-1, 1]) {
      const x = sx * (W / 2 - 0.03);
      for (const z of [-D * 0.3, D * 0.34]) { wheel(g, 0.13, 0.035, RUBBER, x, 0.13, z); wheel(g, 0.05, 0.04, CHROME, x, 0.13, z); }
      rod(g, [x, 0.13, D * 0.34], [x * 0.9, H, -D / 2 + 0.03], 0.01, CHROME);
      rod(g, [x, 0.13, -D * 0.3], [x * 0.9, y - 0.1, D * 0.2], 0.01, CHROME);
    }
    rod(g, [-(W / 2 - 0.03) * 0.9, H, -D / 2 + 0.03], [(W / 2 - 0.03) * 0.9, H, -D / 2 + 0.03], 0.014, RUBBER);
    return g;
  },

  // ---------- Träning och fritid ----------
  treadmill(it, W, D, H) {
    const g = G(), m = M(it.color, 0.5, 0.3);
    box(g, W * 0.86, 0.12, D * 0.8, m, 0, 0.1, D * 0.08, 0.02);
    box(g, W * 0.62, 0.01, D * 0.74, RUBBER, 0, 0.165, D * 0.08);
    box(g, W * 0.86, 0.22, D * 0.16, m, 0, 0.15, -D * 0.4, 0.04);
    for (const sx of [-1, 1]) {
      rod(g, [sx * W * 0.4, 0.2, -D * 0.38], [sx * W * 0.4, H - 0.12, -D * 0.44], 0.02, m);
      rod(g, [sx * W * 0.4, H * 0.72, -D * 0.42], [sx * W * 0.4, H * 0.7, -D * 0.12], 0.016, RUBBER);
    }
    const con = box(g, W * 0.9, 0.22, 0.07, M('#26282b', 0.5), 0, H - 0.1, -D * 0.44, 0.02);
    con.rotation.x = -0.5;
    box(g, W * 0.4, 0.12, 0.004, M('#2c4a6e', 0.2, 0, { emissive: '#3b6ea8', emissiveIntensity: 0.5 }), 0, H - 0.085, -D * 0.44 + 0.034).rotation.x = -0.5;
    return g;
  },
  exbike(it, W, D, H) {
    const g = G(), m = M(it.color, 0.5, 0.3), acc = M('#c8362e', 0.5);
    for (const z of [-D * 0.42, D * 0.42]) box(g, W, 0.05, 0.07, m, 0, 0.025, z, 0.015);
    rod(g, [0, 0.05, -D * 0.42], [0, 0.05, D * 0.42], 0.03, m);
    const fw = cyl(g, 0.22, 0.22, 0.05, M('#26282b', 0.4, 0.5), 0, 0.3, -D * 0.25, 32);
    fw.rotation.z = Math.PI / 2;
    cyl(g, 0.16, 0.16, 0.055, acc, 0, 0.3, -D * 0.25, 32).rotation.z = Math.PI / 2;
    rod(g, [0, 0.3, -D * 0.25], [0, H - 0.05, -D * 0.3], 0.026, m);
    rod(g, [0, 0.08, D * 0.05], [0, H * 0.74, D * 0.2], 0.026, m);
    rod(g, [0, 0.3, -D * 0.25], [0, 0.3, D * 0.08], 0.024, m);
    sph(g, 0.1, RUBBER, 0, H * 0.76, D * 0.21, 0.9, 0.35, 1.5, 14);
    rod(g, [-W * 0.38, H - 0.03, -D * 0.28], [W * 0.38, H - 0.03, -D * 0.28], 0.014, RUBBER);
    box(g, 0.14, 0.1, 0.03, M('#26282b', 0.5), 0, H, -D * 0.31).rotation.x = -0.5;
    rod(g, [-W * 0.3, 0.2, D * 0.02], [W * 0.3, 0.4, D * 0.14], 0.01, CHROME);
    return g;
  },
  gymbench(it, W, D, H) {
    const g = G();
    box(g, W * 0.7, 0.07, D, M(it.color, 0.9), 0, H - 0.035, 0, 0.025);
    for (const z of [-D * 0.36, D * 0.36]) {
      box(g, 0.05, H - 0.07, 0.05, BLACKMETAL, 0, (H - 0.07) / 2, z);
      box(g, W, 0.04, 0.05, BLACKMETAL, 0, 0.02, z);
    }
    box(g, 0.05, 0.05, D * 0.72, BLACKMETAL, 0, H - 0.1, 0);
    return g;
  },
  dumbbells(it, W, D, H) {
    const g = G(), head = M('#2a2c2f', 0.6);
    for (const sx of [-1, 1]) {
      rod(g, [sx * (W / 2 - 0.03), 0, D / 2 - 0.03], [sx * (W / 2 - 0.03), H, -D * 0.12], 0.02, BLACKMETAL);
      rod(g, [sx * (W / 2 - 0.03), 0, -D / 2 + 0.03], [sx * (W / 2 - 0.03), H * 0.96, -D * 0.2], 0.02, BLACKMETAL);
    }
    [[H * 0.36, D * 0.12], [H * 0.78, -D * 0.06]].forEach(([y, z], row) => {
      box(g, W - 0.04, 0.02, D * 0.42, BLACKMETAL, 0, y, z).rotation.x = 0.25;
      const n = Math.max(3, Math.round(W / 0.24));
      for (let i = 0; i < n; i++) {
        const x = -W / 2 + ((i + 0.5) * W) / n, r = 0.035 + (row ? 0 : 0.02) + (i / n) * 0.02;
        const dz = D * 0.16;
        rod(g, [x, y + r + 0.02, z - dz], [x, y + r + 0.02, z + dz], 0.013, CHROME);
        for (const s of [-1, 1]) cyl(g, r, r, 0.06, head, x, y + r + 0.02, z + s * dz, 6).rotation.x = Math.PI / 2;
      }
    });
    return g;
  },
  pooltable(it, W, D, H) {
    const g = G(), wood = M(it.color, 0.45);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.12, H - 0.22, 0.12, wood, sx * (W / 2 - 0.16), (H - 0.22) / 2, sz * (D / 2 - 0.16), 0.02);
    box(g, W, 0.22, D, wood, 0, H - 0.13, 0, 0.02);
    box(g, W - 0.2, 0.012, D - 0.2, M('#2f7d4f', 1), 0, H - 0.016, 0);
    for (const sz of [-1, 1]) box(g, W - 0.24, 0.035, 0.07, M('#2a6e45', 1), 0, H, sz * (D / 2 - 0.115));
    for (const sx of [-1, 1]) box(g, 0.07, 0.035, D - 0.24, M('#2a6e45', 1), sx * (W / 2 - 0.115), H, 0);
    for (const sx of [-1, 1]) for (const z of [-D / 2 + 0.11, 0, D / 2 - 0.11]) cyl(g, 0.055, 0.055, 0.012, M('#141516', 0.8), sx * (W / 2 - 0.11), H - 0.008, z, 16);
    const cols = ['#e3b23c', '#27364a', '#c8362e', '#7d6b91', '#e8962e', '#2f7d4f', '#7a2f2a', '#17191b', '#e3b23c', '#27364a'];
    let i = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) sph(g, 0.028, M(cols[i++ % 10], 0.2), (c - r / 2) * 0.058, H + 0.018, -D * 0.2 - r * 0.05, 1, 1, 1, 12);
    sph(g, 0.028, M('#f6f4ee', 0.2), 0, H + 0.018, D * 0.25, 1, 1, 1, 12);
    rod(g, [W * 0.2, H + 0.012, D * 0.1], [W * 0.32, H + 0.012, D * 0.42], 0.006, M('#c9a67a', 0.5), 0.012);
    return g;
  },
  bicycle(it, W, D, H) {
    const g = G(), m = M(it.color, 0.4, 0.4), s = H / 1.05;
    const P = (y, z) => [0, y * s, z * s];
    const B = P(0.3, 0.08), S = P(0.82, 0.2), Ht = P(0.88, -0.38), Hb = P(0.62, -0.42), Rr = P(0.35, 0.52), F = P(0.35, -0.52);
    for (const [c, z] of [[Rr, 0.52], [F, -0.52]]) {
      torus(g, 0.33 * s, 0.018, RUBBER, 0, c[1], z * s, TAU, 36).rotation.y = Math.PI / 2;
      torus(g, 0.31 * s, 0.006, CHROME, 0, c[1], z * s, TAU, 36).rotation.y = Math.PI / 2;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; rod(g, [0, c[1] - Math.sin(a) * 0.31 * s, z * s - Math.cos(a) * 0.31 * s], [0, c[1] + Math.sin(a) * 0.31 * s, z * s + Math.cos(a) * 0.31 * s], 0.0015, CHROME, 0.0015, 4); }
    }
    for (const [a, b] of [[B, S], [S, Ht], [B, Hb], [Hb, Ht], [S, Rr], [B, Rr], [Hb, F]]) rod(g, a, b, 0.014, m);
    rod(g, S, P(0.95, 0.22), 0.01, CHROME);
    sph(g, 0.09, RUBBER, 0, 0.97 * s, 0.23 * s, 0.75, 0.3, 1.5, 12);
    rod(g, Ht, P(1.0, -0.36), 0.01, CHROME);
    rod(g, [-W / 2, 1.0 * s, -0.36 * s], [W / 2, 1.0 * s, -0.36 * s], 0.011, RUBBER);
    cyl(g, 0.08, 0.08, 0.006, CHROME, 0.03, B[1], B[2], 20).rotation.z = Math.PI / 2;
    rod(g, [0.06, B[1], B[2]], [0.06, B[1] - 0.15, B[2] + 0.06], 0.007, CHROME);
    box(g, 0.08, 0.015, 0.05, RUBBER, 0.1, B[1] - 0.15, B[2] + 0.06);
    return g;
  },
  dogbed(it, W, D, H) {
    const g = G(), sc = G(), r = W / 2, t = Math.min(H * 0.5, 0.11);
    sc.scale.z = D / W;
    g.add(sc);
    const ring = torus(sc, r - t, t, M(it.color, 1), 0, t, 0, TAU, 32);
    ring.rotation.x = Math.PI / 2;
    cyl(sc, r - t, r - t, t * 0.9, M(shade(it.color, 0.08), 1), 0, t * 0.5, 0, 28);
    return g;
  },
  cattree(it, W, D, H) {
    const g = G(), carpet = M(it.color, 1), sisal = M('#c9b48e', 1);
    box(g, W, 0.04, D, carpet, 0, 0.02, 0, 0.012);
    cyl(g, 0.045, 0.045, H - 0.06, sisal, -W * 0.25, H / 2, -D * 0.15, 14);
    cyl(g, 0.045, 0.045, H * 0.55, sisal, W * 0.25, H * 0.275 + 0.02, D * 0.1, 14);
    box(g, W * 0.55, 0.035, D * 0.6, carpet, -W * 0.2, H - 0.02, -D * 0.12, 0.012);
    box(g, W * 0.5, 0.035, D * 0.55, carpet, W * 0.22, H * 0.56, D * 0.1, 0.012);
    box(g, W * 0.45, H * 0.26, D * 0.5, carpet, -W * 0.2, 0.04 + H * 0.13, D * 0.18, 0.02);
    cyl(g, H * 0.08, H * 0.08, 0.006, M('#26282b', 1), -W * 0.2, 0.04 + H * 0.13, D * 0.18 + D * 0.25 + 0.001, 18).rotation.x = Math.PI / 2;
    rod(g, [W * 0.4, H * 0.54, D * 0.3], [W * 0.4, H * 0.4, D * 0.3], 0.002, sisal, 0.002, 4);
    sph(g, 0.03, M('#c8362e', 1), W * 0.4, H * 0.38, D * 0.3);
    return g;
  },

  // ---------- Balkong ----------
  parasol(it, W, D, H) {
    const g = G(), r = W / 2;
    cyl(g, 0.22, 0.24, 0.07, M('#3a3d40', 0.8), 0, 0.035, 0, 24);
    cyl(g, 0.02, 0.02, H - 0.05, M('#b98d5e', 0.6), 0, (H - 0.05) / 2 + 0.05, 0, 10);
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, H * 0.2, 8, 1, true), M(it.color, 1, 0, { flatShading: true, side: THREE.DoubleSide }));
    c.position.y = H - H * 0.1;
    g.add(c);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; rod(g, [0, H * 0.72, 0], [Math.cos(a) * r * 0.6, H * 0.88, Math.sin(a) * r * 0.6], 0.005, M('#b98d5e', 0.6), 0.005, 5); }
    return g;
  },
  grill(it, W, D, H) {
    const g = G(), r = W / 2, cy = H * 0.72, m = M(it.color, 0.25, 0.3);
    sph(g, r, m, 0, cy, 0, 1, 0.92, 1, 28);
    torus(g, r * 1.005, 0.008, CHROME, 0, cy, 0, TAU, 32).rotation.x = Math.PI / 2;
    box(g, 0.12, 0.02, 0.03, M('#26282b', 0.6), 0, cy + r * 0.92 + 0.02, 0, 0.008);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + Math.PI / 2; rod(g, [Math.cos(a) * r * 0.95, 0.02, Math.sin(a) * r * 0.95], [Math.cos(a) * r * 0.6, cy - r * 0.5, Math.sin(a) * r * 0.6], 0.01, CHROME); }
    cyl(g, r * 0.7, r * 0.7, 0.01, CHROME, 0, H * 0.24, 0, 24);
    return g;
  },
  sunbed(it, W, D, H) {
    const g = G(), wood = M('#b98d5e', 0.6), fab = M(it.color, 1), sh = Math.min(0.32, H * 0.5);
    for (const sx of [-1, 1]) for (const z of [-D * 0.38, D * 0.4]) box(g, 0.05, sh, 0.05, wood, sx * (W / 2 - 0.03), sh / 2, z);
    box(g, W, 0.04, D * 0.66, wood, 0, sh, D * 0.17);
    box(g, W - 0.04, 0.06, D * 0.64, fab, 0, sh + 0.05, D * 0.17, 0.025);
    const b = G();
    b.position.set(0, sh, -D * 0.16);
    b.rotation.x = 0.65;
    g.add(b);
    box(b, W, 0.04, D * 0.36, wood, 0, 0, -D * 0.18);
    box(b, W - 0.04, 0.06, D * 0.35, fab, 0, 0.05, -D * 0.18, 0.025);
    return g;
  },

  // ---------- Övrigt ----------
  cylinder(it, W, D, H) {
    const g = G(), c = cyl(g, W / 2, W / 2, H, M(it.color, 0.7), 0, H / 2, 0, 40);
    c.scale.z = D / W;
    return g;
  },
  movingbox(it, W, D, H) {
    const g = G(), n = def(it).stack || 1, rnd = seeded(it.id || 29), card = M(it.color, 0.95), tape = M(shade(it.color, 0.12), 0.6), bh = H / n;
    for (let i = 0; i < n; i++) {
      const b = G();
      b.position.y = i * bh;
      b.rotation.y = n > 1 ? (rnd() - 0.5) * 0.3 : 0;
      g.add(b);
      box(b, W - (n > 1 ? 0.04 : 0), bh - 0.004, D - (n > 1 ? 0.04 : 0), card, 0, bh / 2, 0, 0.004);
      box(b, 0.06, bh, D - (n > 1 ? 0.035 : -0.004), tape, 0, bh / 2 + 0.001, 0);
      box(b, W * 0.3, bh * 0.3, 0.002, M('#f6f4ee', 0.9), W * 0.2, bh * 0.55, D / 2 - (n > 1 ? 0.019 : -0.001));
    }
    return g;
  },
  suitcase(it, W, D, H) {
    const g = G(), bh = H * 0.72, m = M(it.color, 0.45);
    box(g, W, bh, D, m, 0, 0.05 + bh / 2, 0, 0.04);
    for (let i = 1; i < 5; i++) box(g, 0.012, bh - 0.08, D + 0.006, M(shade(it.color, -0.08), 0.45), -W / 2 + (i * W) / 5, 0.05 + bh / 2, 0);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) sph(g, 0.025, RUBBER, sx * (W / 2 - 0.05), 0.025, sz * (D / 2 - 0.04));
      cyl(g, 0.006, 0.006, H - bh - 0.05, CHROME, sx * W * 0.2, 0.05 + bh + (H - bh - 0.05) / 2, -D * 0.25, 6);
    }
    box(g, W * 0.48, 0.025, 0.03, RUBBER, 0, H - 0.0125, -D * 0.25, 0.01);
    return g;
  },
  robotvac(it, W, D, H) {
    const g = G();
    cyl(g, W / 2, W / 2, H * 0.75, M(it.color, 0.35), 0, H * 0.375, 0, 36);
    cyl(g, W * 0.14, W * 0.14, H * 0.25, M('#3a3d40', 0.4), 0, H * 0.875, -D * 0.12, 20);
    cyl(g, W * 0.06, W * 0.06, 0.004, M('#2c4a6e', 0.2, 0, { emissive: '#3b6ea8', emissiveIntensity: 0.7 }), 0, H * 0.752, D * 0.22, 14);
    return g;
  },
  ladder(it, W, D, H) {
    const g = G(), m = M(it.color, 0.4, 0.6);
    for (const sx of [-1, 1]) {
      rod(g, [sx * (W / 2 - 0.02), 0, D / 2 - 0.02], [sx * (W / 2 - 0.06), H, 0], 0.016, m);
      rod(g, [sx * (W / 2 - 0.02), 0, -D / 2 + 0.02], [sx * (W / 2 - 0.06), H * 0.92, -0.02], 0.014, m);
    }
    for (let i = 1; i <= 4; i++) { const t = i / 5; box(g, W - 0.06 - t * 0.07, 0.025, 0.09, m, 0, H * t, (D / 2 - 0.02) * (1 - t)); }
    box(g, W - 0.1, 0.03, 0.22, M('#c8362e', 0.6), 0, H * 0.94, 0);
    return g;
  },
  fan(it, W, D, H) {
    const g = G(), m = M(it.color, 0.4, 0.3), r = Math.min(W / 2, H * 0.22), cy = H - r - 0.01;
    cyl(g, W * 0.38, W * 0.4, 0.03, m, 0, 0.015, 0, 28);
    cyl(g, 0.014, 0.018, cy - 0.03, m, 0, cy / 2, -0.02, 10);
    for (const z of [0.05, -0.02]) torus(g, r, 0.006, CHROME, 0, cy, z, TAU, 32);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; rod(g, [0, cy, 0.07], [Math.cos(a) * r, cy + Math.sin(a) * r, 0.05], 0.002, CHROME, 0.002, 4); }
    cyl(g, 0.05, 0.05, 0.1, m, 0, cy, -0.04, 16).rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU, b = sph(g, r * 0.45, M('#8d9296', 0.5), Math.cos(a) * r * 0.48, cy + Math.sin(a) * r * 0.48, 0.02, 1, 0.5, 0.12, 12);
      b.rotation.z = a;
    }
    return g;
  },
};
