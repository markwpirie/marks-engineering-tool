// ══════════════════════════════════════════════════════════
// APP SHELL — deep links, Ctrl+K command palette, field mode,
// backup reminder, offline service worker registration.
// Loaded after every tab script (it indexes their data) and before app.js.
// ══════════════════════════════════════════════════════════

// ── Deep links ─────────────────────────────────────────────
// URL form: #<tab>?key=value&… — e.g. #cable?r=BFOU&app=Power&cores=3&csa=16&entry=npt
// Each tab that can be shared registers a get() (current state → params) and a set() (params →
// UI). Tabs without an entry still deep-link to the tab itself. Only replaceState is used, so
// changing a dropdown never floods the back-button history.
const DEEP_LINK_STATE = {
  cable: {
    get: () => ({
      r: document.getElementById('c_rating')?.value,
      app: document.getElementById('c_app')?.value,
      cores: document.getElementById('c_cores')?.value,
      csa: document.getElementById('c_csa')?.value,
      entry: typeof currentGlandTab !== 'undefined' && currentGlandTab === 'npt' ? 'npt' : null,
    }),
    set: p => {
      const setSel = (id, v) => { const el = document.getElementById(id); if (el && v != null && [...el.options].some(o => o.value === v)) el.value = v; };
      setSel('c_rating', p.r); updateCableApp();
      setSel('c_app', p.app); updateCableCores();
      setSel('c_cores', p.cores); updateCableCSA();
      setSel('c_csa', p.csa); showCableResult();
      if (p.entry === 'npt' || p.entry === 'metric') switchGlandTab(p.entry);
    },
  },
  calcs: {
    get: () => ({ calc: typeof activeCalc !== 'undefined' ? activeCalc : null }),
    set: p => {
      if (!p.calc || !CALC_META[p.calc]) return;
      const cat = Object.keys(CALC_REGISTRY).find(k => CALC_REGISTRY[k].calcs.includes(p.calc));
      if (cat && cat !== activeCategory) selectCalcCat(cat);
      selectCalc(p.calc);
    },
  },
  atex: {
    get: () => ({ m: document.getElementById('atexInput')?.value || null }),
    set: p => { if (p.m) { document.getElementById('atexInput').value = p.m; decodeATEX(); } },
  },
  npt: {
    get: () => ({ size: document.getElementById('nptSelect')?.value }),
    set: p => { const el = document.getElementById('nptSelect'); if (p.size && el && NPT_DATA[p.size]) { el.value = p.size; showNPTInfo(); } },
  },
};

function currentTabName() {
  const t = document.querySelector('.tab-content.active');
  return t ? t.id.replace(/^tab-/, '') : 'symbols';
}

function buildDeepLinkHash(tab) {
  const st = DEEP_LINK_STATE[tab];
  const params = st ? st.get() : {};
  const qs = Object.entries(params).filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  return '#' + tab + (qs ? '?' + qs : '');
}

