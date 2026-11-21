// 3D-modeller, byggda av enkla former. Mått i meter, origo mitt på golvet,
// −z är baksidan (samma som −y i planvyn).

import * as THREE from 'three';
import { cornerDims, def, shapeOf } from './catalog.js';
import { M, shade, box, cyl, seeded, STEEL, DARK, GLASS, WORKTOP, CHROME } from './kit.js';
import { FURN } from './m_furn.js';
import { DECOR } from './m_decor.js';
import { MISC } from './m_misc.js';

export { M };

function sofaPart(g, W, D, H, col) {
  const fab = M(col, 0.96), fab2 = M(shade(col, 0.035), 0.96), leg = M('#3a2f27', 0.6);
  const arm = Math.min(0.2, W * 0.13), back = Math.min(0.22, D * 0.26), legH = 0.09;
  const armH = Math.min(H - 0.14, 0.64);
  const n = Math.max(1, Math.round((W - 2 * arm) / 0.75)), sw = (W - 2 * arm) / n;
  box(g, W, 0.2, D, fab, 0, legH + 0.1, 0, 0.03);
  box(g, W, H - legH, back, fab, 0, legH + (H - legH) / 2, -D / 2 + back / 2, 0.05);
  for (const sx of [-1, 1]) box(g, arm, armH - legH, D, fab, sx * (W / 2 - arm / 2), legH + (armH - legH) / 2, 0, 0.05);
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + arm + sw * (i + 0.5);
    box(g, sw - 0.012, 0.17, D - back - 0.01, fab2, x, 0.375, back / 2, 0.05);
    if (H > 0.7) box(g, sw - 0.03, Math.min(0.36, H - 0.5), 0.15, fab2, x, 0.46 + Math.min(0.36, H - 0.5) / 2, -D / 2 + back + 0.06, 0.06).rotation.x = -0.14;
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.022, 0.018, legH, leg, sx * (W / 2 - 0.07), legH / 2, sz * (D / 2 - 0.07), 12);
}

function kitchenBase(g, W, D, H, col, front = null) {
  const body = M(col, 0.6), n = Math.max(1, Math.round(W / 0.6));
  box(g, W, 0.1, D - 0.08, DARK, 0, 0.05, -0.02);
  box(g, W, H - 0.13, D - 0.02, body, 0, 0.1 + (H - 0.13) / 2, -0.01);
  box(g, W + 0.002, 0.03, D + 0.012, WORKTOP, 0, H - 0.015, 0.004, 0.004);
  if (front) box(g, W - 0.012, H - 0.17, 0.012, front, 0, 0.11 + (H - 0.17) / 2, D / 2 - 0.004);
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + ((i + 0.5) * W) / n;
    if (i) box(g, 0.004, H - 0.15, 0.004, DARK, -W / 2 + (i * W) / n, 0.1 + (H - 0.15) / 2, D / 2 - 0.001);
    box(g, Math.min(0.16, W / n - 0.1), 0.012, 0.02, CHROME, x, H - 0.12, D / 2 + 0.012);
  }
}

