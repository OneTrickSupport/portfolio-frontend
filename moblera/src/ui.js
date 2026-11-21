// Paneler och knappar: katalog, rum, inköpslista, egenskaper och namnrutan.

import { app, canRedo, canUndo, commit, emit, find, on, redo, replaceState, rescale, resetPlan, select, setFocus, setTool, setView, undo } from './store.js';
import * as D from './derive.js';
import { CATALOG, CATS, FLOORS, ITEM_COLORS, WALL_COLORS, def, iconSvg, shapeOf, tvSize } from './catalog.js';
import { addItem, addOpening, duplicateSel, esc, fitToCeiling, fmt, removeSel, roomLabel, rotateSel } from './actions.js';
import * as V2 from './view2d.js';
import * as V3 from './view3d.js';
import { dist, pointInPoly } from './geom.js';
import { thumb } from './thumbs.js';

const $ = (id) => document.getElementById(id);
const TV_SIZES = [43, 50, 55, 65, 75, 77, 83, 85, 98];
let tab = 'catalog';

const typing = (root) => {
  const a = document.activeElement;
  return !!a && root.contains(a) && ((a.tagName === 'INPUT' && !['checkbox', 'color', 'file'].includes(a.type)) || a.tagName === 'TEXTAREA');
};
export function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}
function download(name, href) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
// nya möbler hamnar mitt i vyn, eller mitt i rummet som visas om vyn pekar utanför det
const viewCenter = () => {
  const c = app.view === '3d' ? V3.center() : V2.center(), F = D.focus();
  return F && !pointInPoly(c, F.room.poly) ? F.room.label : c;
};
const roomById = (v) => D.structure().rooms.find((r) => String(r.id) === String(v));

export function init() {
  $('viewSeg').addEventListener('click', (e) => { const v = e.target.dataset.view; if (v) setView(v); });
  $('roomSel').addEventListener('change', (e) => { const r = roomById(e.target.value); setFocus(r ? r.id : null); e.target.blur(); });
  $('toolSeg').addEventListener('click', (e) => { const t = e.target.dataset.tool; if (t) setTool(t); });
  $('optDims').addEventListener('change', (e) => { app.ui.dims = e.target.checked; emit('tool'); });
  $('optOverlay').addEventListener('change', (e) => { app.ui.overlay = e.target.checked; emit('tool'); });
  $('wallSeg').addEventListener('click', (e) => { const m = e.target.dataset.wm; if (m) { app.ui.wallMode = m; emit('view'); } });
  $('btnWalk').addEventListener('click', () => V3.setWalk(!app.ui.walk));
  $('btnTop').addEventListener('click', () => V3.topView());
  $('btnResetCam').addEventListener('click', () => V3.resetCamera());
  $('btnShot').addEventListener('click', () => { const url = V3.snapshot(); if (url) { download('lagenheten-3d.png', url); toast('Bilden är sparad i Hämtade filer'); } });
  $('btnUndo').addEventListener('click', undo);
  $('btnRedo').addEventListener('click', redo);
  $('zIn').addEventListener('click', () => V2.zoomBy(1.25));
  $('zOut').addEventListener('click', () => V2.zoomBy(0.8));
  $('zFit').addEventListener('click', () => V2.fit());

  // Arkiv
  const closeMenu = () => { $('fileMenu').open = false; $('resetConfirm').hidden = true; };
  $('btnExport').addEventListener('click', () => {
    download('lagenheten-plan.json', URL.createObjectURL(new Blob([JSON.stringify(app.state, null, 1)], { type: 'application/json' })));
    closeMenu();
    toast('Planen är sparad som fil');
  });
  $('btnImport').addEventListener('click', () => $('fileInput').click());
  $('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const s = JSON.parse(await file.text());
      replaceState(s);
      V2.fit();
      toast('Planen är öppnad');
    } catch {
      toast('Filen gick inte att läsa. Välj en fil som är sparad härifrån.');
    }
    closeMenu();
  });
  $('btnReset').addEventListener('click', () => { $('resetConfirm').hidden = false; });
  $('btnResetNo').addEventListener('click', closeMenu);
  $('btnResetYes').addEventListener('click', () => { resetPlan(); V2.fit(); closeMenu(); toast('Planen är återställd'); });
  document.addEventListener('pointerdown', (e) => { if (!$('fileMenu').contains(e.target)) closeMenu(); });

  // flikar och smala skärmar
  document.querySelector('.tabs').addEventListener('click', (e) => { const t = e.target.dataset.tab; if (t) { tab = t; renderTab(); } });
  $('toggleLeft').addEventListener('click', () => $('left').classList.toggle('open'));
  $('toggleRight').addEventListener('click', () => $('props').classList.toggle('open'));
  $('stage').addEventListener('pointerdown', () => { $('left').classList.remove('open'); });

  buildCatalog();
  $('titleblock').addEventListener('click', (e) => {
    const id = e.target.closest('[data-item]')?.dataset.item;
    if (id) { if (app.tool !== 'select') setTool('select'); select({ kind: 'item', id: +id }); }
  });

  on((kind) => {
    if (kind === 'zoom' || kind === 'live') { renderTitle(); return; }
    syncTop();
    if (kind !== 'commit' || !typing($('props'))) renderProps();
    if (!typing($('left'))) renderTab();
    renderTitle();
  });
  syncTop();
  renderProps();
  renderTab();
  renderTitle();
}

