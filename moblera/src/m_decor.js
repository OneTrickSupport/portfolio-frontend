// 3D-modeller: lampor, växter, tavlor, speglar, pynt, mattor, gardiner och eldstäder.

import * as THREE from 'three';
import { def } from './catalog.js';
import { M, shade, box, cyl, sph, cone, rod, lathe, torus, blade, seeded, painted, DS, CHROME, BRASS, BLACKMETAL, CLEAR, MIRROR, GLOW, FLAME } from './kit.js';

const G = () => new THREE.Group();
const out = (a) => Math.PI / 2 - a; // vrid ett blad så att det pekar utåt i vinkeln a
const TAU = Math.PI * 2;
const SOIL = M('#3b3128', 1);
const POTS = { terra: '#b9735a', white: '#ecebe6', grey: '#8d9296', black: '#2f3336', sand: '#cdbfa6', blue: '#5f7f96' };

function pot(g, pr, ph, col, x = 0, z = 0) {
  lathe(g, [[0, 0], [pr * 0.72, 0], [pr, ph - 0.03], [pr * 1.07, ph - 0.03], [pr * 1.07, ph], [pr * 0.9, ph]], M(col, 0.75), x, 0, z, 24);
  cyl(g, pr * 0.92, pr * 0.92, 0.01, SOIL, x, ph - 0.012, z, 20);
}
function capsule(g, r, len, m, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len), 6, 14), m);
  mesh.position.set(x, y, z);
  g.add(mesh);
  return mesh;
}
function puff(g, r, m, x, y, z, sy = 0.8, detail = 1) {
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), m);
  mesh.position.set(x, y, z);
  mesh.scale.y = sy;
  g.add(mesh);
  return mesh;
}
/** Kupa som hänger nedåt (öppen undertill), med lysande glödlampa. */
function dome(g, r, h, m, x, y, z) {
  lathe(g, [[0.012, h], [r * 0.45, h * 0.92], [r * 0.85, h * 0.5], [r, 0]], m, x, y, z, 24);
  sph(g, Math.min(0.045, r * 0.4), GLOW, x, y + h * 0.3, z, 1, 1, 1, 12);
}
function vines(g, rnd, n, pr, y0, len, leaf, stem) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rnd() * 0.5, l = len * (0.45 + rnd() * 0.55), c = Math.cos(a), s = Math.sin(a);
    const p0 = [c * pr * 0.8, y0, s * pr * 0.8], p1 = [c * pr * 1.25, y0 - 0.03, s * pr * 1.25], p2 = [c * pr * 1.2, y0 - l, s * pr * 1.2];
    rod(g, p0, p1, 0.004, stem, 0.004, 5);
    rod(g, p1, p2, 0.004, stem, 0.004, 5);
    const k = Math.max(2, Math.round(l / 0.08));
    for (let j = 0; j <= k; j++) {
      const m = sph(g, 0.034, leaf, p1[0] + (rnd() - 0.5) * 0.03, p1[1] - (l * j) / k, p1[2] + (rnd() - 0.5) * 0.03, 1, 0.3, 1.25, 8);
      m.rotation.set(rnd() * 0.8, rnd() * 3, rnd() * 0.8);
    }
  }
}

