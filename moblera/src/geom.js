// Ren 2D-geometri. Alla mått i cm, y pekar nedåt (som på en planritning).

export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function rotPt(x, y, d) {
  const r = rad(d), c = Math.cos(r), s = Math.sin(r);
  return [x * c - y * s, x * s + y * c];
}

/** Rektangel w×d, centrerad i (ox,oy) lokalt, roterad `d` grader runt (cx,cy). */
export function rectPoly(cx, cy, w, h, d = 0, ox = 0, oy = 0) {
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => {
    const p = rotPt(x + ox, y + oy, d);
    return [cx + p[0], cy + p[1]];
  });
}

/** Konvexa polygoner: överlappar de med mer än `eps` cm? (separating axis) */
export function polysOverlap(A, B, eps = 0.5) {
  for (const P of [A, B]) {
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length];
      let nx = q[1] - p[1], ny = p[0] - q[0];
      const l = Math.hypot(nx, ny);
      if (l < 1e-9) continue;
      nx /= l; ny /= l;
      let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
      for (const v of A) { const k = v[0] * nx + v[1] * ny; if (k < a0) a0 = k; if (k > a1) a1 = k; }
      for (const v of B) { const k = v[0] * nx + v[1] * ny; if (k < b0) b0 = k; if (k > b1) b1 = k; }
      if (Math.min(a1, b1) - Math.max(a0, b0) <= eps) return false;
    }
  }
  return true;
}

/** Stråle o + t·d (d enhetsvektor) mot sträckan a–b. Ger t ≥ 0 eller null. */
export function raySeg(o, d, a, b) {
  const ex = b[0] - a[0], ey = b[1] - a[1];
  const den = d[0] * ey - d[1] * ex;
  if (Math.abs(den) < 1e-9) return null;
  const ax = a[0] - o[0], ay = a[1] - o[1];
  const t = (ax * ey - ay * ex) / den;
  const s = (ax * d[1] - ay * d[0]) / den;
  return t >= 0 && s >= 0 && s <= 1 ? t : null;
}

/** Närmaste punkt på sträckan a–b från p. */
export function segParam(p, a, b) {
  const ex = b[0] - a[0], ey = b[1] - a[1];
  const l2 = ex * ex + ey * ey;
  const raw = l2 < 1e-9 ? 0 : ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / l2;
  const t = clamp(raw, 0, 1);
  const q = [a[0] + ex * t, a[1] + ey * t];
  return { t, raw, q, d: dist(p, q) };
}

/** Skärning mellan sträckorna a–b och c–d: {t,u,p} eller null. */
export function segInter(a, b, c, d) {
  const rx = b[0] - a[0], ry = b[1] - a[1], sx = d[0] - c[0], sy = d[1] - c[1];
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c[0] - a[0]) * sy - (c[1] - a[1]) * sx) / den;
  const u = ((c[0] - a[0]) * ry - (c[1] - a[1]) * rx) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { t, u, p: [a[0] + rx * t, a[1] + ry * t] };
}

export function pointInPoly(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

export function polyArea(poly) {
  let A = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    A += a[0] * b[1] - b[0] * a[1];
  }
  return A / 2;
}

export function distToPoly(p, poly) {
  let m = Infinity;
  for (let i = 0; i < poly.length; i++) m = Math.min(m, segParam(p, poly[i], poly[(i + 1) % poly.length]).d);
  return m;
}

/** Punkt inne i polygonen som ligger långt från kanterna (för rumsetiketter). */
export function labelPoint(poly) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  let best = null;
  const scan = (ax, ay, bx, by, n) => {
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      const p = [ax + ((bx - ax) * i) / n, ay + ((by - ay) * j) / n];
      if (!pointInPoly(p, poly)) continue;
      const d = distToPoly(p, poly);
      if (!best || d > best.d) best = { p, d };
    }
  };
  scan(x0, y0, x1, y1, 26);
  if (best) {
    const sx = (x1 - x0) / 26, sy = (y1 - y0) / 26;
    scan(best.p[0] - sx, best.p[1] - sy, best.p[0] + sx, best.p[1] + sy, 8);
  }
  return best ? best.p : [(x0 + x1) / 2, (y0 + y1) / 2];
}

export const pts = (poly) => poly.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