function syncTop() {
  const is3d = app.view === '3d';
  // rummet som visades finns inte kvar (t.ex. efter att en vägg tagits bort): visa alla
  if (app.ui.focus != null && !D.focus()) app.ui.focus = null;
  const rs = $('roomSel'), rooms = D.structure().rooms;
  const opts = '<option value="">Alla rum</option>' + rooms.map((r) => `<option value="${esc(r.id)}">Bara ${esc(r.name)}</option>`).join('');
  if (rs.dataset.opts !== opts) { rs.dataset.opts = opts; rs.innerHTML = opts; }
  rs.value = app.ui.focus == null ? '' : String(app.ui.focus);
  rs.classList.toggle('on', app.ui.focus != null);
  document.querySelectorAll('#viewSeg button').forEach((b) => b.classList.toggle('on', b.dataset.view === app.view));
  document.querySelectorAll('#toolSeg button').forEach((b) => b.classList.toggle('on', b.dataset.tool === app.tool));
  document.querySelectorAll('#wallSeg button').forEach((b) => b.classList.toggle('on', b.dataset.wm === app.ui.wallMode));
  $('tools2d').hidden = is3d;
  $('tools3d').hidden = !is3d;
  $('plan2d').style.display = is3d ? 'none' : '';
  $('view3d').hidden = !is3d;
  $('zoom2d').hidden = is3d;
  $('optDims').checked = app.ui.dims;
  $('optOverlay').checked = app.ui.overlay;
  $('btnUndo').disabled = !canUndo();
  $('btnRedo').disabled = !canRedo();
  $('btnWalk').classList.toggle('on', app.ui.walk);
  $('btnWalk').textContent = app.ui.walk ? 'Sluta gå' : 'Gå runt';
  V3.setActive(is3d);
  const hint = $('hint');
  let text = '';
  if (is3d && app.ui.walk) text = 'Gå med <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> eller piltangenterna. Dra med musen för att se dig om. <kbd>Esc</kbd> avslutar.';
  else if (!is3d && app.tool === 'draw') text = 'Klicka där väggen ska börja och klicka igen där den ska sluta. <kbd>Esc</kbd> avbryter.';
  hint.hidden = !text;
  hint.innerHTML = text;
}

