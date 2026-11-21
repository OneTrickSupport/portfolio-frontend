import { app, discardDraft, emit, EMBED, init as initStore, isDirty, markSaved, openDesign, redo, select, setFocus, setTool, setView, undo } from './store.js';
import { sanitizePlan } from './sanitize.js';
import { thumbnail } from './thumb2d.js';
import * as V2 from './view2d.js';
import * as V3 from './view3d.js';
import * as UI from './ui.js';
import { duplicateSel, nudgeSel, removeSel, rotateSel } from './actions.js';

initStore();
V2.init(document.getElementById('plan2d'));
V3.init(document.getElementById('view3d'));
UI.init();

window.addEventListener('keydown', (e) => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
    if (e.key === 'Escape' || e.key === 'Enter') e.target.blur();
    return;
  }
  const mod = e.metaKey || e.ctrlKey, key = e.key.toLowerCase();
  if (mod && key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
  if (mod && key === 'y') { e.preventDefault(); redo(); return; }
  if (mod && key === 'd') { e.preventDefault(); duplicateSel(); return; }
  if (mod) return;
  if (e.key === 'Escape') {
    if (app.view === '2d' && V2.cancelDraw()) return;
    if (app.ui.walk) { V3.setWalk(false); return; }
    select(null);
    return;
  }
  if (app.ui.walk) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSel(); }
  else if (key === 'r') rotateSel(e.shiftKey ? 15 : 90);
  else if (e.key.startsWith('Arrow') && app.sel) {
    e.preventDefault();
    const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0, dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
    // pilarna roterar den markerade möbeln; Alt + pil flyttar den
    if (e.altKey) nudgeSel(dx * (e.shiftKey ? 10 : 1), dy * (e.shiftKey ? 10 : 1));
    else rotateSel((dx || -dy) * (e.shiftKey ? 1 : dx ? 15 : 90));
  }
});

// #3d öppnar 3D-vyn direkt, #walls öppnar väggläget
const hash = location.hash.slice(1);
if (hash.startsWith('3d')) {
  setView('3d');
  if (hash === '3d-walk') V3.setWalk(true);
  if (hash === '3d-top') V3.topView();
} else if (hash === 'walls') setTool('walls');
else emit('view');

// för felsökning i webbläsarens konsol
window.moblera = { app, setFocus };

// Gränssnittet mot sidan som bäddar in planeraren (samma webbplats, i en iframe).
if (EMBED) {
  document.documentElement.classList.add('embed');
  Object.assign(window.moblera, {
    /** Öppna en sparad design (state = null ger originalplanen). Ger { dirty } om ett osparat utkast användes. */
    open(key, state) { const r = openDesign(key, state); V2.fit(); return r; },
    /** Planen som den ser ut just nu, som en ren kopia. */
    getState: () => sanitizePlan(JSON.parse(JSON.stringify(app.state))),
    thumbnail: () => { try { return thumbnail(); } catch { return null; } },
    isDirty,
    markSaved,
    discardDraft() { discardDraft(); V2.fit(); },
  });
  window.parent.postMessage({ type: 'moblera-ready' }, location.origin);
}
