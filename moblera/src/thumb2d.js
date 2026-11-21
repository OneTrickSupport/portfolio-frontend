// Liten förhandsbild av planen (sedd uppifrån), som sparas tillsammans med en design.

import { app } from './store.js';
import * as D from './derive.js';
import { FLOORS } from './catalog.js';

const path = (ctx, poly) => { ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };

/** Bild som data-URL, högst ungefär `maxChars` tecken lång. */
export function thumbnail(W = 480, H = 360, maxChars = 80000) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d'), S = D.structure(), b = D.bounds(), pad = 26;
  const k = Math.min((W - 2 * pad) / Math.max(1, b.x1 - b.x0 + 60), (H - 2 * pad) / Math.max(1, b.y1 - b.y0 + 60));
  ctx.fillStyle = '#f1f3f2';
  ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2 - ((b.x0 + b.x1) / 2) * k, H / 2 - ((b.y0 + b.y1) / 2) * k);
  ctx.scale(k, k);
  for (const r of S.rooms) { path(ctx, r.poly); ctx.fillStyle = (FLOORS[r.floor] || FLOORS.fiskben).c2d; ctx.fill(); }
  const rank = (m) => (D.isRug(m) ? -1000 : m.elev || 0);
  ctx.lineWidth = 1 / k;
  for (const it of [...app.state.items].sort((p, q) => rank(p) - rank(q))) {
    if ((it.elev || 0) > 150) continue; // taklampor och annat högt upp skymmer bara
    ctx.fillStyle = it.color;
    ctx.strokeStyle = 'rgba(23,33,43,.55)';
    for (const poly of D.itemPolys(it)) { path(ctx, poly); ctx.globalAlpha = D.isRug(it) ? 0.6 : 1; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); }
  }
  ctx.fillStyle = '#17212b';
  for (const g of S.real) { path(ctx, g.poly); ctx.fill(); }
  ctx.fillStyle = '#ffffff';
  for (const g of S.real) for (const x of g.ops) { path(ctx, x.poly); ctx.fill(); }
  for (const q of [0.82, 0.6, 0.4]) {
    const url = c.toDataURL('image/webp', q);
    if (url.startsWith('data:image/webp') && url.length <= maxChars) return url;
  }
  const jpg = c.toDataURL('image/jpeg', 0.6);
  return jpg.length <= maxChars ? jpg : null;
}