// ---------- Katalogen ----------
const openCats = new Set([CATS[0].id]);
let thumbTimer = 0;
/** Byt planritningssymbolerna i de synliga rutorna mot 3D-bilder, några i taget så att sidan inte hackar. */
function fillThumbs() {
  clearTimeout(thumbTimer);
  const step = () => {
    const todo = [...document.querySelectorAll('#catList [data-thumb]:not(.done)')].slice(0, 5);
    for (const el of todo) {
      el.classList.add('done');
      const url = thumb(el.dataset.thumb);
      if (url) el.innerHTML = `<img src="${url}" alt="" draggable="false">`;
    }
    if (todo.length) thumbTimer = setTimeout(step, 0);
  };
  thumbTimer = setTimeout(step, 30);
}
function buildCatalog() {
  const root = $('tab-catalog');
  root.innerHTML = '<input class="search" id="catSearch" type="search" placeholder="Sök soffa, lampa, växt …" aria-label="Sök i katalogen"><div id="catList"></div>';
  const list = $('catList'), types = Object.keys(CATALOG);
  const size = (d) => (d.inch ? d.inch + '″' : d.wall && d.d <= 6 ? `${d.w}×${d.h}` : `${d.w}×${d.d}`);
  const tile = (t) => {
    const d = CATALOG[t];
    return `<div class="tile" role="button" tabindex="0" draggable="true" data-type="${t}" title="${esc(d.name)}: klicka eller dra in i planen"><span class="ti" data-thumb="${t}">${iconSvg(t)}</span><span class="tn">${esc(d.name)}</span><span class="td">${size(d)}</span></div>`;
  };
  const tiles = (ts) => `<div class="tiles">${ts.map(tile).join('')}</div>`;
  const draw = (q = '') => {
    if (q) {
      const hit = types.filter((t) => CATALOG[t].name.toLowerCase().includes(q) || CATS.find((c) => c.id === CATALOG[t].cat).name.toLowerCase().includes(q));
      list.innerHTML = hit.length ? `<p class="found">${hit.length} träffar</p>${tiles(hit)}` : '<p class="empty">Ingen möbel heter så. Prova ”Egen möbel” under Övrigt och skriv in måtten själv.</p>';
    } else {
      list.innerHTML = CATS.map((c) => {
        const ts = types.filter((t) => CATALOG[t].cat === c.id), open = openCats.has(c.id);
        return `<details class="catsec" data-cat="${c.id}"${open ? ' open' : ''}><summary><span>${c.name}</span><span class="n">${ts.length}</span></summary>${open ? tiles(ts) : ''}</details>`;
      }).join('');
    }
    fillThumbs();
  };
  draw();
  $('catSearch').addEventListener('input', (e) => draw(e.target.value.trim().toLowerCase()));
  list.addEventListener('toggle', (e) => {
    const sec = e.target.closest?.('.catsec');
    if (!sec) return;
    if (sec.open) {
      openCats.add(sec.dataset.cat);
      if (!sec.querySelector('.tiles')) sec.insertAdjacentHTML('beforeend', tiles(types.filter((t) => CATALOG[t].cat === sec.dataset.cat)));
      fillThumbs();
    } else openCats.delete(sec.dataset.cat);
  }, true);
  const place = (e) => {
    const t = e.target.closest('.tile')?.dataset.type;
    if (!t) return;
    const c = viewCenter(), d = CATALOG[t];
    const chained = d.module && app.sel?.kind === 'item' && def(find(app.sel) || {}).module;
    addItem(t, c[0], c[1], true);
    if (chained) { toast(`${d.name} sitter ihop med modulen du hade markerad.`); return; }
    toast(`${d.name} ligger mitt i vyn. ${d.module ? 'Klicka på nästa modul, så hamnar den intill.' : d.top ? 'Dra den till ett bord eller en hylla, så ställer den sig där.' : d.wall ? 'Dra den mot en vägg, så fäster den där.' : d.ceil ? 'Den hänger i taket.' : 'Dra den på plats.'}`);
  };
  list.addEventListener('click', place);
  list.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('tile')) { e.preventDefault(); place(e); } });
  list.addEventListener('dragstart', (e) => {
    const t = e.target.closest('.tile')?.dataset.type;
    if (t) { e.dataTransfer.setData('text/plain', t); e.dataTransfer.effectAllowed = 'copy'; }
  });
}

function renderTab() {
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  for (const t of ['catalog', 'rooms', 'shop']) $('tab-' + t).hidden = t !== tab;
  if (tab === 'rooms') renderRooms();
  if (tab === 'shop') renderShop();
}

function swatches(colors, current, attr) {
  return `<div class="swatches">${colors.map((c) => `<button class="sw${c.toLowerCase() === String(current).toLowerCase() ? ' on' : ''}" style="background:${c}" ${attr}="${c}" aria-label="Färg ${c}"></button>`).join('')}<input type="color" ${attr}-free value="${/^#[0-9a-f]{6}$/i.test(current) ? current : '#cccccc'}" aria-label="Egen färg"></div>`;
}