// Called by switchTab() and by stateful tabs whenever their shareable state changes.
let _deepLinkReady = false;
function updateDeepLink() {
  if (!_deepLinkReady) return; // don't clobber an incoming link before it has been applied
  const hash = buildDeepLinkHash(currentTabName());
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

function parseDeepLink(hash) {
  const m = (hash || '').replace(/^#/, '').match(/^([a-z0-9]+)(?:\?(.*))?$/i);
  if (!m) return null;
  const params = {};
  (m[2] || '').split('&').filter(Boolean).forEach(kv => {
    const [k, v = ''] = kv.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v);
  });
  return { tab: m[1], params };
}

// Returns true when a valid link was applied (so app.js skips restoring the last-used tab).
function applyDeepLink(hash) {
  const link = parseDeepLink(hash);
  if (!link || !document.getElementById('tab-' + link.tab)) return false;
  switchTab(link.tab);
  try { DEEP_LINK_STATE[link.tab]?.set(link.params); } catch (e) { /* malformed link — tab still opens */ }
  return true;
}

function copyDeepLink() {
  _deepLinkReady = true;
  updateDeepLink();
  copyText(location.href);
}

window.addEventListener('hashchange', () => applyDeepLink(location.hash));

// ── Command palette (Ctrl+K / ⌘K) ─────────────────────────
// Index is rebuilt each time the palette opens so it always reflects custom sections, card
// headings and the like. Every entry: { label, sub, kind, run }.
let _paletteItems = [], _paletteSel = 0;

function paletteIndex() {
  const items = [];
  const flash = el => { if (!el) return; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1400); };

  document.querySelectorAll('#topnav .nav-tab').forEach(b => {
    const tab = b.dataset.tab;
    items.push({ kind: 'Tab', label: b.textContent.replace('BETA', '').trim(), sub: 'Open tab', run: () => switchTab(tab) });
  });
  items.push({ kind: 'Tab', label: 'Recycle Bin', sub: 'Open tab', run: () => switchTab('recycle') });

  document.querySelectorAll('.tab-content .card[id]').forEach(card => {
    const k = card.querySelector('.kicker');
    if (!k) return;
    const tab = card.closest('.tab-content').id.replace(/^tab-/, '');
    const tabLabel = document.querySelector(`#topnav .nav-tab[data-tab="${tab}"]`)?.textContent.replace('BETA', '').trim() || tab;
    const label = k.textContent.replace('⠿', '').replace(/\s+/g, ' ').trim();
    items.push({ kind: 'Section', label, sub: tabLabel, run: () => { switchTab(tab); flash(card); } });
  });

  if (typeof CALC_META !== 'undefined') {
    Object.entries(CALC_META).forEach(([id, m]) => {
      const cat = Object.keys(CALC_REGISTRY).find(c => CALC_REGISTRY[c].calcs.includes(id));
      items.push({ kind: 'Calculator', label: m.label, sub: CALC_REGISTRY[cat]?.label || 'Calcs',
        run: () => { switchTab('calcs'); DEEP_LINK_STATE.calcs.set({ calc: id }); updateDeepLink(); } });
    });
  }

  if (typeof CABLE_DATA !== 'undefined') {
    ['RFOU', 'BFOU'].forEach(r => ['Power', 'InstrI', 'InstrC'].forEach(app => {
      (CABLE_DATA[r][app]?.entries || []).forEach(e => {
        const isP = app === 'Power';
        const cores = isP ? String(e.cores) : `${e.type}-${e.elements}`;
        const desc = isP ? `${e.cores}C × ${e.csa} mm²` : `${e.elements} ${e.type === 'PR' ? 'pr' : e.type === 'TR' ? 'tr' : 'qd'} × ${e.csa} mm²`;
        items.push({ kind: 'Cable', label: `${r}${isP ? '' : app === 'InstrI' ? '(i)' : '(c)'} ${desc}`, sub: `OD ${e.od} mm${isP && typeof e.current === 'number' ? ` · ${e.current} A` : ''}`,
          run: () => { switchTab('cable'); DEEP_LINK_STATE.cable.set({ r, app, cores, csa: String(e.csa) }); flash(document.getElementById('card-cable-selector')); } });
      });
    }));
  }

  if (typeof NPT_DATA !== 'undefined') {
    Object.entries(NPT_DATA).forEach(([k, v]) => items.push({ kind: 'NPT', label: `${k}" NPT`, sub: `Thread OD ${v.threadOD} mm · ${v.tpi} TPI · ≈ ${v.metric}`,
      run: () => { switchTab('npt'); DEEP_LINK_STATE.npt.set({ size: k }); flash(document.getElementById('card-npt-lookup')); } }));
  }

  if (typeof SYMBOL_CATS !== 'undefined') {
    SYMBOL_CATS.forEach(c => c.items.forEach(([sym, name]) => items.push({ kind: 'Symbol', label: `${sym}  ${name}`, sub: `Copy · ${c.name}`, symbol: true, run: () => copyText(sym) })));
  }
  return items;
}

function openPalette() {
  _paletteItems = paletteIndex();
  const pal = document.getElementById('palette');
  pal.classList.remove('hidden');
  const inp = document.getElementById('paletteInput');
  inp.value = '';
  renderPalette();
  setTimeout(() => inp.focus(), 0);
}

function closePalette() { document.getElementById('palette').classList.add('hidden'); }

function paletteMatches(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return _paletteItems.filter(i => i.kind === 'Tab' || i.kind === 'Calculator').slice(0, 30);
  const scored = [];
  _paletteItems.forEach(i => {
    const hay = (i.label + ' ' + i.sub + ' ' + i.kind).toLowerCase();
    if (!words.every(w => hay.includes(w))) return;
    const l = i.label.toLowerCase();
    // Words found in the label outrank words only found in the description ("16" should hit
    // "4C × 16 mm²" before a 1.5 mm² cable rated 16 A); whole-word hits outrank partial ones.
    const labelWords = l.split(/[\s×·,()]+/);
    let score = words.filter(w => !l.includes(w)).length * 10
      + words.filter(w => !labelWords.includes(w)).length
      + (l.startsWith(words[0]) ? 0 : 0.5);
    if (i.symbol) score += 0.5; // symbols are numerous — rank them below real destinations
    scored.push([score, i]);
  });
  return scored.sort((a, b) => a[0] - b[0]).slice(0, 40).map(x => x[1]);
}

function renderPalette() {
  const q = document.getElementById('paletteInput').value;
  const list = document.getElementById('paletteList');
  const res = paletteMatches(q);
  _paletteSel = 0;
  list._results = res;
  list.innerHTML = res.length ? res.map((r, i) =>
    `<div class="palette-item${i === 0 ? ' sel' : ''}" role="option" data-i="${i}" onmousedown="event.preventDefault();paletteRun(${i})" onmousemove="paletteHover(${i})">
      <span class="palette-kind">${r.kind}</span><span class="palette-label">${escapeHtml(r.label)}</span><span class="palette-sub">${escapeHtml(r.sub)}</span>
    </div>`).join('') : `<div class="palette-empty">No matches for “${escapeHtml(q)}”</div>`;
}