const B = {
  sofa(it, W, D, H) {
    const g = new THREE.Group();
    sofaPart(g, W, D, H, it.color);
    if (def(it).kind === 'wing') for (const sx of [-1, 1]) box(g, 0.07, H * 0.4, 0.26, M(it.color, 0.96), sx * (W / 2 - 0.035), H - H * 0.2, -D / 2 + 0.2, 0.03);
    return g;
  },
  corner(it, W, D, H) {
    const g = new THREE.Group(), inner = new THREE.Group();
    g.add(inner);
    const c = cornerDims(it), md = c.md / 100, cw = c.cw / 100, cd = D - md;
    const main = new THREE.Group();
    sofaPart(main, W, md, H, it.color);
    main.position.z = -D / 2 + md / 2;
    inner.add(main);
    const fab = M(it.color, 0.96), fab2 = M(shade(it.color, 0.035), 0.96);
    const zc = -D / 2 + md + cd / 2, xc = -W / 2 + cw / 2;
    box(inner, cw, 0.2, cd, fab, xc, 0.19, zc, 0.03);
    box(inner, cw - 0.02, 0.17, cd - 0.01, fab2, xc, 0.375, zc, 0.05);
    for (const sx of [-1, 1]) cyl(inner, 0.022, 0.018, 0.09, M('#3a2f27', 0.6), xc + sx * (cw / 2 - 0.07), 0.045, D / 2 - 0.07, 12);
    if (it.mirror) inner.scale.x = -1;
    return g;
  },
  cabinet(it, W, D, H) {
    const g = new THREE.Group(), body = M(it.color, 0.6), legH = Math.min(0.12, H * 0.25);
    box(g, W, H - legH, D, body, 0, legH + (H - legH) / 2, 0, 0.008);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.018, 0.014, legH, M('#3a2f27', 0.6), sx * (W / 2 - 0.05), legH / 2, sz * (D / 2 - 0.05), 10);
    const seam = M(shade(it.color, -0.25), 0.8), n = Math.max(1, Math.round(W / 0.6));
    for (let i = 1; i < n; i++) box(g, 0.004, H - legH - 0.02, 0.003, seam, -W / 2 + (i * W) / n, legH + (H - legH) / 2, D / 2);
    if (H > 0.6) for (let i = 1; i < 3; i++) box(g, W - 0.02, 0.004, 0.003, seam, 0, legH + ((H - legH) * i) / 3, D / 2);
    return g;
  },
  tv(it, W, D, H) {
    const g = new THREE.Group();
    box(g, W, H, 0.035, M(it.color, 0.4, 0.3), 0, H / 2, -D / 2 + 0.03, 0.006);
    box(g, W - 0.02, H - 0.02, 0.003, GLASS, 0, H / 2, -D / 2 + 0.049);
    return g;
  },
  barstool(it, W, D, H) {
    const g = new THREE.Group(), m = M(it.color, 0.6), metal = M('#8f9498', 0.35, 0.8), sh = 0.66;
    box(g, W - 0.02, 0.05, D - 0.06, m, 0, sh, 0.02, 0.02);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.014, 0.012, sh, metal, sx * (W / 2 - 0.04), sh / 2, sz * (D / 2 - 0.05), 10);
    box(g, W - 0.08, 0.016, 0.016, metal, 0, 0.24, D / 2 - 0.05, 0.005);
    for (const sx of [-1, 1]) cyl(g, 0.012, 0.012, H - sh, metal, sx * (W / 2 - 0.06), sh + (H - sh) / 2, -D / 2 + 0.05, 10);
    box(g, W - 0.06, 0.12, 0.025, m, 0, H - 0.07, -D / 2 + 0.05, 0.01);
    return g;
  },
  counter(it, W, D, H) {
    const g = new THREE.Group();
    kitchenBase(g, W, D, H, it.type === 'dishwasher' ? '#dfe2dc' : it.color, it.type === 'dishwasher' ? STEEL : null);
    return g;
  },
  sink(it, W, D, H) {
    const g = new THREE.Group(), bw = Math.min(W - 0.16, 0.52), bd = Math.min(D - 0.24, 0.4);
    kitchenBase(g, W, D, H, it.color);
    box(g, bw + 0.04, 0.006, bd + 0.04, STEEL, 0, H + 0.002, 0.02, 0.002);
    box(g, bw, 0.004, bd, M('#6f7478', 0.3, 0.9), 0, H + 0.006, 0.02);
    cyl(g, 0.013, 0.013, 0.26, CHROME, 0, H + 0.13, -bd / 2 - 0.03, 12);
    box(g, 0.02, 0.02, 0.17, CHROME, 0, H + 0.25, -bd / 2 + 0.05);
    return g;
  },
  stove(it, W, D, H) {
    const g = new THREE.Group();
    kitchenBase(g, W, D, H, it.color);
    box(g, W - 0.04, 0.008, D - 0.12, GLASS, 0, H + 0.004, 0, 0.003);
    const r = Math.min(W, D) * 0.14;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, r, r, 0.002, M('#33373b', 0.3, 0.2), sx * W * 0.21, H + 0.009, sz * D * 0.19, 28);
    return g;
  },
  tallcab(it, W, D, H) {
    const g = new THREE.Group();
    box(g, W, 0.1, D - 0.08, DARK, 0, 0.05, -0.02);
    box(g, W, H - 0.1, D - 0.02, M(it.color, 0.6), 0, 0.1 + (H - 0.1) / 2, -0.01);
    box(g, W - 0.06, 0.52, 0.012, GLASS, 0, 0.98, D / 2 - 0.004, 0.004);
    box(g, W - 0.14, 0.014, 0.03, CHROME, 0, 1.2, D / 2 + 0.014);
    box(g, W - 0.06, 0.36, 0.012, GLASS, 0, 1.52, D / 2 - 0.004, 0.004);
    return g;
  },
  bathtub(it, W, D, H) {
    const g = new THREE.Group(), m = M(it.color, 0.2), t = 0.055;
    box(g, W, 0.14, D, m, 0, 0.07, 0);
    for (const sz of [-1, 1]) box(g, W, H, t, m, 0, H / 2, sz * (D / 2 - t / 2), 0.02);
    for (const sx of [-1, 1]) box(g, t, H, D, m, sx * (W / 2 - t / 2), H / 2, 0, 0.02);
    cyl(g, 0.014, 0.014, 0.16, CHROME, 0, H + 0.08, -D / 2 + 0.04, 12);
    box(g, 0.022, 0.022, 0.13, CHROME, 0, H + 0.15, -D / 2 + 0.1);
    return g;
  },
  toilet(it, W, D, H) {
    if (def(it).kind === 'wall') {
      const gw = new THREE.Group(), mw = M(it.color, 0.18), bowl = new THREE.Group();
      bowl.scale.z = D / W;
      bowl.position.set(0, 0, 0);
      gw.add(bowl);
      cyl(bowl, W / 2, W * 0.34, H - 0.1, mw, 0, 0.1 + (H - 0.1) / 2, 0, 32);
      cyl(bowl, W / 2 + 0.006, W / 2 + 0.006, 0.03, mw, 0, H + 0.005, 0, 32);
      box(gw, 0.24, 0.16, 0.012, CHROME, 0, H + 0.6, -D / 2 + 0.006, 0.01);
      return gw;
    }
    const g = new THREE.Group(), m = M(it.color, 0.18), tank = Math.min(0.2, D * 0.3);
    box(g, W, H - 0.38, tank, m, 0, 0.38 + (H - 0.38) / 2, -D / 2 + tank / 2, 0.025);
    const bowl = new THREE.Group();
    bowl.scale.z = (D - tank) / W;
    bowl.position.z = -D / 2 + tank + (D - tank) / 2;
    g.add(bowl);
    cyl(bowl, W / 2, W * 0.32, 0.38, m, 0, 0.19, 0, 32);
    cyl(bowl, W / 2 + 0.006, W / 2 + 0.006, 0.03, m, 0, 0.4, 0, 32);
    return g;
  },
  vanity(it, W, D, H) {
    const g = new THREE.Group(), n = W > 1.5 ? 2 : 1, top = H - 0.03;
    box(g, W, top - 0.3, D - 0.02, M(it.color, 0.6), 0, 0.3 + (top - 0.3) / 2, -0.01, 0.006);
    box(g, W + 0.004, 0.03, D, M('#ecebe6', 0.3), 0, top + 0.015, 0, 0.005);
    box(g, W - 0.02, 0.004, 0.003, M(shade(it.color, -0.2), 0.8), 0, 0.3 + (top - 0.3) / 2, D / 2 - 0.02);
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? 0 : (i ? 1 : -1) * W * 0.25;
      const basin = new THREE.Group();
      basin.scale.z = 0.7;
      basin.position.set(x, 0, 0.02);
      g.add(basin);
      cyl(basin, Math.min(0.24, W / 2 - 0.06), Math.min(0.19, W / 2 - 0.1), 0.1, M('#f6f6f3', 0.15), 0, top + 0.08, 0, 32);
      cyl(g, 0.012, 0.012, 0.2, CHROME, x, top + 0.13, -D / 2 + 0.07, 10);
      box(g, 0.018, 0.018, 0.11, CHROME, x, top + 0.22, -D / 2 + 0.12);
    }
    return g;
  },
  washer(it, W, D, H) {
    const g = new THREE.Group(), m = M(it.color, 0.4);
    box(g, W, H, D, m, 0, H / 2, 0, 0.012);
    const drums = H > 1.3 ? [0.44, 0.44 + H / 2] : [H * 0.5];
    for (const y of drums) {
      const c = cyl(g, Math.min(W, 0.6) * 0.33, Math.min(W, 0.6) * 0.33, 0.02, GLASS, 0, y, D / 2 + 0.006, 32);
      c.rotation.x = Math.PI / 2;
      const ring = cyl(g, Math.min(W, 0.6) * 0.38, Math.min(W, 0.6) * 0.38, 0.012, STEEL, 0, y, D / 2 + 0.002, 32);
      ring.rotation.x = Math.PI / 2;
    }
    if (H > 1.3) box(g, W - 0.01, 0.006, 0.004, DARK, 0, H / 2 + 0.01, D / 2);
    return g;
  },
  coatrack(it, W, D, H) {
    const g = new THREE.Group(), m = M(it.color, 0.5, 0.4);
    box(g, W, 0.022, D, M('#c9a67a', 0.6), 0, H - 0.011, 0);
    const rail = cyl(g, 0.011, 0.011, W - 0.08, m, 0, H - 0.1, D / 2 - 0.09, 10);
    rail.rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) box(g, 0.02, H - 0.02, D - 0.02, m, sx * (W / 2 - 0.04), (H - 0.02) / 2, -0.01);
    const coats = ['#4a5560', '#8a6f52', '#2f3336'];
    coats.forEach((c, i) => box(g, 0.06, 0.78, D * 0.9, M(c, 1), -W * 0.3 + i * W * 0.24, H - 0.12 - 0.39, 0, 0.025));
    return g;
  },
  box(it, W, D, H) {
    const g = new THREE.Group();
    box(g, W, H, D, M(it.color, 0.7), 0, H / 2, 0, 0.01);
    return g;
  },
};