function renderRooms() {
  const st = app.state, root = $('tab-rooms'), rooms = D.structure().rooms;
  let h = `<div class="field">Väggfärg</div>${swatches(WALL_COLORS, st.wallColor, 'data-wall')}`;
  h += `<div class="fields" style="margin-top:12px"><label class="field">Takhöjd, cm<input type="number" id="wallH" min="200" max="450" value="${st.wallHeight}"></label></div>`;
  h += rooms.length ? '' : '<p class="empty">Inga slutna rum ännu. Rita väggar som möts i hörnen så dyker rummen upp här.</p>';
  for (const r of rooms) {
    h += `<div class="roomrow" data-room="${r.id}"><div class="top"><input value="${esc(r.name)}" aria-label="Rummets namn"><span class="area">${fmt(r.area, 1)} m²</span></div>
      <button class="btn solo${app.ui.focus === r.id ? ' on' : ''}">${app.ui.focus === r.id ? 'Visa alla rum' : 'Visa bara det här'}</button>
      <label class="field">Golv<select>${Object.entries(FLOORS).map(([k, f]) => `<option value="${k}"${k === r.floor ? ' selected' : ''}>${f.name}</option>`).join('')}</select></label></div>`;
  }
  root.innerHTML = h;
  root.querySelectorAll('[data-wall]').forEach((b) => b.addEventListener('click', () => { st.wallColor = b.dataset.wall; commit(); }));
  root.querySelector('[data-wall-free]').addEventListener('input', (e) => { st.wallColor = e.target.value; emit('live'); });
  root.querySelector('[data-wall-free]').addEventListener('change', () => commit());
  $('wallH').addEventListener('change', (e) => { const v = +e.target.value; if (v >= 200 && v <= 450) { st.wallHeight = v; st.items.forEach(fitToCeiling); commit(); } });
  root.querySelectorAll('.roomrow').forEach((row) => {
    const room = rooms.find((r) => String(r.id) === row.dataset.room);
    row.querySelector('input').addEventListener('change', (e) => { roomLabel(room).name = e.target.value || 'Rum'; commit(); });
    row.querySelector('select').addEventListener('change', (e) => { roomLabel(room).floor = e.target.value; commit(); });
    row.querySelector('.solo').addEventListener('click', () => setFocus(app.ui.focus === room.id ? null : room.id));
  });
}

function renderShop() {
  const root = $('tab-shop'), items = app.state.items.filter((i) => !i.locked);
  if (!items.length) { root.innerHTML = '<p class="empty">Inga möbler ännu. Lägg in några från fliken Möbler, så samlas de här med mått och pris.</p>'; return; }
  let sum = 0, h = '';
  for (const it of items) {
    sum += +it.price || 0;
    const name = it.link ? `<a href="${esc(it.link)}" target="_blank" rel="noopener">${esc(it.name)}</a>` : esc(it.name);
    h += `<div class="shoprow"><span class="nm">${name}</span><input type="number" data-id="${it.id}" value="${it.price || ''}" placeholder="kr" aria-label="Pris för ${esc(it.name)}"><span class="dm">${fmt(it.w)} × ${fmt(it.d)} × ${fmt(it.h)} cm</span></div>`;
  }
  h += `<div class="total"><span>Summa</span><span>${fmt(sum)} kr</span></div><p class="empty">Fast inredning som kök och badrum räknas inte med.</p>`;
  root.innerHTML = h;
  root.querySelectorAll('input[data-id]').forEach((inp) => inp.addEventListener('change', () => {
    const it = find({ kind: 'item', id: +inp.dataset.id });
    if (it) { it.price = inp.value; commit(); }
  }));
}