function paletteHover(i) {
  _paletteSel = i;
  document.querySelectorAll('#paletteList .palette-item').forEach((el, j) => el.classList.toggle('sel', j === i));
}

function paletteRun(i) {
  const r = document.getElementById('paletteList')._results?.[i];
  if (!r) return;
  closePalette();
  r.run();
}

function paletteKey(e) {
  const n = document.getElementById('paletteList')._results?.length || 0;
  if (e.key === 'ArrowDown') { e.preventDefault(); paletteHover(Math.min(n - 1, _paletteSel + 1)); scrollPaletteSel(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); paletteHover(Math.max(0, _paletteSel - 1)); scrollPaletteSel(); }
  else if (e.key === 'Enter') { e.preventDefault(); paletteRun(_paletteSel); }
  else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
}
function scrollPaletteSel() { document.querySelector('#paletteList .palette-item.sel')?.scrollIntoView({ block: 'nearest' }); }

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    document.getElementById('palette').classList.contains('hidden') ? openPalette() : closePalette();
  }
});
document.addEventListener('click', e => { if (e.target.id === 'palette') closePalette(); });

// ── Field mode ─────────────────────────────────────────────
// Larger text and touch targets for a phone at the gland plate. Stored per device.
function applyFieldMode(on) {
  document.body.classList.toggle('field-mode', on);
  const b = document.getElementById('fieldBtn');
  if (b) { b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
}
function toggleFieldMode() {
  const on = !document.body.classList.contains('field-mode');
  try { localStorage.setItem('met_fieldmode', on ? '1' : '0'); } catch (e) {}
  applyFieldMode(on);
  toast(on ? 'Field mode on — larger controls' : 'Field mode off');
}
function initFieldMode() {
  let on = false;
  try { on = localStorage.getItem('met_fieldmode') === '1'; } catch (e) {}
  applyFieldMode(on);
}

// ── Backup reminder ────────────────────────────────────────
// Everything lives in this browser's localStorage only. If the user has built up data (snippets,
// custom sections, Wonder Tool / IS Loop project fields) and hasn't exported for 30 days, nudge
// them once — "Later" snoozes for 7 days.
const BACKUP_DAYS = 30, BACKUP_SNOOZE_DAYS = 7;

function userHasData() {
  const arr = k => { try { return JSON.parse(localStorage.getItem(k) || '[]').length > 0; } catch (e) { return false; } };
  return arr('met_snippets') || arr('met_customsecs') ||
    Object.keys(localStorage).some(k => (k.startsWith('met_wt_proj_') || k.startsWith('met_is_')) && localStorage.getItem(k));
}

function initBackupReminder() {
  const banner = document.getElementById('backupBanner');
  if (!banner) return;
  let last, snooze;
  try { last = +localStorage.getItem('met_lastexport') || 0; snooze = +localStorage.getItem('met_backup_snooze') || 0; } catch (e) { return; }
  const day = 864e5, now = Date.now();
  if (!userHasData() || now - last < BACKUP_DAYS * day || now - snooze < BACKUP_SNOOZE_DAYS * day) { banner.classList.add('hidden'); return; }
  const ago = last ? `${Math.floor((now - last) / day)} days ago` : 'never';
  banner.innerHTML = `<div class="wrap"><span><strong>Back up your data.</strong> Snippets, custom sections and project fields live only in this browser. Last export: ${ago}.</span>
    <button class="btn primary" onclick="exportData()">Export now</button>
    <button class="btn" onclick="snoozeBackupReminder()">Later</button></div>`;
  banner.classList.remove('hidden');
}

function snoozeBackupReminder() {
  try { localStorage.setItem('met_backup_snooze', String(Date.now())); } catch (e) {}
  document.getElementById('backupBanner')?.classList.add('hidden');
}

// ── Offline support ────────────────────────────────────────
// Registers sw.js (cache-first app shell) when served over http(s). Opening index.html from disk
// (file://) can't use a service worker, and doesn't need one.
function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is best-effort */ });
}

// ── Optional assets ────────────────────────────────────────
// Links marked data-optional-asset point at files that may not be in the repo (e.g. a copyrighted
// standard extract that can't be published). Hide the link when the file isn't there rather than
// leave a 404.
function hideMissingOptionalAssets() {
  if (!/^https?:$/.test(location.protocol)) return;
  document.querySelectorAll('a[data-optional-asset]').forEach(a => {
    fetch(a.getAttribute('href'), { method: 'HEAD' }).then(r => { if (!r.ok) a.hidden = true; }).catch(() => { a.hidden = true; });
  });
}