Object.assign(B, FURN, DECOR, MISC);

export function buildModel(it) {
  const g = (B[shapeOf(it)] || B.box)(it, it.w / 100, it.d / 100, Math.max(0.01, (it.h || 1) / 100));
  g.traverse((o) => {
    if (o.isMesh) { o.castShadow = !g.userData.flat; o.receiveShadow = true; }
  });
  return g;
}

// ---------- Golv ----------
const rgb = (hex, rnd, v = 0.08) => new THREE.Color(hex).offsetHSL((rnd() - 0.5) * 0.012, (rnd() - 0.5) * 0.05, (rnd() - 0.5) * v).getStyle();

function canvasTex(draw, sizeM) {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  draw(c.getContext('2d'), 1024, seeded(11));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.repeat.set(1 / sizeM, 1 / sizeM);
  return t;
}
function planks(base, vary) {
  return (ctx, S, rnd) => {
    const rows = 8, h = S / rows;
    for (let r = 0; r < rows; r++) {
      const off = rnd() * S;
      for (let k = -2; k < 2; k++) {
        const x = off + (k * S) / 2;
        ctx.fillStyle = rgb(base, rnd, vary);
        ctx.fillRect(x, r * h, S / 2, h);
        ctx.strokeStyle = 'rgba(40,25,10,.22)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, r * h, S / 2, h);
        ctx.strokeStyle = 'rgba(60,35,15,.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) { const y = r * h + rnd() * h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + S / 2, y + (rnd() - 0.5) * 6); ctx.stroke(); }
      }
    }
  };
}
function chevron(base) {
  return (ctx, S, rnd) => {
    const cols = 8, cw = S / cols, th = S / 32;
    for (let c = 0; c < cols; c++) {
      const sl = c % 2 ? 1 : -1, x0 = c * cw;
      for (let r = -6; r < 38; r++) {
        const y = r * th;
        ctx.beginPath();
        ctx.moveTo(x0, y); ctx.lineTo(x0 + cw, y + sl * cw); ctx.lineTo(x0 + cw, y + sl * cw + th); ctx.lineTo(x0, y + th);
        ctx.closePath();
        ctx.fillStyle = rgb(base, rnd, 0.09);
        ctx.fill();
        ctx.strokeStyle = 'rgba(40,25,10,.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  };
}
function tiles(base, grout, n) {
  return (ctx, S, rnd) => {
    const t = S / n;
    ctx.fillStyle = grout;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = rgb(base, rnd, 0.035);
      ctx.fillRect(i * t + 4, j * t + 4, t - 8, t - 8);
    }
  };
}
function concrete(base) {
  return (ctx, S, rnd) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '0,0,0'},${0.02 + rnd() * 0.03})`;
      ctx.beginPath(); ctx.arc(rnd() * S, rnd() * S, 30 + rnd() * 120, 0, 7); ctx.fill();
    }
    for (let i = 0; i < 5000; i++) { ctx.fillStyle = `rgba(0,0,0,${rnd() * 0.07})`; ctx.fillRect(rnd() * S, rnd() * S, 2, 2); }
  };
}
const FLOOR_DEF = {
  fiskben: [chevron('#c69c68'), 2.4, 0.5],
  ek: [planks('#c9a26d', 0.09), 1.5, 0.5],
  ljus: [planks('#e0d3bd', 0.05), 1.5, 0.55],
  valnot: [planks('#7d5a3f', 0.08), 1.5, 0.45],
  klinker: [tiles('#dcdfdd', '#b9bcba', 4), 1.2, 0.3],
  skiffer: [tiles('#5d6366', '#3f4447', 4), 1.2, 0.4],
  betong: [concrete('#b9bab6'), 3, 0.75],
};
const floorMats = new Map();
export function floorMaterial(kind) {
  const k = FLOOR_DEF[kind] ? kind : 'fiskben';
  if (!floorMats.has(k)) {
    const [draw, sizeM, rough] = FLOOR_DEF[k];
    floorMats.set(k, new THREE.MeshStandardMaterial({ map: canvasTex(draw, sizeM), roughness: rough }));
  }
  return floorMats.get(k);
}