// ---------- Tavelmotiv ----------
const PAL = [['#c8743f', '#e3b23c', '#8d9a8a', '#2f4858', '#e9d8c4'], ['#6b8f9c', '#d9a441', '#a3554a', '#33414d', '#efe6d6'], ['#b0875c', '#5c7d55', '#d8b4a0', '#3d4043', '#f1ece2'], ['#7d6b91', '#e8962e', '#9fb8ad', '#2b3a4a', '#f3ead9']];
function art(kind, v) {
  return painted(`art|${kind}|${v}`, (c, S) => {
    const rnd = seeded(v * 31 + kind.length * 7 + 3), pal = PAL[v % PAL.length];
    const R = (a, b) => a + rnd() * (b - a);
    c.fillStyle = pal[4];
    c.fillRect(0, 0, S, S);
    if (kind === 'abstract') {
      for (let i = 0; i < 6; i++) {
        c.fillStyle = pal[i % 4];
        c.globalAlpha = 0.9;
        c.beginPath();
        if (i % 3 === 0) c.arc(R(0.2, 0.8) * S, R(0.2, 0.8) * S, R(0.12, 0.3) * S, 0, TAU);
        else if (i % 3 === 1) c.arc(R(0.2, 0.8) * S, S * R(0.5, 1), R(0.2, 0.4) * S, Math.PI, TAU);
        else c.rect(R(0, 0.6) * S, R(0, 0.7) * S, R(0.2, 0.45) * S, R(0.08, 0.3) * S);
        c.fill();
      }
      c.globalAlpha = 1;
    } else if (kind === 'line') {
      c.strokeStyle = '#22262a';
      c.lineWidth = S * 0.012;
      c.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.moveTo(R(0.15, 0.4) * S, R(0.15, 0.85) * S);
        c.bezierCurveTo(R(0, 1) * S, R(0, 1) * S, R(0, 1) * S, R(0, 1) * S, R(0.6, 0.85) * S, R(0.15, 0.85) * S);
        c.stroke();
      }
      c.fillStyle = pal[v % 3];
      c.globalAlpha = 0.55;
      c.beginPath();
      c.arc(R(0.3, 0.7) * S, R(0.3, 0.7) * S, S * 0.16, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
    } else if (kind === 'landscape') {
      const gr = c.createLinearGradient(0, 0, 0, S);
      gr.addColorStop(0, v % 2 ? '#f0cfa9' : '#cfdfe6');
      gr.addColorStop(1, '#f4ead8');
      c.fillStyle = gr;
      c.fillRect(0, 0, S, S);
      c.fillStyle = v % 2 ? '#e8823a' : '#f2f0e6';
      c.beginPath();
      c.arc(S * R(0.3, 0.7), S * 0.36, S * 0.09, 0, TAU);
      c.fill();
      ['#93a8a4', '#6c8a80', '#46655c', '#2f4a45'].forEach((col, i) => {
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(0, S);
        const ph = R(0, 6), am = R(0.03, 0.08), y0 = 0.46 + i * 0.13;
        for (let x = 0; x <= S; x += 8) c.lineTo(x, S * (y0 + am * Math.sin(x / S * (4 + i * 2) + ph)));
        c.lineTo(S, S);
        c.fill();
      });
    } else if (kind === 'photo') {
      const gr = c.createLinearGradient(0, 0, 0, S);
      gr.addColorStop(0, '#d9dcde');
      gr.addColorStop(0.7, '#8d9498');
      gr.addColorStop(1, '#3c4145');
      c.fillStyle = gr;
      c.fillRect(0, 0, S, S);
      c.fillStyle = '#1e2225';
      for (let x = 0; x < S;) { const w = R(0.04, 0.1) * S; c.fillRect(x, S * R(0.4, 0.75), w, S); x += w + 2; }
    } else if (kind === 'botanical') {
      c.strokeStyle = '#4c6b4a';
      c.lineWidth = S * 0.01;
      for (let k = 0; k < 2; k++) {
        const x0 = S * (0.35 + k * 0.3), lean = R(-0.12, 0.12);
        c.beginPath();
        c.moveTo(x0, S * 0.92);
        c.lineTo(x0 + lean * S, S * 0.12);
        c.stroke();
        for (let i = 0; i < 7; i++) {
          const t = 0.15 + i * 0.11, x = x0 + lean * S * (1 - (0.92 - t) / 0.8) * 0 + lean * S * ((0.92 - t) / 0.8), y = S * t, sd = i % 2 ? 1 : -1;
          c.fillStyle = i % 3 ? '#5c7d55' : '#7f9a6c';
          c.beginPath();
          c.ellipse(x + sd * S * 0.07, y, S * 0.075, S * 0.028, sd * -0.5, 0, TAU);
          c.fill();
        }
      }
    } else if (kind === 'poster') {
      c.fillStyle = pal[v % 4];
      c.fillRect(S * 0.08, S * 0.08, S * 0.84, S * 0.6);
      c.fillStyle = pal[4];
      c.beginPath();
      c.arc(S * 0.5, S * 0.38, S * 0.17, 0, TAU);
      c.fill();
      c.fillStyle = '#22262a';
      c.font = `700 ${S * 0.13}px sans-serif`;
      c.textAlign = 'center';
      c.fillText(['STHLM', 'SOL', 'HAV', 'SKOG'][v % 4], S / 2, S * 0.84);
      c.font = `${S * 0.045}px sans-serif`;
      c.fillText('59°19′N 18°04′E', S / 2, S * 0.92);
    } else if (kind === 'map') {
      c.fillStyle = '#bcd3dc';
      c.fillRect(0, 0, S, S);
      c.fillStyle = '#e9dfc8';
      for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(R(0.1, 0.9) * S, R(0.2, 0.8) * S, R(0.06, 0.2) * S, R(0.05, 0.13) * S, R(0, 3), 0, TAU); c.fill(); }
    } else if (kind === 'cork') {
      c.fillStyle = '#c69c68';
      c.fillRect(0, 0, S, S);
      for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(90,60,30,${R(0.05, 0.2)})`; c.fillRect(R(0, S), R(0, S), 3, 3); }
      for (let i = 0; i < 7; i++) { c.fillStyle = ['#f6f1c4', '#f4f3ef', '#f3c9c0', '#cfe3ee'][i % 4]; c.fillRect(R(0.05, 0.75) * S, R(0.05, 0.75) * S, S * 0.18, S * 0.17); }
    } else if (kind === 'white') {
      c.fillStyle = '#fbfbf9';
      c.fillRect(0, 0, S, S);
      c.lineWidth = 3;
      ['#2456e6', '#d8432e', '#2f7d4f'].forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.moveTo(S * 0.1, S * (0.25 + i * 0.2)); c.bezierCurveTo(S * 0.3, S * (0.1 + i * 0.2), S * 0.5, S * (0.4 + i * 0.2), S * R(0.6, 0.9), S * (0.22 + i * 0.2)); c.stroke(); });
    }
  }, { rough: kind === 'white' ? 0.3 : 0.85 });
}
function framed(g, W, H, frameCol, kind, v, x = 0, y = 0, z = 0, mat = true) {
  const f = Math.min(0.03, W * 0.07), frame = M(frameCol, 0.55);
  box(g, W, H, 0.022, frame, x, y + H / 2, z);
  const pad = mat && kind !== 'cork' && kind !== 'white' && W > 0.25 ? Math.min(0.06, W * 0.1) : 0;
  if (pad) box(g, W - 2 * f, H - 2 * f, 0.004, M('#f6f4ee', 0.9), x, y + H / 2, z + 0.011);
  box(g, W - 2 * f - 2 * pad, H - 2 * f - 2 * pad, 0.004, art(kind, v), x, y + H / 2, z + 0.013);
}

// ---------- Mattmönster ----------
function rugMat(pattern, color) {
  return painted(`rug|${pattern}|${color}`, (c, S) => {
    const base = new THREE.Color(color), lite = '#' + base.clone().offsetHSL(0, -0.05, 0.14).getHexString(), dark = '#' + base.clone().offsetHSL(0, 0.02, -0.16).getHexString();
    c.fillStyle = color;
    c.fillRect(0, 0, S, S);
    if (pattern === 'stripe') {
      for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? lite : i % 4 ? color : dark; c.fillRect(0, (i * S) / 12, S, S / 12 + 1); }
    } else if (pattern === 'check') {
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? lite : color; c.fillRect((i * S) / 8, (j * S) / 8, S / 8 + 1, S / 8 + 1); }
    } else if (pattern === 'berber') {
      c.fillStyle = lite;
      c.fillRect(0, 0, S, S);
      c.strokeStyle = '#3a3836';
      c.lineWidth = S * 0.012;
      for (let i = -4; i < 8; i++) {
        c.beginPath(); c.moveTo(i * S * 0.25, 0); c.lineTo(i * S * 0.25 + S, S); c.stroke();
        c.beginPath(); c.moveTo(i * S * 0.25 + S, 0); c.lineTo(i * S * 0.25, S); c.stroke();
      }
    } else if (pattern === 'persian') {
      const gold = '#c9a45c', navy = '#27364a';
      c.fillStyle = navy; c.fillRect(0, 0, S, S);
      c.fillStyle = gold; c.fillRect(S * 0.05, S * 0.05, S * 0.9, S * 0.9);
      c.fillStyle = color; c.fillRect(S * 0.1, S * 0.1, S * 0.8, S * 0.8);
      c.fillStyle = navy;
      c.beginPath(); c.moveTo(S * 0.5, S * 0.22); c.lineTo(S * 0.72, S * 0.5); c.lineTo(S * 0.5, S * 0.78); c.lineTo(S * 0.28, S * 0.5); c.fill();
      c.fillStyle = gold;
      c.beginPath(); c.moveTo(S * 0.5, S * 0.33); c.lineTo(S * 0.63, S * 0.5); c.lineTo(S * 0.5, S * 0.67); c.lineTo(S * 0.37, S * 0.5); c.fill();
      c.fillStyle = dark;
      for (let i = 0; i < 9; i++) for (const y of [0.075, 0.925]) { c.beginPath(); c.arc(S * (0.1 + i * 0.1), S * y, S * 0.014, 0, TAU); c.fill(); c.beginPath(); c.arc(S * y, S * (0.1 + i * 0.1), S * 0.014, 0, TAU); c.fill(); }
      for (const [x, y] of [[0.18, 0.18], [0.82, 0.18], [0.18, 0.82], [0.82, 0.82]]) { c.fillStyle = navy; c.beginPath(); c.arc(S * x, S * y, S * 0.06, 0, TAU); c.fill(); }
    } else if (pattern === 'kilim') {
      const cols = [color, '#e9dfc8', '#27364a', '#c9a45c', dark];
      for (let b = 0; b < 7; b++) {
        c.fillStyle = cols[b % cols.length];
        c.fillRect(0, (b * S) / 7, S, S / 7 + 1);
        c.fillStyle = cols[(b + 2) % cols.length];
        for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo((i * S) / 8, ((b + 1) * S) / 7); c.lineTo(((i + 0.5) * S) / 8, ((b + 0.25) * S) / 7); c.lineTo(((i + 1) * S) / 8, ((b + 1) * S) / 7); c.fill(); }
      }
    } else if (pattern === 'play') {
      ['#e8962e', '#6fb3c9', '#8fbf73', '#e3b23c', '#d98a9a', '#9b8fd0'].forEach((col, i) => {
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(S / 2, S / 2);
        c.arc(S / 2, S / 2, S * 0.72, (i * TAU) / 6, ((i + 1) * TAU) / 6);
        c.fill();
      });
      c.fillStyle = '#fbf7ee';
      c.beginPath(); c.arc(S / 2, S / 2, S * 0.14, 0, TAU); c.fill();
    }
  }, { rough: 1 });
}

export const DECOR = {
  // ---------- Lampor ----------
  lamp(it, W, D, H) {
    const g = G(), k = def(it).kind, metal = M(it.color, 0.4, 0.6), r = Math.min(W, D) / 2;
    if (k === 'arc') {
      const R = Math.min(0.8, H * 0.4);
      box(g, 0.3, 0.06, 0.3, M('#e9e6e0', 0.25), 0, 0.03, 0, 0.008);
      cyl(g, 0.012, 0.012, H - R - 0.06, metal, 0, 0.06 + (H - R - 0.06) / 2, 0, 10);
      const t = torus(g, R, 0.012, metal, 0, H - R, R, Math.PI - 0.67, 32);
      t.rotation.set(0, -Math.PI / 2, 0.67);
      const zx = R + R * Math.cos(0.67), yx = H - R + R * Math.sin(0.67);
      rod(g, [0, yx, zx], [0, yx - 0.1, zx], 0.004, metal);
      dome(g, 0.2, 0.17, M(it.color, 0.4, 0.6, DS), 0, yx - 0.27, zx);
    } else if (k === 'tripod') {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + 0.5;
        rod(g, [Math.cos(a) * r, 0, Math.sin(a) * r], [Math.cos(a) * 0.03, H - 0.34, Math.sin(a) * 0.03], 0.012, M(it.color, 0.6), 0.016);
      }
      cyl(g, r * 0.62, r * 0.72, 0.32, GLOW, 0, H - 0.16, 0, 32);
    } else if (k === 'reading') {
      cyl(g, r * 0.85, r * 0.9, 0.02, metal, 0, 0.01, 0);
      cyl(g, 0.009, 0.009, H - 0.2, metal, 0, (H - 0.2) / 2, 0, 10);
      rod(g, [0, H - 0.2, 0], [0, H - 0.03, 0.22], 0.008, metal);
      const c = cone(g, 0.07, 0.13, M(it.color, 0.4, 0.6, DS), 0, H - 0.07, 0.26, 20);
      c.rotation.x = 0.7;
      sph(g, 0.03, GLOW, 0, H - 0.1, 0.29);
    } else if (k === 'uplight') {
      cyl(g, r * 0.85, r * 0.9, 0.02, metal, 0, 0.01, 0);
      cyl(g, 0.011, 0.011, H - 0.14, metal, 0, (H - 0.14) / 2, 0, 10);
      lathe(g, [[0.02, 0], [r * 0.6, 0.03], [r * 1.1, 0.14]], M(it.color, 0.4, 0.6, DS), 0, H - 0.14, 0, 28);
      cyl(g, r * 0.95, r * 0.7, 0.01, GLOW, 0, H - 0.03, 0, 24);
    } else if (k === 'paper') {
      box(g, W * 0.8, H - 0.05, D * 0.8, GLOW, 0, 0.05 + (H - 0.05) / 2, 0, 0.02);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.02, H, 0.02, M('#b98d5e', 0.6), sx * W * 0.42, H / 2, sz * D * 0.42);
    } else if (k === 'table') {
      lathe(g, [[0, 0], [r * 0.5, 0], [r * 0.62, H * 0.18], [r * 0.3, H * 0.42], [r * 0.1, H * 0.5], [0, H * 0.5]], M(it.color, 0.35), 0, 0, 0, 24);
      cyl(g, 0.006, 0.006, H * 0.2, BRASS, 0, H * 0.55, 0, 8);
      cyl(g, r * 0.7, r, H * 0.42, GLOW, 0, H * 0.79, 0, 32);
    } else if (k === 'mushroom') {
      cyl(g, r * 0.22, r * 0.42, H * 0.6, M(it.color, 0.3), 0, H * 0.3, 0, 20);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 12, 0, TAU, 0, Math.PI / 2), M(it.color, 0.3, 0, DS));
      cap.position.y = H - r * 0.7;
      cap.scale.y = 0.7;
      g.add(cap);
      cyl(g, r * 0.9, r * 0.9, 0.006, GLOW, 0, H - r * 0.69, 0, 24);
    } else if (k === 'desk') {
      cyl(g, 0.075, 0.08, 0.02, metal, 0, 0.01, -D / 2 + 0.09);
      rod(g, [0, 0.02, -D / 2 + 0.09], [0, H * 0.62, -D / 2 + 0.03], 0.007, metal);
      rod(g, [0, H * 0.62, -D / 2 + 0.03], [0, H * 0.94, D * 0.18], 0.007, metal);
      const c = cone(g, 0.06, 0.1, M(it.color, 0.4, 0.6, DS), 0, H * 0.9, D * 0.24, 18);
      c.rotation.x = 0.5;
      sph(g, 0.025, GLOW, 0, H * 0.86, D * 0.27);
    } else if (k === 'pendant' || k === 'trio') {
      const xs = k === 'trio' ? [-W / 3, 0, W / 3] : [0], sr = k === 'trio' ? Math.min(0.12, W / 8) : r, sh = sr * 0.9;
      if (k === 'trio') box(g, W * 0.82, 0.025, 0.06, metal, 0, H - 0.0125, 0);
      else cyl(g, 0.05, 0.05, 0.025, metal, 0, H - 0.0125, 0, 16);
      for (const x of xs) {
        rod(g, [x, sh, 0], [x, H - 0.02, 0], 0.003, BLACKMETAL, 0.003, 5);
        dome(g, sr, sh, M(it.color, 0.45, 0.5, DS), x, 0, 0);
      }
    } else if (k === 'globe') {
      cyl(g, 0.05, 0.05, 0.025, metal, 0, H - 0.0125, 0, 16);
      rod(g, [0, r * 2, 0], [0, H - 0.02, 0], 0.003, BLACKMETAL, 0.003, 5);
      cyl(g, 0.03, 0.03, 0.05, metal, 0, r * 2, 0, 12);
      sph(g, r, M('#fff3d6', 0.15, 0, { transparent: true, opacity: 0.62, emissive: '#ffd89a', emissiveIntensity: 0.5 }), 0, r, 0, 1, 1, 1, 24);
    } else if (k === 'rice') {
      rod(g, [0, r * 1.6, 0], [0, H, 0], 0.003, BLACKMETAL, 0.003, 5);
      sph(g, r, M('#fbf6e8', 0.95, 0, { emissive: '#ffe2b0', emissiveIntensity: 0.45 }), 0, r * 0.85, 0, 1, 0.85, 1, 24);
    } else if (k === 'chandelier') {
      cyl(g, 0.06, 0.06, 0.03, metal, 0, H - 0.015, 0, 16);
      rod(g, [0, 0.18, 0], [0, H - 0.02, 0], 0.008, metal);
      sph(g, 0.05, metal, 0, 0.2, 0);
      const R = r * 0.82;
      torus(g, R, 0.008, metal, 0, 0.26, 0, TAU, 32).rotation.x = Math.PI / 2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU, x = Math.cos(a) * R, z = Math.sin(a) * R;
        rod(g, [0, 0.2, 0], [x, 0.26, z], 0.006, metal);
        cyl(g, 0.011, 0.011, 0.09, M('#f6f4ee', 0.7), x, 0.31, z, 8);
        sph(g, 0.014, FLAME, x, 0.37, z, 1, 1.6, 1, 8);
        sph(g, 0.02, CLEAR, x, 0.2, z, 1, 1.5, 1, 6);
        sph(g, 0.016, CLEAR, Math.cos(a + 0.52) * R * 0.6, 0.13, Math.sin(a + 0.52) * R * 0.6, 1, 1.5, 1, 6);
      }
      sph(g, 0.03, CLEAR, 0, 0.1, 0, 1, 1.6, 1, 6);
    } else if (k === 'plafond') {
      cyl(g, r * 0.9, r, H * 0.8, M('#fbf6e8', 0.6, 0, { emissive: '#ffe2b0', emissiveIntensity: 0.5 }), 0, H * 0.4, 0, 32);
      cyl(g, r * 1.02, r * 1.02, H * 0.2, metal, 0, H * 0.9, 0, 32);
    } else if (k === 'spots') {
      box(g, W, 0.025, 0.035, metal, 0, H - 0.0125, 0);
      const n = Math.max(2, Math.round(W / 0.28));
      for (let i = 0; i < n; i++) {
        const x = -W / 2 + ((i + 0.5) * W) / n;
        const c = cyl(g, 0.032, 0.026, 0.08, metal, x, H - 0.075, 0.015, 14);
        c.rotation.x = 0.5 * (i % 2 ? -1 : 1);
        sph(g, 0.024, GLOW, x, H - 0.11, 0.015 + (i % 2 ? -0.02 : 0.02), 1, 0.5, 1, 10);
      }
    } else if (k === 'fan') {
      cyl(g, 0.06, 0.06, 0.03, metal, 0, H - 0.015, 0, 16);
      cyl(g, 0.012, 0.012, H - 0.2, metal, 0, 0.17 + (H - 0.2) / 2, 0, 8);
      cyl(g, 0.09, 0.09, 0.07, metal, 0, 0.17, 0, 20);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU, bl = box(g, r - 0.1, 0.008, 0.13, M('#b98d5e', 0.6), Math.cos(a) * (r / 2 + 0.04), 0.17, -Math.sin(a) * (r / 2 + 0.04), 0.003);
        bl.rotation.set(0.12, a, 0);
      }
      sph(g, 0.1, M('#fbf6e8', 0.6, 0, { emissive: '#ffe2b0', emissiveIntensity: 0.5 }), 0, 0.11, 0, 1, 0.6, 1, 18);
    } else if (k === 'sconce') {
      box(g, 0.1, 0.14, 0.018, metal, 0, H * 0.4, -D / 2 + 0.009, 0.006);
      rod(g, [0, H * 0.4, -D / 2 + 0.01], [0, H * 0.5, D * 0.1], 0.007, metal);
      cyl(g, W * 0.36, W * 0.48, H * 0.55, GLOW, 0, H * 0.7, D * 0.1, 24);
    } else if (k === 'lantern') {
      const fm = M(it.color, 0.5, 0.4), s = W / 2 - 0.01;
      box(g, W, 0.025, D, fm, 0, 0.0125, 0);
      box(g, W, 0.02, D, fm, 0, H * 0.78, 0);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.014, H * 0.78, 0.014, fm, sx * s, H * 0.39, sz * s);
      box(g, W - 0.03, H * 0.74, D - 0.03, CLEAR, 0, H * 0.4, 0);
      const top = cone(g, W * 0.7, H * 0.16, fm, 0, H * 0.87, 0, 4);
      top.rotation.y = Math.PI / 4;
      torus(g, 0.035, 0.005, fm, 0, H * 0.97, 0, TAU, 14);
      cyl(g, 0.03, 0.03, H * 0.3, M('#f6f4ee', 0.7), 0, 0.025 + H * 0.15, 0, 12);
      sph(g, 0.012, FLAME, 0, 0.04 + H * 0.32, 0, 1, 1.8, 1, 8);
    } else {
      cyl(g, r * 0.75, r * 0.8, 0.02, metal, 0, 0.01, 0);
      cyl(g, 0.011, 0.011, H - 0.26, metal, 0, (H - 0.26) / 2, 0, 10);
      cyl(g, r * 0.8, r, 0.26, GLOW, 0, H - 0.13, 0, 32);
    }
    return g;
  },

  // ---------- Växter ----------
  plant(it, W, D, H) {
    const g = G(), d = def(it), k = d.kind, r = Math.min(W, D) / 2, rnd = seeded(it.id || 3);
    const leaf = M(it.color, 0.75, 0, DS), flat = M(it.color, 1, 0, { flatShading: true }), stem = M('#5b4a38', 0.9), green = M(shade(it.color, -0.05), 0.8);
    const pc = POTS[d.pot] || POTS.sand, s = Math.min(1.3, Math.max(0.35, H / 1.5));
    let pr = Math.min(0.24, r * 0.6), ph = Math.min(0.34, H * 0.28);
    const R = (a, b) => a + rnd() * (b - a);
    if (k === 'monstera') {
      pot(g, pr, ph, pc);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + R(0, 0.5), rr = r * R(0.3, 0.75), y = ph + (H - ph) * R(0.4, 0.92), ln = r * R(0.75, 1.05);
        rod(g, [0, ph, 0], [Math.cos(a) * rr, y, Math.sin(a) * rr], 0.006, green, 0.005, 6);
        blade(g, leaf, { len: ln, wid: ln * 0.85, pitch: R(0.1, 0.5), droop: 0.3, yaw: out(a), x: Math.cos(a) * rr, y, z: Math.sin(a) * rr, fold: 0.12 });
      }
    } else if (k === 'fiddle' || k === 'rubber') {
      pot(g, pr, ph, pc);
      const top = k === 'fiddle' ? H * 0.6 : H * 0.92, y0 = k === 'fiddle' ? H * 0.5 : ph + 0.1;
      rod(g, [0, ph, 0], [0.02, top, 0.01], 0.016 * s, stem, 0.01 * s, 8);
      const lm = k === 'rubber' ? M(it.color, 0.35, 0, DS) : leaf, n = k === 'fiddle' ? 17 : 13;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1), a = i * 2.4, y = y0 + (H - 0.14 * s - y0) * t;
        blade(g, lm, { len: (k === 'fiddle' ? 0.36 : 0.26) * s, wid: (k === 'fiddle' ? 0.25 : 0.14) * s, pitch: 0.35 + t * 0.9, droop: 0.22, yaw: out(a), x: 0.01, y, z: 0, fold: 0.15 });
      }
    } else if (k === 'palm') {
      pot(g, pr, ph, pc);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + R(0, 0.5), lean = r * R(0.08, 0.3), y = ph + (H - ph) * R(0.3, 0.55);
        const x = Math.cos(a) * lean, z = Math.sin(a) * lean;
        rod(g, [x * 0.2, ph, z * 0.2], [x, y, z], 0.012 * s, green, 0.008 * s, 6);
        for (let j = 0; j < 3; j++) {
          const b = a + (j - 1) * 1.5 + R(-0.3, 0.3);
          blade(g, leaf, { len: (H - y) * R(0.95, 1.25), wid: 0.2 * s, pitch: R(0.75, 1.35), droop: R(0.25, 0.42), yaw: out(b), x, y, z, fold: 0.35, segs: 10 });
        }
      }
    } else if (k === 'snake') {
      pot(g, pr, ph, pc);
      for (let i = 0; i < 10; i++) {
        const a = R(0, TAU), rr = pr * R(0, 0.6);
        blade(g, leaf, { len: (H - ph) * R(0.6, 1), wid: 0.075 * s + 0.02, pitch: R(1.38, 1.52), droop: 0.02, yaw: out(a) + R(-0.6, 0.6), x: Math.cos(a) * rr, y: ph - 0.02, z: Math.sin(a) * rr, fold: 0.35, strap: true });
      }
    } else if (k === 'cactus') {
      pot(g, pr, ph, pc);
      const cr = Math.min(0.09, r * 0.3), body = M(it.color, 0.7);
      capsule(g, cr, H - ph - 2 * cr, body, 0, ph + (H - ph) / 2, 0);
      for (const [sx, y, len] of [[-1, 0.5, 0.26], [1, 0.62, 0.18]]) {
        const yy = ph + (H - ph) * y, x = sx * (cr + 0.1);
        rod(g, [0, yy, 0], [x, yy, 0], cr * 0.6, body, cr * 0.6, 12);
        capsule(g, cr * 0.6, (H - ph) * len, body, x, yy + ((H - ph) * len) / 2, 0);
      }
    } else if (k === 'olive' || k === 'citrus') {
      pot(g, pr, ph, pc);
      rod(g, [0, ph, 0], [0.03, H * 0.42, 0.02], 0.02 * s, stem, 0.015 * s, 8);
      rod(g, [0.03, H * 0.42, 0.02], [-0.02, H * 0.66, 0], 0.015 * s, stem, 0.01 * s, 8);
      for (let i = 0; i < 9; i++) {
        const a = R(0, TAU), rr = r * R(0.1, 0.62);
        puff(g, r * R(0.3, 0.46), flat, Math.cos(a) * rr - 0.02, H * R(0.62, 0.9), Math.sin(a) * rr, 0.8);
      }
      if (k === 'citrus') for (let i = 0; i < 8; i++) {
        const a = R(0, TAU);
        sph(g, 0.032 * s, M(d.fruit || '#e8962e', 0.6), Math.cos(a) * r * 0.72, H * R(0.6, 0.85), Math.sin(a) * r * 0.72, 1, 1, 1, 10);
      }
    } else if (k === 'fern') {
      pr = Math.min(0.2, r * 0.5);
      pot(g, pr, ph, pc);
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU + R(0, 0.3);
        blade(g, leaf, { len: r * R(1.25, 1.75), wid: 0.1 * s + 0.05, pitch: R(0.7, 1.35), droop: R(0.4, 0.65), yaw: out(a), x: 0, y: ph, z: 0, fold: 0.15, segs: 8 });
      }
    } else if (k === 'trailing' || k === 'hanging') {
      const y0 = k === 'hanging' ? Math.min(H * 0.45, 0.5) : 0;
      if (k === 'hanging') {
        ph = 0.16; pr = Math.min(0.13, r * 0.55);
        for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; rod(g, [0, H, 0], [Math.cos(a) * pr, y0 + ph, Math.sin(a) * pr], 0.003, M('#cdbfa6', 1), 0.003, 5); }
      } else { ph = Math.min(0.16, H * 0.5); pr = Math.min(0.11, r * 0.5); }
      const pg = G();
      pg.position.y = y0;
      g.add(pg);
      pot(pg, pr, ph, pc);
      puff(pg, pr * 1.25, flat, 0, ph + pr * 0.4, 0, 0.6);
      vines(pg, rnd, 9, pr, ph, k === 'hanging' ? y0 + ph : 0.5, M(it.color, 0.8), green);
    } else if (k === 'succulent') {
      pr = r * 0.8; ph = H * 0.5;
      pot(g, pr, ph, pc);
      for (let i = 0; i < 14; i++) blade(g, M(it.color, 0.6, 0, DS), { len: r * R(0.7, 1.05), wid: r * 0.5, pitch: 0.25 + (i / 14) * 1.1, droop: -0.1, yaw: i * 2.4, x: 0, y: ph - 0.01, z: 0, fold: 0.5 });
    } else if (k === 'orchid') {
      pr = r * 0.5; ph = H * 0.24;
      pot(g, pr, ph, pc);
      for (let i = 0; i < 4; i++) blade(g, M(it.color, 0.5, 0, DS), { len: r * 1.1, wid: r * 0.42, pitch: 0.35, droop: 0.3, yaw: i * 1.7, x: 0, y: ph, z: 0, fold: 0.2 });
      rod(g, [0, ph, 0], [0.02, H * 0.72, 0], 0.004, green, 0.004, 6);
      rod(g, [0.02, H * 0.72, 0], [r * 0.7, H * 0.97, 0.02], 0.004, green, 0.003, 6);
      const fl = M(d.flower || '#f6f4ee', 0.7), cen = M('#b0468f', 0.7);
      for (let i = 0; i < 5; i++) {
        const t = i / 4, x = 0.02 + (r * 0.7 - 0.02) * t, y = H * (0.72 + 0.25 * t) - 0.02;
        sph(g, 0.036, fl, x, y, 0.03, 1.15, 0.9, 0.3, 10);
        sph(g, 0.01, cen, x, y, 0.045, 1, 1, 1, 6);
      }
    } else if (k === 'herbs') {
      const n = 3, pw = W / n;
      for (let i = 0; i < n; i++) {
        const x = -W / 2 + pw * (i + 0.5);
        pot(g, pw * 0.36, H * 0.42, POTS.terra, x, 0);
        puff(g, pw * 0.42, M(['#5c7d55', '#7f9a6c', '#4c6b4a'][i], 1, 0, { flatShading: true }), x, H * 0.66, 0, 0.9);
      }
    } else if (k === 'bouquet' || k === 'pampas' || k === 'twigs') {
      const vh = k === 'bouquet' ? H * 0.5 : H * 0.42, vr = Math.min(r * 0.6, 0.16);
      const vm = k === 'bouquet' ? M('#b9cbd6', 0.12, 0, { transparent: true, opacity: 0.6 }) : M(pc, 0.4);
      lathe(g, [[0, 0], [vr * 0.6, 0], [vr, vh * 0.35], [vr * 0.75, vh * 0.75], [vr * 0.45, vh * 0.92], [vr * 0.55, vh]], vm, 0, 0, 0, 24);
      const n = k === 'twigs' ? 6 : 9, cols = ['#d98a9a', '#f6f4ee', '#e3b23c', '#b0468f', '#e8962e'];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + R(0, 0.6), rr = r * R(0.25, 0.95), y = H * R(0.78, 1);
        const tip = [Math.cos(a) * rr, y, Math.sin(a) * rr];
        rod(g, [0, vh * 0.5, 0], tip, 0.004, k === 'bouquet' ? green : M('#8a7458', 0.9), 0.003, 5);
        if (k === 'bouquet') sph(g, 0.04 * Math.max(0.6, s), M(d.flower || cols[i % cols.length], 0.8), tip[0], tip[1], tip[2], 1, 0.8, 1, 10);
        else if (k === 'pampas') rod(g, [tip[0] * 0.55, vh * 0.5 + (y - vh * 0.5) * 0.55, tip[2] * 0.55], tip, 0.012, M(it.color, 1), 0.04, 8);
        else rod(g, [tip[0] * 0.6, y * 0.75, tip[2] * 0.6], [tip[0] * 0.6 + Math.sin(a) * 0.12, y * 0.92, tip[2] * 0.6 - Math.cos(a) * 0.12], 0.003, M('#8a7458', 0.9), 0.002, 5);
      }
    } else if (k === 'bamboo') {
      pot(g, pr, ph, pc);
      for (let i = 0; i < 6; i++) {
        const a = R(0, TAU), rr = pr * R(0.1, 0.6), top = H * R(0.72, 1), x = Math.cos(a) * rr, z = Math.sin(a) * rr;
        rod(g, [x, ph, z], [x * 1.3, top, z * 1.3], 0.011, M('#9aa86a', 0.5), 0.008, 8);
        for (let j = 0; j < 4; j++) blade(g, leaf, { len: 0.2 * s + 0.05, wid: 0.035, pitch: R(0.1, 0.7), droop: 0.3, yaw: R(0, TAU), x: x * 1.3, y: top * R(0.62, 0.98), z: z * 1.3, strap: true });
      }
    } else if (k === 'strelitzia') {
      pot(g, pr, ph, pc);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + R(0, 0.4), rr = r * R(0.15, 0.5), y = ph + (H - ph) * R(0.35, 0.62);
        rod(g, [0, ph, 0], [Math.cos(a) * rr, y, Math.sin(a) * rr], 0.01, green, 0.007, 6);
        blade(g, leaf, { len: (H - y) * R(0.85, 1.05), wid: 0.2 * s, pitch: R(1.05, 1.4), droop: 0.14, yaw: out(a), x: Math.cos(a) * rr, y, z: Math.sin(a) * rr, fold: 0.2 });
      }
    } else if (k === 'yucca' || k === 'dracaena') {
      pot(g, pr, ph, pc);
      const thin = k === 'dracaena', tr = thin ? 0.014 : 0.04;
      const tops = thin ? [[0.05, H * 0.72, 0.02], [-0.07, H * 0.55, -0.03], [0.02, H * 0.4, 0.07]] : [[0, H * 0.62, 0], [0.09, H * 0.36, 0.04]];
      for (const [x, y, z] of tops) {
        rod(g, [x * 0.3, ph, z * 0.3], [x, y, z], tr * s, stem, tr * 0.8 * s, 8);
        for (let i = 0; i < 16; i++) blade(g, leaf, { len: (thin ? 0.3 : 0.42) * s, wid: thin ? 0.022 : 0.04, pitch: R(-0.1, 1.45), droop: thin ? 0.55 : 0.12, yaw: R(0, TAU), x, y, z, strap: true, fold: 0.3 });
      }
    } else if (k === 'peacelily') {
      pot(g, pr, ph, pc);
      for (let i = 0; i < 14; i++) blade(g, M(it.color, 0.45, 0, DS), { len: (H - ph) * R(0.75, 1.1), wid: 0.12 * s + 0.04, pitch: R(0.8, 1.4), droop: R(0.22, 0.4), yaw: R(0, TAU), x: 0, y: ph, z: 0, fold: 0.2 });
      for (let i = 0; i < 3; i++) {
        const a = i * 2.2 + 0.4, x = Math.cos(a) * r * 0.25, z = Math.sin(a) * r * 0.25, y = H * R(0.82, 0.96);
        rod(g, [0, ph, 0], [x, y, z], 0.004, green, 0.003, 5);
        blade(g, M('#f8f6f0', 0.6, 0, DS), { len: 0.12 * s + 0.03, wid: 0.07 * s + 0.015, pitch: 1.35, droop: 0.05, yaw: out(a), x, y, z, fold: 0.5 });
      }
    } else if (k === 'xmas') {
      cyl(g, 0.16, 0.2, 0.05, M('#7a2f2a', 0.7), 0, 0.025, 0, 16);
      cyl(g, 0.035, 0.045, 0.3, stem, 0, 0.18, 0, 8);
      const n = 5, y0 = 0.22, hh = H - y0 - 0.08, balls = ['#c8362e', '#d9a441', '#e9e6e0'];
      for (let i = 0; i < n; i++) {
        const t = i / n, rr = r * (1 - t * 0.82), ch = (hh / n) * 1.7, y = y0 + (hh * i) / n;
        cone(g, rr, ch, flat, 0, y + ch / 2, 0, 12);
        for (let j = 0; j < 5 - i; j++) {
          const a = R(0, TAU), u = R(0.15, 0.6);
          sph(g, 0.028, M(balls[Math.floor(R(0, 3))], 0.25, 0.5), Math.cos(a) * rr * (1 - u) * 0.98, y + ch * u, Math.sin(a) * rr * (1 - u) * 0.98, 1, 1, 1, 8);
        }
      }
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), M('#e3b23c', 0.3, 0.6, { emissive: '#e3b23c', emissiveIntensity: 0.5 }));
      star.position.y = H - 0.05;
      g.add(star);
      box(g, 0.24, 0.16, 0.2, M('#27364a', 0.6), r * 0.55, 0.08, r * 0.3).rotation.y = 0.4;
      box(g, 0.18, 0.12, 0.18, M('#c8362e', 0.6), -r * 0.5, 0.06, r * 0.4).rotation.y = -0.3;
    } else if (k === 'emptypot') {
      lathe(g, [[0, 0], [r * 0.5, 0], [r * 0.95, H * 0.45], [r, H * 0.62], [r * 0.72, H * 0.9], [r * 0.82, H], [r * 0.7, H], [r * 0.6, H * 0.9]], M(it.color, 0.8, 0, DS), 0, 0, 0, 28);
    } else if (k === 'planterbox') {
      box(g, W, H * 0.55, D, M(pc, 0.7), 0, H * 0.275, 0, 0.008);
      box(g, W - 0.03, 0.01, D - 0.03, SOIL, 0, H * 0.55, 0);
      const n = Math.max(3, Math.round(W / 0.16)), cols = ['#d98a9a', '#f6f4ee', '#e3b23c', '#b0468f'];
      for (let i = 0; i < n; i++) {
        const x = -W / 2 + ((i + 0.5) * W) / n;
        puff(g, Math.min(D * 0.55, 0.1), flat, x, H * 0.72, 0, 0.8);
        for (let j = 0; j < 3; j++) sph(g, 0.022, M(cols[(i + j) % cols.length], 0.8), x + R(-0.05, 0.05), H * R(0.8, 0.98), R(-0.05, 0.05), 1, 0.8, 1, 8);
      }
    } else if (k === 'bonsai') {
      box(g, W * 0.7, 0.05, D * 0.5, M(pc, 0.6), 0, 0.025, 0, 0.012);
      const p1 = [0.03, H * 0.45, 0.01], p2 = [-0.03, H * 0.72, 0];
      rod(g, [-0.03, 0.05, 0], p1, 0.02, stem, 0.014, 8);
      rod(g, p1, p2, 0.014, stem, 0.008, 8);
      rod(g, p1, [r * 0.55, H * 0.6, 0.02], 0.009, stem, 0.006, 6);
      puff(g, r * 0.5, flat, p2[0], H * 0.86, 0, 0.45);
      puff(g, r * 0.36, flat, r * 0.55, H * 0.66, 0.02, 0.45);
      puff(g, r * 0.3, flat, -r * 0.45, H * 0.6, 0.03, 0.45);
    } else {
      cyl(g, r * 0.62, r * 0.45, 0.32, M('#bfb3a2', 0.8), 0, 0.16, 0, 24);
      cyl(g, r * 0.58, r * 0.58, 0.01, SOIL, 0, 0.318, 0, 24);
      cyl(g, 0.014, 0.02, H * 0.5, stem, 0, 0.32 + H * 0.25, 0, 8);
      for (let i = 0; i < 9; i++) {
        const a = rnd() * TAU, rr = r * (0.25 + rnd() * 0.55), y = 0.45 + rnd() * (H - 0.6);
        puff(g, r * (0.35 + rnd() * 0.3), flat, Math.cos(a) * rr, y, Math.sin(a) * rr, 0.75);
      }
    }
    return g;
  },

  // ---------- Tavlor, speglar och pynt ----------
  picture(it, W, D, H) {
    const g = G();
    framed(g, W, H, it.color, def(it).art || 'abstract', (it.id || 0) % 6, 0, 0, -D / 2 + 0.011);
    return g;
  },
  gallery(it, W, D, H) {
    const g = G(), kinds = ['abstract', 'line', 'botanical', 'photo', 'landscape', 'poster'], frames = ['#2f3336', '#b98d5e', '#f2f1ec'];
    [[0, 0.45, 0.3, 0.55], [0.34, 0.3, 0.32, 0.7], [0.7, 0.52, 0.3, 0.48], [0, 0, 0.3, 0.4], [0.7, 0, 0.3, 0.46], [0.34, 0, 0.32, 0.25]].forEach(([x, y, w, h], i) => {
      framed(g, w * W - 0.02, h * H - 0.02, frames[(i + (it.id || 0)) % 3], kinds[i], (i + (it.id || 0)) % 6, -W / 2 + (x + w / 2) * W, y * H, -D / 2 + 0.011);
    });
    return g;
  },
  easel(it, W, D, H) {
    const g = G(), wood = M(it.color, 0.6);
    rod(g, [-W / 2 + 0.02, 0, D / 2 - 0.05], [0, H, -D * 0.1], 0.014, wood);
    rod(g, [W / 2 - 0.02, 0, D / 2 - 0.05], [0, H, -D * 0.1], 0.014, wood);
    rod(g, [0, 0, -D / 2 + 0.03], [0, H, -D * 0.1], 0.014, wood);
    box(g, W * 0.8, 0.03, 0.05, wood, 0, H * 0.4, D * 0.22);
    const c = G();
    c.position.set(0, H * 0.415, D * 0.2);
    c.rotation.x = -0.2;
    g.add(c);
    framed(c, W * 0.75, H * 0.42, '#f2f1ec', 'landscape', (it.id || 0) % 6, 0, 0, 0, false);
    return g;
  },
  mirror(it, W, D, H) {
    const g = G(), k = def(it).kind, frame = M(it.color, 0.45, k === 'round' ? 0.6 : 0.2), z = -D / 2 + 0.012;
    if (k === 'round') {
      const sc = G();
      sc.scale.y = H / W;
      sc.position.set(0, H / 2, z);
      g.add(sc);
      cyl(sc, W / 2 - 0.012, W / 2 - 0.012, 0.012, MIRROR, 0, 0, 0.004, 48).rotation.x = Math.PI / 2;
      torus(sc, W / 2 - 0.012, 0.012, frame, 0, 0, 0, TAU, 48);
    } else if (k === 'arch') {
      const shape = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); return s; };
      const fr = new THREE.Mesh(new THREE.ExtrudeGeometry(shape(W, H), { depth: 0.02, bevelEnabled: false, curveSegments: 24 }), frame);
      fr.position.set(0, 0, z - 0.01);
      const gl = new THREE.Mesh(new THREE.ExtrudeGeometry(shape(W - 0.04, H - 0.04), { depth: 0.004, bevelEnabled: false, curveSegments: 24 }), MIRROR);
      gl.position.set(0, 0.02, z + 0.011);
      g.add(fr, gl);
    } else {
      const tilt = G();
      if (k === 'floor') { tilt.position.z = D / 2 - 0.03; tilt.rotation.x = -Math.atan2(D - 0.05, H); }
      g.add(tilt);
      const zz = k === 'floor' ? 0 : z;
      box(tilt, W, H, 0.022, frame, 0, H / 2, zz);
      box(tilt, W - 0.05, H - 0.05, 0.004, MIRROR, 0, H / 2, zz + 0.012);
    }
    return g;
  },
  clock(it, W, D, H) {
    const g = G(), dart = def(it).kind === 'dart', r = W / 2;
    const face = painted(dart ? 'dart' : 'clock', (c, S) => {
      c.translate(S / 2, S / 2);
      if (dart) {
        [['#22262a', 0.5], ['#e9dfc8', 0.44], ['#c8362e', 0.3], ['#e9dfc8', 0.26], ['#2f7d4f', 0.1], ['#c8362e', 0.04]].forEach(([col, rr]) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, S * rr, 0, TAU); c.fill(); });
        c.strokeStyle = '#22262a';
        c.lineWidth = 1.5;
        for (let i = 0; i < 20; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos((i * TAU) / 20) * S * 0.44, Math.sin((i * TAU) / 20) * S * 0.44); c.stroke(); }
      } else {
        c.fillStyle = '#f8f6f0';
        c.beginPath(); c.arc(0, 0, S / 2, 0, TAU); c.fill();
        c.fillStyle = '#22262a';
        for (let i = 0; i < 12; i++) { c.save(); c.rotate((i * TAU) / 12); c.fillRect(-S * 0.008, -S * 0.46, S * 0.016, S * (i % 3 ? 0.05 : 0.09)); c.restore(); }
        c.save(); c.rotate(-1.05); c.fillRect(-S * 0.014, -S * 0.26, S * 0.028, S * 0.3); c.restore();
        c.save(); c.rotate(1.05); c.fillRect(-S * 0.009, -S * 0.38, S * 0.018, S * 0.42); c.restore();
      }
    }, { rough: 0.6 });
    const rim = M(it.color, 0.5, 0.3);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.008, r - 0.008, 0.03, 48), [rim, face, rim]);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(0, H / 2, -D / 2 + 0.016);
    g.add(disc);
    torus(g, r - 0.008, 0.01, rim, 0, H / 2, -D / 2 + 0.03, TAU, 48);
    return g;
  },
  vase(it, W, D, H) {
    const g = G(), k = def(it).kind, r = Math.min(W, D) / 2, m = M(it.color, 0.35, 0, DS);
    const prof = k === 'round' ? [[0, 0], [r * 0.5, 0], [r, H * 0.4], [r * 0.85, H * 0.72], [r * 0.4, H * 0.9], [r * 0.48, H]]
      : k === 'jug' ? [[0, 0], [r * 0.6, 0], [r, H * 0.3], [r * 0.9, H * 0.55], [r * 0.45, H * 0.8], [r * 0.6, H]]
        : [[0, 0], [r * 0.55, 0], [r * 0.9, H * 0.25], [r, H * 0.5], [r * 0.5, H * 0.85], [r * 0.62, H]];
    lathe(g, prof, m, 0, 0, 0, 28);
    if (k === 'jug') torus(g, H * 0.16, r * 0.1, m, r * 0.85, H * 0.6, 0, Math.PI, 14).rotation.z = -Math.PI / 2;
    return g;
  },
  candles(it, W, D, H) {
    const g = G(), m = M(it.color, 0.3, 0.9), n = 3;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + ((i + 0.5) * W) / n, h = H * [0.5, 0.72, 0.38][i];
      lathe(g, [[0, 0], [0.035, 0], [0.038, 0.012], [0.008, 0.03], [0.008, h - 0.02], [0.02, h - 0.01], [0.02, h]], m, x, 0, 0, 16);
      cyl(g, 0.011, 0.011, H * 0.24, M('#f6f4ee', 0.7), x, h + H * 0.12, 0, 10);
      sph(g, 0.009, FLAME, x, h + H * 0.24 + 0.012, 0, 1, 1.9, 1, 8);
    }
    return g;
  },
  books(it, W, D, H) {
    const g = G(), rnd = seeded(it.id || 21), n = Math.max(2, Math.round(H / 0.04)), cols = ['#7a5c4a', '#40566b', '#a8763e', '#5d6e58', '#e5dcc8', '#8b3d3a'];
    for (let i = 0; i < n; i++) {
      const b = box(g, W * (0.82 + rnd() * 0.18), H / n - 0.003, D * (0.82 + rnd() * 0.18), M(cols[Math.floor(rnd() * cols.length)], 0.9), 0, (i + 0.5) * (H / n), 0, 0.003);
      b.rotation.y = (rnd() - 0.5) * 0.35;
    }
    return g;
  },
  bowl(it, W, D, H) {
    const g = G(), r = W / 2;
    lathe(g, [[0, 0], [r * 0.35, 0], [r * 0.4, 0.012], [r, H * 0.62], [r * 0.95, H * 0.62], [r * 0.36, 0.024], [0, 0.024]], M(it.color, 0.4, 0, DS), 0, 0, 0, 28);
    [['#e8962e', 0.3, 0], ['#8fbf73', -0.25, 0.2], ['#c8362e', -0.1, -0.3], ['#e3b23c', 0.12, 0.34], ['#e8962e', -0.34, -0.1]].forEach(([c, x, z], i) => sph(g, r * 0.26, M(c, 0.6), x * r, H * (0.52 + (i % 2) * 0.12), z * r, 1, 0.95, 1, 12));
    return g;
  },
  sculpture(it, W, D, H) {
    const g = G(), r = Math.min(W, D) / 2;
    cyl(g, r * 0.6, r * 0.7, H * 0.12, M('#2f3336', 0.5), 0, H * 0.06, 0, 20);
    const k = new THREE.Mesh(new THREE.TorusKnotGeometry(r * 0.52, r * 0.17, 80, 10, 2, 3), M(it.color, 0.35, 0.4));
    k.position.y = H * 0.56;
    k.scale.y = (H * 0.8) / (r * 1.6);
    g.add(k);
    return g;
  },
  globe(it, W, D, H) {
    const g = G(), r = Math.min(W / 2, H * 0.36), cy = H - r - 0.02, m = M(it.color, 0.35, 0.8);
    cyl(g, r * 0.55, r * 0.62, 0.02, m, 0, 0.01, 0, 24);
    cyl(g, 0.01, 0.014, cy - r - 0.02, m, 0, (cy - r) / 2, 0, 10);
    torus(g, r + 0.012, 0.006, m, 0, cy, 0, Math.PI, 28).rotation.z = -Math.PI / 2 - 0.4;
    const ball = sph(g, r, painted('globe', (c, S) => {
      const rnd = seeded(42);
      c.fillStyle = '#5f8fae';
      c.fillRect(0, 0, S, S);
      c.fillStyle = '#9db27a';
      for (let i = 0; i < 16; i++) { c.beginPath(); c.ellipse(rnd() * S, S * (0.2 + rnd() * 0.6), S * (0.04 + rnd() * 0.1), S * (0.03 + rnd() * 0.08), rnd() * 3, 0, TAU); c.fill(); }
    }, { rough: 0.5 }), 0, cy, 0, 1, 1, 1, 28);
    ball.rotation.z = 0.4;
    return g;
  },
  photoframe(it, W, D, H) {
    const g = G(), t = G();
    t.position.z = D / 2 - 0.02;
    t.rotation.x = -0.22;
    g.add(t);
    framed(t, W, H * 0.98, it.color, 'photo', (it.id || 0) % 6, 0, 0, 0, false);
    rod(g, [0, H * 0.6, D / 2 - 0.15], [0, 0, -D / 2 + 0.01], 0.004, BLACKMETAL);
    return g;
  },
  partition(it, W, D, H) {
    const g = G(), n = 3, pw = Math.hypot(W / n, D * 0.8), a = Math.atan2(D * 0.8, W / n), frame = M(it.color, 0.6);
    for (let i = 0; i < n; i++) {
      const p = G();
      p.position.set(-W / 2 + (W / n) * (i + 0.5), 0, 0);
      p.rotation.y = i % 2 ? a : -a;
      g.add(p);
      box(p, pw, H, 0.025, frame, 0, H / 2, 0, 0.004);
      box(p, pw - 0.08, H - 0.16, 0.028, M('#efe6d6', 1), 0, H / 2 + 0.02, 0);
    }
    return g;
  },
  radiator(it, W, D, H) {
    const g = G(), m = M(it.color, 0.4), n = Math.max(3, Math.round(W / 0.06));
    for (let i = 0; i < n; i++) box(g, (W / n) * 0.78, H, D * 0.72, m, -W / 2 + ((i + 0.5) * W) / n, H / 2, 0, 0.012);
    for (const y of [0.05, H - 0.05]) rod(g, [-W / 2, y, 0], [W / 2, y, 0], D * 0.2, m);
    cyl(g, 0.02, 0.02, 0.06, M('#e6e6e3', 0.4), W / 2 + 0.02, H - 0.05, 0, 12).rotation.z = Math.PI / 2;
    return g;
  },
  fireplace(it, W, D, H) {
    const g = G(), k = def(it).kind;
    const tile = painted('kakel', (c, S) => {
      c.fillStyle = '#f3f1ea';
      c.fillRect(0, 0, S, S);
      c.strokeStyle = 'rgba(120,125,120,.45)';
      c.lineWidth = 1.5;
      for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo((i * S) / 8, 0); c.lineTo((i * S) / 8, S); c.stroke(); }
      for (let j = 0; j <= 12; j++) { c.beginPath(); c.moveTo(0, (j * S) / 12); c.lineTo(S, (j * S) / 12); c.stroke(); }
    }, { rough: 0.15 });
    const white = M('#f3f1ea', 0.18), iron = M('#232527', 0.55, 0.5);
    if (k === 'kakelugn' || k === 'kakelrect') {
      const round = k === 'kakelugn', r = W / 2, bh = H * 0.86;
      const sc = G();
      sc.scale.z = D / W;
      g.add(sc);
      if (round) {
        cyl(sc, r * 1.05, r * 1.05, 0.14, white, 0, 0.07, 0, 40);
        cyl(sc, r * 0.96, r * 0.96, bh - 0.14, tile, 0, 0.14 + (bh - 0.14) / 2, 0, 40);
        for (const y of [0.52, bh * 0.62]) cyl(sc, r, r, 0.05, white, 0, y, 0, 40);
        cyl(sc, r * 1.08, r * 0.98, 0.07, white, 0, bh + 0.035, 0, 40);
        lathe(sc, [[r * 0.98, 0], [r * 0.8, H * 0.05], [r * 0.5, H * 0.07], [0, H * 0.075]], white, 0, bh + 0.07, 0, 40);
      } else {
        box(g, W * 1.04, 0.14, D * 1.04, white, 0, 0.07, 0);
        box(g, W * 0.96, bh - 0.14, D * 0.96, tile, 0, 0.14 + (bh - 0.14) / 2, 0);
        box(g, W * 1.08, 0.07, D * 1.08, white, 0, bh + 0.035, 0);
        box(g, W * 0.8, H - bh - 0.08, D * 0.5, white, 0, bh + 0.07 + (H - bh - 0.08) / 2, -D * 0.1, 0.03);
      }
      const zf = (round ? r * (D / W) * 0.96 : D * 0.48);
      box(g, Math.min(0.34, W * 0.5), 0.36, 0.02, M('#b08d57', 0.3, 0.9), 0, 0.82, zf, 0.01);
      box(g, Math.min(0.26, W * 0.4), 0.16, 0.02, iron, 0, 0.34, zf, 0.01);
      sph(g, 0.014, iron, 0.1, 0.82, zf + 0.018);
    } else if (k === 'kamin') {
      const bh = Math.min(0.8, H * 0.4);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.018, 0.014, 0.14, iron, sx * (W / 2 - 0.05), 0.07, sz * (D / 2 - 0.05), 8);
      box(g, W, bh, D, iron, 0, 0.14 + bh / 2, 0, 0.02);
      box(g, W + 0.03, 0.025, D + 0.03, iron, 0, 0.14 + bh + 0.0125, 0, 0.008);
      box(g, W * 0.68, bh * 0.56, 0.01, M('#ff9a3c', 0.5, 0, { emissive: '#ff7a1a', emissiveIntensity: 1.1 }), 0, 0.14 + bh * 0.58, D / 2 + 0.001);
      box(g, W * 0.74, bh * 0.62, 0.012, M('#101418', 0.1, 0.2, { transparent: true, opacity: 0.45 }), 0, 0.14 + bh * 0.58, D / 2 + 0.008);
      box(g, 0.02, 0.1, 0.03, CHROME, W * 0.4, 0.14 + bh * 0.58, D / 2 + 0.02);
      cyl(g, 0.07, 0.07, H - bh - 0.14, iron, 0, 0.14 + bh + (H - bh - 0.14) / 2, -D * 0.18, 18);
      box(g, W + 0.5, 0.012, D + 0.45, M('#3a3d40', 0.3), 0, 0.006, 0.12);
    } else {
      const sur = M(it.color, 0.5), mh = H - 0.06, ow = W * 0.52, oh = mh * 0.62;
      box(g, W, mh, D * 0.5, sur, 0, mh / 2, -D / 4);
      for (const sx of [-1, 1]) box(g, (W - ow) / 2, mh, D * 0.75, sur, sx * (ow / 2 + (W - ow) / 4), mh / 2, -D * 0.125, 0.006);
      box(g, W, mh - oh, D * 0.75, sur, 0, oh + (mh - oh) / 2, -D * 0.125);
      box(g, W + 0.14, 0.06, D + 0.04, sur, 0, H - 0.03, 0, 0.01);
      box(g, ow, oh, 0.02, M('#1b1c1d', 0.9), 0, oh / 2, -D * 0.02);
      box(g, ow + 0.3, 0.03, D * 0.5, M('#3a3d40', 0.4), 0, 0.015, D * 0.25);
      for (let i = 0; i < 3; i++) cyl(g, 0.035, 0.035, ow * 0.7, M('#5b4a38', 0.9), 0, 0.06 + (i === 2 ? 0.06 : 0), D * 0.08 + (i === 2 ? 0.04 : i * 0.08), 8).rotation.z = Math.PI / 2 + (i - 1) * 0.1;
      for (let i = 0; i < 4; i++) cone(g, 0.05, 0.16 + (i % 2) * 0.08, FLAME, (i - 1.5) * ow * 0.16, 0.2 + (i % 2) * 0.03, D * 0.12, 8);
    }
    return g;
  },
  aquarium(it, W, D, H) {
    const g = G(), sh = Math.min(0.75, H * 0.52), th = H - sh - 0.05, rnd = seeded(it.id || 23);
    box(g, W, sh, D, M(it.color, 0.6), 0, sh / 2, 0, 0.006);
    box(g, 0.004, sh - 0.04, 0.003, M(shade(it.color, -0.25), 0.8), 0, sh / 2, D / 2);
    box(g, W - 0.01, th, D - 0.01, CLEAR, 0, sh + th / 2, 0);
    box(g, W - 0.03, th * 0.9, D - 0.03, M('#6fb3c9', 0.1, 0, { transparent: true, opacity: 0.4, depthWrite: false }), 0, sh + th * 0.45, 0);
    box(g, W - 0.03, 0.04, D - 0.03, M('#cdbfa6', 1), 0, sh + 0.02, 0);
    box(g, W, 0.05, D, M('#26282b', 0.5), 0, H - 0.025, 0);
    for (let i = 0; i < 6; i++) {
      const f = sph(g, 0.03, M(['#e8962e', '#e3b23c', '#5f7f96', '#c8362e'][i % 4], 0.5), (rnd() - 0.5) * (W - 0.2), sh + th * (0.25 + rnd() * 0.55), (rnd() - 0.5) * (D - 0.14), 1.7, 0.8, 0.5, 8);
      f.rotation.y = rnd() * 0.8 - 0.4;
    }
    for (let i = 0; i < 5; i++) blade(g, M('#4c8a55', 0.7, 0, DS), { len: th * (0.4 + rnd() * 0.4), wid: 0.04, pitch: 1.45, droop: 0.05, yaw: rnd() * 6, x: (rnd() - 0.5) * (W - 0.2), y: sh + 0.04, z: (rnd() - 0.5) * (D - 0.16), strap: true });
    return g;
  },

  // ---------- Mattor och gardiner ----------
  rug(it, W, D) {
    const g = G(), p = def(it).pattern;
    if (p) box(g, W, 0.014, D, rugMat(p, it.color), 0, 0.007, 0);
    else {
      box(g, W, 0.012, D, M(it.color, 1), 0, 0.006, 0);
      box(g, W - 0.18, 0.014, D - 0.18, M(shade(it.color, 0.05), 1), 0, 0.007, 0);
    }
    g.userData.flat = true;
    return g;
  },
  roundrug(it, W, D) {
    const g = G(), sc = G(), p = def(it).pattern;
    sc.scale.z = D / W;
    g.add(sc);
    if (p) {
      const side = M(it.color, 1), m = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, 0.014, 56), [side, rugMat(p, it.color), side]);
      m.position.y = 0.007;
      sc.add(m);
    } else {
      cyl(sc, W / 2, W / 2, 0.012, M(it.color, 1), 0, 0.006, 0, 56);
      cyl(sc, W / 2 - 0.09, W / 2 - 0.09, 0.014, M(shade(it.color, 0.05), 1), 0, 0.007, 0, 56);
    }
    g.userData.flat = true;
    return g;
  },
  fur(it, W, D) {
    const g = G(), s = new THREE.Shape(), n = 40;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU, rr = 1 + 0.07 * Math.sin(3 * a + 1) + 0.05 * Math.sin(5 * a) + 0.12 * Math.pow(Math.abs(Math.cos(a)), 6);
      const x = (Math.sin(a) * rr * W) / 2.3, y = (Math.cos(a) * rr * D) / 2.3;
      if (i) s.lineTo(x, y); else s.moveTo(x, y);
    }
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.012, bevelSegments: 2 }), M(it.color, 1));
    m.rotation.x = -Math.PI / 2;
    g.add(m);
    g.userData.flat = true;
    return g;
  },
  curtain(it, W, D, H) {
    const g = G(), k = def(it).kind;
    if (k === 'blind') {
      box(g, W, 0.06, 0.06, M('#ecebe6', 0.5), 0, H - 0.03, 0);
      box(g, W - 0.04, H * 0.55, 0.004, M(it.color, 1, 0, DS), 0, H - 0.06 - H * 0.275, 0);
      box(g, W - 0.04, 0.02, 0.014, M('#ecebe6', 0.5), 0, H - 0.06 - H * 0.55, 0);
      return g;
    }
    const fab = M(it.color, 1, 0, k === 'sheer' ? { side: THREE.DoubleSide, transparent: true, opacity: 0.5, depthWrite: false } : DS);
    rod(g, [-W / 2, H - 0.04, 0], [W / 2, H - 0.04, 0], 0.011, BLACKMETAL);
    for (const sx of [-1, 1]) sph(g, 0.02, BLACKMETAL, sx * W / 2, H - 0.04, 0);
    const panel = (x0, x1) => {
      const w = x1 - x0, geo = new THREE.PlaneGeometry(w, H - 0.07, Math.max(8, Math.round(w / 0.035)), 1), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) + x0) * 46) * Math.min(0.045, D * 0.35));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, fab);
      m.position.set((x0 + x1) / 2, (H - 0.07) / 2, 0);
      g.add(m);
    };
    if (k === 'pair') { panel(-W / 2, -W / 2 + W * 0.24); panel(W / 2 - W * 0.24, W / 2); } else panel(-W / 2, W / 2);
    return g;
  },
};
