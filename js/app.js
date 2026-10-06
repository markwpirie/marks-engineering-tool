// ══════════════════════════════════════════════════════════
// M.E.T. — MAIN APP
// ══════════════════════════════════════════════════════════

const APP_VERSION = '4.5';

// ── Utility ──
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function copyText(txt) {
  if (!navigator.clipboard) { toast('Copy needs https (or localhost)'); return; }
  navigator.clipboard.writeText(txt).then(() => toast('Copied: ' + txt.substring(0,30)), () => toast('Copy blocked by the browser'));
}

function makeCopyBox(val, label='') {
  return `<div class="result-box">${label ? '<span style="color:var(--text2);font-size:0.75rem">'+label+'</span><br>' : ''}<span>${val}</span><button class="copy-btn" data-copy="${escapeHtml(val)}" onclick="copyText(this.dataset.copy)">Copy</button></div>`;
}

// ── Tab routing ──
// Tabs that were renamed/merged — keeps an old met_lasttab value or bookmarked link working.
const TAB_ALIASES = { glandingv2: 'cable' };

function switchTab(name) {
  name = TAB_ALIASES[name] || name;
  if (!document.getElementById('tab-' + name)) name = 'symbols';
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => {
    const on = t.getAttribute('data-tab') === name;
    t.classList.toggle('active', on);
    if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
  document.getElementById('binBtn')?.classList.toggle('active', name === 'recycle');
  // On a narrow screen the nav scrolls sideways — bring the active tab into view (horizontal only,
  // so the page itself never jumps).
  const nav = document.getElementById('topnav'), act = nav?.querySelector('.nav-tab.active');
  if (nav && act && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = act.offsetLeft - nav.clientWidth / 2 + act.offsetWidth / 2;
  localStorage.setItem('met_lasttab', name);
  if (typeof updateDeepLink === 'function') updateDeepLink();
}

// ── Dark/Light mode ──
function setThemeIcon(isLight) {
  const use = document.querySelector('#themeIcon use');
  if (use) use.setAttribute('href', isLight ? '#i-sun' : '#i-moon');
}

// An explicit choice (met_theme) wins; with none saved yet, follow the device's light/dark setting.
function initTheme() {
  const saved = localStorage.getItem('met_theme');
  const light = saved ? saved === 'light'
    : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  document.body.classList.toggle('light-mode', light);
  setThemeIcon(light);
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('met_theme', isLight ? 'light' : 'dark');
  setThemeIcon(isLight);
}

// ── About modal ──
function showAbout() {
  document.getElementById('aboutModal').classList.add('show');
}
function closeAbout() {
  document.getElementById('aboutModal').classList.remove('show');
}

// ── Export / Import JSON ──
// Keys of the form met_wt_proj_* (Wonder Tool project fields) are collected by prefix scan
// since there are several of them and the list may grow.
function wtProjKeys() {
  return Object.keys(localStorage).filter(k => k.startsWith('met_wt_proj_'));
}

// IS Loop fields (met_is_*) are collected by prefix scan the same way — covers
// the static barrier/instrument/project fields plus the per-segment cable keys.
function isLoopKeys() {
  return Object.keys(localStorage).filter(k => k.startsWith('met_is_'));
}

function exportData() {
  const wtProj = {};
  wtProjKeys().forEach(k => { wtProj[k] = localStorage.getItem(k); });
  const isLoop = {};
  isLoopKeys().forEach(k => { isLoop[k] = localStorage.getItem(k); });
  const data = {
    version: APP_VERSION,
    exported: new Date().toISOString(),
    snippets:        JSON.parse(localStorage.getItem('met_snippets')   || '[]'),
    customSections:  JSON.parse(localStorage.getItem('met_customsecs') || '[]'),
    recycledSections:JSON.parse(localStorage.getItem('met_recycled')   || '[]'),
    sectionOrder:    JSON.parse(localStorage.getItem('met_secorder')   || 'null'),
    hiddenSections:  JSON.parse(localStorage.getItem('met_hiddensecs') || '[]'),
    cardOrder:       JSON.parse(localStorage.getItem('met_cardorder')  || '{}'),
    cardHidden:      JSON.parse(localStorage.getItem('met_cardhidden')    || '[]'),
    cardCollapsed:   JSON.parse(localStorage.getItem('met_cardcollapsed') || '[]'),
    theme:           localStorage.getItem('met_theme') || 'dark',
    calcState:       JSON.parse(localStorage.getItem('met_calc_state') || '{}'),
    wonderToolProject: wtProj,
    isLoop,
    trayFill:        JSON.parse(localStorage.getItem('met_trayfill') || 'null'),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `met-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  try { localStorage.setItem('met_lastexport', String(Date.now())); } catch (e) {}
  document.getElementById('backupBanner')?.classList.add('hidden');
  toast('Exported');
}

// Summarises what an import file would overwrite, for the confirmation prompt. Returns null if the
// file doesn't look like an M.E.T. export at all.
function describeImport(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const known = ['snippets','customSections','recycledSections','sectionOrder','hiddenSections','cardOrder','cardHidden','cardCollapsed','theme','calcState','wonderToolProject','isLoop','trayFill'];
  if (!known.some(k => k in data)) return null;
  const n = v => Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : 0;
  const lines = [];
  if (data.snippets) lines.push(`• ${n(data.snippets)} clipboard snippet(s) — replaces your current ${n(JSON.parse(localStorage.getItem('met_snippets') || '[]'))}`);
  if (data.customSections) lines.push(`• ${n(data.customSections)} custom symbol section(s) — replaces your current ${n(JSON.parse(localStorage.getItem('met_customsecs') || '[]'))}`);
  if (data.recycledSections) lines.push(`• Recycle bin (${n(data.recycledSections)} item(s))`);
  if (data.sectionOrder || data.hiddenSections || data.cardOrder || data.cardHidden || data.cardCollapsed) lines.push('• Section / card order, hidden sections and collapsed cards');
  if (data.calcState) lines.push(`• Saved inputs for ${n(data.calcState)} calculator(s)`);
  if (data.wonderToolProject) lines.push(`• Wonder Tool project details (${n(data.wonderToolProject)} field(s))`);
  if (data.isLoop) lines.push(`• IS Loop fields (${n(data.isLoop)} field(s))`);
  if (data.trayFill) lines.push('• Cable tray fill cables');
  if (data.theme) lines.push(`• Theme (${data.theme})`);
  const ver = data.version ? `v${data.version}` : 'an unknown version';
  const when = data.exported ? ` on ${String(data.exported).slice(0, 10)}` : '';
  const newer = data.version && parseFloat(data.version) > parseFloat(APP_VERSION)
    ? `\n\n⚠ This file came from a NEWER version (v${data.version}) than this app (v${APP_VERSION}) — some data may not import.` : '';
  return `Import data exported from M.E.T. ${ver}${when}?\n\nThis will overwrite:\n${lines.join('\n') || '• (nothing recognised)'}${newer}\n\nTip: Export first if you want to keep what you have now.`;
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const summary = describeImport(data);
        if (!summary) { toast('Import failed: not an M.E.T. export file'); return; }
        if (!confirm(summary)) { toast('Import cancelled'); return; }
        if (data.snippets)         localStorage.setItem('met_snippets',   JSON.stringify(data.snippets));
        if (data.customSections)   localStorage.setItem('met_customsecs', JSON.stringify(data.customSections));
        if (data.recycledSections) localStorage.setItem('met_recycled',   JSON.stringify(data.recycledSections));
        if (data.sectionOrder)     localStorage.setItem('met_secorder',   JSON.stringify(data.sectionOrder));
        if (data.hiddenSections)   localStorage.setItem('met_hiddensecs', JSON.stringify(data.hiddenSections));
        if (data.cardOrder)        localStorage.setItem('met_cardorder',  JSON.stringify(data.cardOrder));
        if (data.cardHidden)       localStorage.setItem('met_cardhidden',    JSON.stringify(data.cardHidden));
        if (data.cardCollapsed)    localStorage.setItem('met_cardcollapsed', JSON.stringify(data.cardCollapsed));
        if (data.theme)            localStorage.setItem('met_theme',      data.theme);
        if (data.calcState)        localStorage.setItem('met_calc_state', JSON.stringify(data.calcState));
        if (data.wonderToolProject) Object.entries(data.wonderToolProject).forEach(([k,v]) => localStorage.setItem(k, v));
        if (data.isLoop)            Object.entries(data.isLoop).forEach(([k,v]) => localStorage.setItem(k, v));
        if (data.trayFill)          localStorage.setItem('met_trayfill', JSON.stringify(data.trayFill));
        // Reload live state
        snippets         = JSON.parse(localStorage.getItem('met_snippets')   || '[]');
        customSections   = JSON.parse(localStorage.getItem('met_customsecs') || '[]');
        recycledSections = JSON.parse(localStorage.getItem('met_recycled')   || '[]');
        sectionOrder     = JSON.parse(localStorage.getItem('met_secorder')   || 'null');
        hiddenSections   = JSON.parse(localStorage.getItem('met_hiddensecs') || '[]');
        cardOrder        = JSON.parse(localStorage.getItem('met_cardorder')  || '{}');
        renderSymbols(); renderSnippets(); renderRecycleBin();
        if (typeof initWonderTool === 'function') initWonderTool();
        if (typeof initIsLoop === 'function') initIsLoop();
        if (typeof initCardReorder === 'function') initCardReorder();
        if (typeof refreshCardChrome === 'function') refreshCardChrome();
        if (typeof renderRecycleBin === 'function') renderRecycleBin();
        if (typeof initTrayFill === 'function') initTrayFill();
        initTheme();
        toast('Imported');
      } catch(err) { toast('Import failed: invalid file'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ── Reset all state ──
function resetAllState() {
  if (!confirm('Reset all calculator inputs to defaults? This clears saved values for all tabs.')) return;
  // Clear calc-specific state
  if (typeof clearAllCalcState === 'function') clearAllCalcState();
  // Clear SI prefix / unit converter selections (these are module-scoped `let` bindings, not
  // window properties, so they must be reset via dedicated functions — see tab-units.js)
  if (typeof resetSIPrefix === 'function') resetSIPrefix();
  if (typeof resetUnitConverter === 'function') resetUnitConverter();
  // Clear Wonder Tool project fields
  Object.keys(localStorage).filter(k => k.startsWith('met_wt_proj_')).forEach(k => localStorage.removeItem(k));
  // Clear IS Loop fields (project/loop, barrier, instrument, cable segments)
  Object.keys(localStorage).filter(k => k.startsWith('met_is_')).forEach(k => localStorage.removeItem(k));
  toast('All inputs reset to defaults');
  // Re-init all tabs
  if (typeof initUnitConverter === 'function') initUnitConverter();
  if (typeof initSIPrefixBtns === 'function') initSIPrefixBtns();
  if (typeof calcSI === 'function') calcSI();
  if (typeof initCalcs === 'function') initCalcs();
  if (typeof initWonderTool === 'function') initWonderTool();
  if (typeof initIsLoop === 'function') initIsLoop();
}

// ── Prompt generator ──
function generatePrompt() {
  const role = document.getElementById('pgRole')?.value.trim() || '';
  const task = document.getElementById('pgTask')?.value.trim() || '';
  const format = document.getElementById('pgFormat')?.value.trim() || '';
  const context = document.getElementById('pgContext')?.value.trim() || '';
  if (!task && !role) { toast('Enter at least a role or task'); return; }
  let prompt = '';
  if (role) prompt += `You are ${role}.\n\n`;
  if (context) prompt += `<context>\n${context}\n</context>\n\n`;
  if (task) prompt += `<instructions>\n${task}\n</instructions>`;
  if (format) prompt += `\n\n<output_format>\n${format}\n</output_format>`;
  const escaped = escapeHtml(prompt);
  const out = document.getElementById('pgOutput');
  if (out) out.innerHTML = `<div style="white-space:pre-wrap;font-family:var(--mono);font-size:0.82rem;color:var(--accent3);padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;position:relative">${escaped}<button class="copy-btn" data-copy="${escapeHtml(prompt)}" onclick="copyText(this.dataset.copy)">Copy</button></div>`;
}

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Version strings (single source of truth: APP_VERSION)
  const verPill = document.getElementById('verBannerPill'); if (verPill) verPill.textContent = 'v' + APP_VERSION;
  const verAbout = document.getElementById('aboutVersion'); if (verAbout) verAbout.textContent = 'v' + APP_VERSION;
  const verFooter = document.getElementById('footerVersion'); if (verFooter) verFooter.textContent = 'v' + APP_VERSION;

  initFieldMode();

  // Restore last tab (a deep link in the URL, applied at the end of init, takes precedence)
  const lastTab = localStorage.getItem('met_lasttab') || 'symbols';
  switchTab(lastTab);

  // Tab 1 — Symbols
  renderSymbols();
  renderSnippets();

  // Tab 2 — ATEX
  initEncoder();
  renderZoneMatrix();
  calcIPAtex();
  atexSuitCheck();
  // Auto-decode first quick-load button
  const firstAtexBtn = document.querySelector('#tab-atex .flex-wrap .btn');
  if (firstAtexBtn) firstAtexBtn.click();

  // Tab 3 — Units
  initUnitConverter();
  initSIPrefixBtns();
  calcSI();

  // Tab 4 — Calcs
  initCalcs();

  // Tab 5 — Cable
  updateCableCores();
  // Default to a representative RFOU 3-core 2.5mm² cable rather than the list's first entry
  document.getElementById('c_cores').value = '3';
  updateCableCSA();
  document.getElementById('c_csa').value = '2.5';
  showCableResult();
  renderAWGSection();
  initTrayFill();           // 5.5 tray fill
  initPulling();            // 5.6 pulling tension
  updateGgenSizes();        // init gland generator dropdowns
  updateCgenUI();           // init cable descriptor generator

  // Tab 5b — Wonder Tool
  initWonderTool();

  // Tab 5c — IS Loop
  initIsLoop();

  // Tab 6 — NPT
  showNPTInfo();
  showAdapterInfo();
  renderNPTTable();

  // Tab 7 — Prompt engineering
  renderPromptRoles();
  renderPromptPresets();
  renderPromptTipsBuiltin();

  // Recycle Bin
  renderRecycleBin();

  // Doc number generator
  initDocSearch();

  // Site-wide card drag-reorder (all tabs)
  initCardReorder();

  // Site-wide card collapse + hide (all tabs)
  initCardChrome();
  renderRecycleBin();

  // Close modals on backdrop click
  document.getElementById('aboutModal').addEventListener('click', e => {
    if (e.target === document.getElementById('aboutModal')) closeAbout();
  });
  document.getElementById('emojiModal').addEventListener('click', e => {
    if (e.target === document.getElementById('emojiModal')) closeEmojiModal();
  });

  // Keyboard shortcut ESC to close modal
  document.addEventListener('keydown', e => { if (e.key==='Escape') { closeAbout(); closePalette(); } });

  // Deep link (#tab?…) last, once every tab has its default state to override
  if (location.hash) applyDeepLink(location.hash);
  _deepLinkReady = true;
  updateDeepLink();

  initBackupReminder();
  hideMissingOptionalAssets();
  registerServiceWorker();
});