// ---------- Egenskaper ----------
function bind(root, obj, after) {
  root.querySelectorAll('[data-f]').forEach((inp) => {
    const f = inp.dataset.f;
    const read = () => {
      if (inp.type === 'checkbox') return inp.checked;
      if (inp.type === 'number') { const v = parseFloat(inp.value); return isFinite(v) ? Math.max(v, parseFloat(inp.min || '-1e9')) : null; }
      return inp.value;
    };
    const apply = () => { const v = read(); if (v === null) return false; obj[f] = v; after?.(f); return true; };
    if (inp.tagName === 'SELECT' || inp.type === 'checkbox') inp.addEventListener('change', () => { if (apply()) commit(); });
    else {
      inp.addEventListener('input', () => { if (apply()) emit('live'); });
      inp.addEventListener('change', () => commit());
    }
  });
}
const field = (label, f, v, o = {}) => `<label class="field${o.full ? ' full' : ''}">${label}<input ${o.text ? '' : 'type="number"'} data-f="${f}" value="${esc(v ?? '')}"${o.min != null ? ` min="${o.min}"` : ''}${o.step ? ` step="${o.step}"` : ''}${o.ph ? ` placeholder="${o.ph}"` : ''}></label>`;

function renderProps() {
  const el = $('props'), sel = app.sel;
  if (app.tool === 'measure' && app.view === '2d') return propsMeasure(el);
  const o = find(sel);
  if (sel?.kind === 'item' && o) return propsItem(el, o);
  if (sel?.kind === 'wall' && o) return propsWall(el, o);
  if (sel?.kind === 'opening' && o) return propsOpening(el, o);
  if (sel?.kind === 'room') {
    const r = D.structure().rooms.find((x) => x.id === sel.id);
    if (r) return propsRoom(el, r);
  }
  propsNone(el);
}

function propsItem(el, it) {
  const sh = shapeOf(it), bad = D.collisions().get(it.id);
  let h = `<div><h2>${esc(it.name)}</h2>${it.locked ? '<p class="sub">Fast inredning, låst på plats</p>' : ''}</div>`;
  if (bad) h += `<p class="note bad">Krockar med ${esc(bad)}.</p>`;
  h += '<div class="fields">' + field('Namn', 'name', it.name, { text: true, full: true });
  if (sh === 'tv') h += `<label class="field full">Skärmstorlek<select id="tvInch">${TV_SIZES.map((s) => `<option${s === it.inch ? ' selected' : ''}>${s}</option>`).join('')}</select></label>`;
  h += field('Bredd, cm', 'w', it.w, { min: 5 }) + field('Djup, cm', 'd', it.d, { min: 2 }) + field('Höjd, cm', 'h', it.h, { min: 1 }) + field('Vinkel, grader', 'rot', it.rot, { step: 15 });
  if (it.elev != null) h += field('Underkant över golvet, cm', 'elev', it.elev, { min: 0, full: true });
  if (!it.locked) h += field('Pris, kr', 'price', it.price, { min: 0 }) + field('Länk', 'link', it.link, { text: true, ph: 'https://' });
  h += '</div>';
  if (sh === 'corner') h += `<label class="check"><input type="checkbox" data-f="mirror"${it.mirror ? ' checked' : ''}> Schäslongen till höger</label>`;
  h += `<div><div class="field" style="margin-bottom:6px">Färg</div>${swatches(ITEM_COLORS, it.color, 'data-col')}</div>`;
  h += `<div class="rowbtns">${it.locked ? '' : '<button class="btn" id="pRot">Rotera 90°</button>'}<button class="btn" id="pDup">Duplicera</button><button class="btn" id="pLock">${it.locked ? 'Lås upp' : 'Lås'}</button>${it.locked ? '' : '<button class="btn danger" id="pDel">Ta bort</button>'}</div>`;
  if (sh === 'tv') {
    const t = D.tvCheck(it);
    if (t) {
      const near = (v) => TV_SIZES.reduce((p, c) => (Math.abs(c - v) < Math.abs(p - v) ? c : p));
      h += `<p class="note">Det är <b>${fmt(t.dist)} cm</b> till soffan. Lagom skärm är omkring <b>${near(t.everyday)}″</b>. Vill du ha biokänsla går det upp till <b>${near(t.cinema)}″</b>.</p>`;
    }
  }
  const dd = def(it);
  if (dd.module) {
    h += '<div class="rowbtns"><button class="btn" id="pSofaRot">Rotera hela soffan 90°</button></div>';
    h += '<p class="help">Dra modulen intill en annan, så fäster de kant i kant. Håll <kbd>Skift</kbd> och dra för att flytta hela soffan. Färgen ändras på alla delar som sitter ihop.</p>';
  }
  if (dd.top) h += '<p class="help">Står på möbeln under den. Dra den till ett bord, en byrå eller en hylla, så hamnar den på rätt höjd.</p>';
  else if (dd.ceil) h += '<p class="help">Hänger i taket. Höjden styr hur långt ner den hänger.</p>';
  else if (dd.wall) h += '<p class="help">Fäster mot närmaste vägg när du drar den dit. Håll <kbd>Alt</kbd> för att ställa den fritt.</p>';
  if (['sofa', 'corner'].includes(sh)) h += `<p class="help">Kommer den in? Dörrarna här är ungefär ${fmt(doorWidth())} cm breda. Soffans djup eller höjd behöver vara mindre än det, annars måste den gå att ta isär.</p>`;
  el.innerHTML = h;
  bind(el, it);
  el.querySelector('#tvInch')?.addEventListener('change', (e) => {
    it.inch = +e.target.value;
    Object.assign(it, tvSize(it.inch));
    it.name = `TV ${it.inch}″`;
    commit();
  });
  const paint = (c) => { for (const o of [it, ...D.sofaGroup(it)]) o.color = c; };
  el.querySelectorAll('[data-col]').forEach((b) => b.addEventListener('click', () => { paint(b.dataset.col); commit(); }));
  el.querySelector('[data-col-free]').addEventListener('input', (e) => { paint(e.target.value); emit('live'); });
  el.querySelector('#pSofaRot')?.addEventListener('click', () => { D.rotateItem(it, it.rot + 90, D.sofaGroup(it)); commit(); });
  el.querySelector('[data-col-free]').addEventListener('change', () => commit());
  el.querySelector('#pRot')?.addEventListener('click', () => rotateSel(90));
  el.querySelector('#pDup').addEventListener('click', duplicateSel);
  el.querySelector('#pLock').addEventListener('click', () => { it.locked = !it.locked; commit(); });
  el.querySelector('#pDel')?.addEventListener('click', removeSel);
}
function doorWidth() {
  const ws = app.state.openings.filter((o) => o.type !== 'window').map((o) => o.w);
  return ws.length ? Math.min(...ws) : 80;
}

function propsWall(el, w) {
  const g = D.structure().geoms.get(w.id), virtual = w.kind === 'virtual';
  let h = `<div><h2>${virtual ? 'Rumsavdelare' : 'Vägg'}</h2><p class="sub">${fmt(g.len)} cm lång</p></div><div class="fields">`;
  h += `<label class="field${virtual ? ' full' : ''}">Typ<select data-f="kind"><option value="outer"${w.kind === 'outer' ? ' selected' : ''}>Yttervägg</option><option value="inner"${w.kind === 'inner' ? ' selected' : ''}>Innervägg</option><option value="virtual"${virtual ? ' selected' : ''}>Rumsavdelare (osynlig)</option></select></label>`;
  if (!virtual) h += field('Tjocklek, cm', 't', Math.round(w.t * 10) / 10, { min: 2 });
  h += '</div>';
  if (!virtual) h += '<div class="rowbtns"><button class="btn" data-add="door">Sätt in dörr</button><button class="btn" data-add="window">Sätt in fönster</button><button class="btn" data-add="opening">Sätt in öppning</button></div>';
  h += '<div class="rowbtns"><button class="btn danger" id="pDel">Ta bort väggen</button></div>';
  h += '<p class="help">Dra väggen för att flytta den. Dra i de runda handtagen för att flytta ett hörn. Piltangenterna flyttar 1 cm i taget, 10 cm med <kbd>Skift</kbd>.</p>';
  if (virtual) h += '<p class="help">En rumsavdelare syns inte i 3D. Den delar bara upp golvytan i två rum där det är öppet mellan dem.</p>';
  el.innerHTML = h;
  bind(el, w, (f) => { if (f === 'kind' && w.kind !== 'virtual' && !(w.t > 0)) w.t = 12; });
  el.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => addOpening(w.id, b.dataset.add)));
  el.querySelector('#pDel').addEventListener('click', removeSel);
}

function propsOpening(el, o) {
  const names = { door: 'Dörr', window: 'Fönster', opening: 'Öppning' };
  let h = `<div><h2>${names[o.type]}</h2></div><div class="fields">`;
  h += `<label class="field full">Typ<select data-f="type">${Object.entries(names).map(([k, n]) => `<option value="${k}"${k === o.type ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`;
  h += field('Bredd, cm', 'w', Math.round(o.w), { min: 30 });
  h += field('Överkant, cm', 'top', o.top, { min: 100 });
  if (o.type === 'window') h += field('Bröstning, cm', 'sill', o.sill, { min: 0, full: true });
  h += '</div>';
  if (o.type === 'door') h += '<div class="rowbtns"><button class="btn" id="pSide">Öppna åt andra hållet</button><button class="btn" id="pHinge">Byt gångjärnssida</button></div>';
  h += '<div class="rowbtns"><button class="btn danger" id="pDel">Ta bort</button></div><p class="help">Dra den längs väggen för att flytta den.</p>';
  el.innerHTML = h;
  bind(el, o, (f) => {
    if (f !== 'type') return;
    if (o.type === 'window') { o.sill = o.sill || 85; o.top = Math.max(o.top, o.sill + 100); } else { o.sill = 0; o.top = Math.min(o.top, 210); }
    if (o.type === 'door') { o.hinge ??= 0; o.side ??= 1; }
  });
  el.querySelector('#pSide')?.addEventListener('click', () => { o.side = o.side === -1 ? 1 : -1; commit(); });
  el.querySelector('#pHinge')?.addEventListener('click', () => { o.hinge = o.hinge ? 0 : 1; commit(); });
  el.querySelector('#pDel').addEventListener('click', removeSel);
}

function propsRoom(el, r) {
  let h = `<div><h2>${esc(r.name)}</h2><p class="sub">${fmt(r.area, 1)} m² golvyta</p></div>`;
  h += `<div class="fields"><label class="field full">Namn<input id="rName" value="${esc(r.name)}"></label></div>`;
  h += `<div><div class="field" style="margin-bottom:6px">Golv</div><div class="floors">${Object.entries(FLOORS).map(([k, f]) => `<button class="floorbtn${k === r.floor ? ' on' : ''}" data-floor="${k}"><i style="background:${f.c2d}"></i>${f.name}</button>`).join('')}</div></div>`;
  const solo = app.ui.focus === r.id;
  h += `<div class="rowbtns"><button class="btn${solo ? ' on' : ''}" id="pSolo">${solo ? 'Visa alla rum' : 'Visa bara det här rummet'}</button></div>`;
  h += '<p class="help">Golvet syns bäst i 3D. Väggfärg och takhöjd ändrar du under fliken Rum.</p>';
  el.innerHTML = h;
  el.querySelector('#pSolo').addEventListener('click', () => setFocus(solo ? null : r.id));
  el.querySelector('#rName').addEventListener('change', (e) => { roomLabel(r).name = e.target.value || 'Rum'; commit(); });
  el.querySelectorAll('[data-floor]').forEach((b) => b.addEventListener('click', () => { roomLabel(r).floor = b.dataset.floor; commit(); emit('sel'); }));
}

function propsMeasure(el) {
  const [a, b] = app.measure;
  let h = '<div><h2>Mät</h2></div><p class="help">Klicka på två punkter i planen. Punkterna fäster mot väggarna.</p>';
  if (a && b) {
    const d = dist(a, b);
    h += `<p class="note">Uppmätt <b>${fmt(d)} cm</b></p>`;
    h += '<div class="fields"><label class="field full">Har du mätt samma sträcka på plats? Skriv det riktiga måttet, cm<input type="number" id="realCm" min="1"></label></div>';
    h += '<div class="rowbtns"><button class="btn" id="pCal">Skala om hela planen</button></div>';
    h += '<p class="help">Då räknas alla väggar och avstånd om efter ditt mått. Möblernas egna mått ändras inte.</p>';
  }
  el.innerHTML = h;
  el.querySelector('#pCal')?.addEventListener('click', () => {
    const v = +el.querySelector('#realCm').value, d = dist(a, b);
    if (!(v > 0) || d < 1) { toast('Skriv det riktiga måttet i centimeter'); return; }
    rescale(v / d);
    commit();
    V2.fit();
    toast(`Planen är omskalad: ${fmt(d)} cm blev ${fmt(v)} cm`);
  });
}

function propsNone(el) {
  const F = D.focus();
  const bad = [...D.collisions()].filter(([id]) => { const it = find({ kind: 'item', id }); return it && !it.locked && D.inFocus(it); });
  let h = `<div><h2>${F ? esc(F.room.name) : 'Lägenheten'}</h2>${F ? `<p class="sub">${fmt(F.room.area, 1)} m² golvyta. De andra rummen är dolda.</p>` : ''}</div>`;
  if (F) h += '<div class="rowbtns"><button class="btn" id="pAll">Visa alla rum</button></div>';
  if (app.view === '3d') {
    h += '<p class="help">Dra för att snurra, högerdra för att flytta vyn, rulla för att zooma. Dubbelklicka på golvet för att titta dit.</p><p class="help">Klicka på en möbel för att välja den och dra den över golvet. <kbd>R</kbd> roterar.</p>';
  } else if (app.tool === 'walls' || app.tool === 'draw') {
    h += '<p class="help">Klicka på en vägg, dörr eller ett fönster för att ändra det. Dra väggar och hörn för att flytta dem.</p><p class="help">Rummens ytor och mått räknas om medan du drar.</p>';
  } else {
    h += '<p class="help">Klicka på en möbel i katalogen eller dra in den i planen. Dra för att flytta. <kbd>R</kbd> roterar, <kbd>Delete</kbd> tar bort.</p><p class="help">Möbler fäster mot väggar när de kommer nära. Håll <kbd>Alt</kbd> för att slippa det. De gula måtten visar fritt utrymme runt den möbel du har valt.</p><p class="help">Klicka på ett golv för att byta namn eller golvmaterial.</p>';
  }
  if (!F) h += `<p class="help">Vill du arbeta med ett rum i taget? Välj rum under <b>Visa</b> högst upp${app.view === '2d' ? ', eller dubbelklicka på rummets golv' : ''}. Då döljs de andra rummen.</p>`;
  if (bad.length) {
    h += '<div class="problems">' + bad.map(([id, why]) => `<button data-item="${id}">${esc(find({ kind: 'item', id }).name)} krockar med ${esc(why)}</button>`).join('') + '</div>';
  }
  el.innerHTML = h;
  el.querySelector('#pAll')?.addEventListener('click', () => setFocus(null));
  el.querySelectorAll('[data-item]').forEach((b) => b.addEventListener('click', () => { if (app.tool !== 'select') setTool('select'); select({ kind: 'item', id: +b.dataset.item }); }));
}

// ---------- Namnrutan ----------
function renderTitle() {
  const st = app.state, S = D.structure();
  const area = S.rooms.reduce((a, r) => a + r.area, 0);
  const F = D.focus();
  const loose = st.items.filter((i) => !i.locked && D.inFocus(i));
  const sum = loose.reduce((a, i) => a + (+i.price || 0), 0);
  const bad = [...D.collisions().keys()].filter((id) => { const it = find({ kind: 'item', id }); return it && !it.locked && D.inFocus(it); });
  const cell = (k, v) => `<div class="cell"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  let h = (F ? cell('Visar bara', esc(F.room.name)) + cell('Golvyta i rummet', `${fmt(F.room.area, 1)} m²`) : cell('Boarea i annonsen', `${fmt(st.boa || 0)} m²`) + cell('Golvyta i planen', `${fmt(area, 1)} m²`)) + cell('Skala', app.view === '2d' ? `1:${Math.max(1, Math.round(37.8 / V2.getZoom()))}` : '3D');
  h += cell('Möbler', `${loose.length} st`) + cell('Inköp', `${fmt(sum)} kr`) + cell('Takhöjd', `${fmt(st.wallHeight)} cm`);
  if (bad.length) h += `<button class="warn" data-item="${bad[0]}">${bad.length === 1 ? 'En möbel krockar' : `${bad.length} möbler krockar`}. Visa</button>`;
  $('titleblock').innerHTML = h;
}
