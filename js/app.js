// ══════════════════════════════════════════════════════════
// M.E.T. — MAIN APP
// ══════════════════════════════════════════════════════════

const APP_VERSION = '4.0';

// ── Utility ──
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function copyText(txt) {
  navigator.clipboard.writeText(txt).then(() => toast('Copied: ' + txt.substring(0,30)));
}

function makeCopyBox(val, label='') {
  return `<div class="result-box">${label ? '<span style="color:var(--text2);font-size:0.75rem">'+label+'</span><br>' : ''}<span>${val}</span><button class="copy-btn" onclick="copyText(${JSON.stringify(val)})">Copy</button></div>`;
}

// ── Tab routing ──
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.getAttribute('data-tab') === name) t.classList.add('active');
  });
  localStorage.setItem('met_lasttab', name);
}

// ── Dark/Light mode ──
function setThemeIcon(isLight) {
  const use = document.querySelector('#themeIcon use');
  if (use) use.setAttribute('href', isLight ? '#i-sun' : '#i-moon');
}

function initTheme() {
  const saved = localStorage.getItem('met_theme');
  if (saved === 'light') {
    document.body.classList.add('light-mode');
  }
  setThemeIcon(saved === 'light');
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

function exportData() {
  const wtProj = {};
  wtProjKeys().forEach(k => { wtProj[k] = localStorage.getItem(k); });
  const data = {
    version: APP_VERSION,
    exported: new Date().toISOString(),
    snippets:        JSON.parse(localStorage.getItem('met_snippets')   || '[]'),
    customSections:  JSON.parse(localStorage.getItem('met_customsecs') || '[]'),
    recycledSections:JSON.parse(localStorage.getItem('met_recycled')   || '[]'),
    sectionOrder:    JSON.parse(localStorage.getItem('met_secorder')   || 'null'),
    theme:           localStorage.getItem('met_theme') || 'dark',
    calcState:       JSON.parse(localStorage.getItem('met_calc_state') || '{}'),
    wonderToolProject: wtProj,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `met-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  toast('Exported');
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
        if (data.snippets)         localStorage.setItem('met_snippets',   JSON.stringify(data.snippets));
        if (data.customSections)   localStorage.setItem('met_customsecs', JSON.stringify(data.customSections));
        if (data.recycledSections) localStorage.setItem('met_recycled',   JSON.stringify(data.recycledSections));
        if (data.sectionOrder)     localStorage.setItem('met_secorder',   JSON.stringify(data.sectionOrder));
        if (data.theme)            localStorage.setItem('met_theme',      data.theme);
        if (data.calcState)        localStorage.setItem('met_calc_state', JSON.stringify(data.calcState));
        if (data.wonderToolProject) Object.entries(data.wonderToolProject).forEach(([k,v]) => localStorage.setItem(k, v));
        // Reload live state
        snippets         = JSON.parse(localStorage.getItem('met_snippets')   || '[]');
        customSections   = JSON.parse(localStorage.getItem('met_customsecs') || '[]');
        recycledSections = JSON.parse(localStorage.getItem('met_recycled')   || '[]');
        sectionOrder     = JSON.parse(localStorage.getItem('met_secorder')   || 'null');
        renderSymbols(); renderSnippets(); renderRecycleBin();
        if (typeof initWonderTool === 'function') initWonderTool();
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
  toast('All inputs reset to defaults');
  // Re-init all tabs
  if (typeof initUnitConverter === 'function') initUnitConverter();
  if (typeof initSIPrefixBtns === 'function') initSIPrefixBtns();
  if (typeof calcSI === 'function') calcSI();
  if (typeof initCalcs === 'function') initCalcs();
  if (typeof initWonderTool === 'function') initWonderTool();
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
  if (out) out.innerHTML = `<div style="white-space:pre-wrap;font-family:var(--mono);font-size:0.82rem;color:var(--accent3);padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;position:relative">${escaped}<button class="copy-btn" onclick="copyText(${JSON.stringify(prompt)})">Copy</button></div>`;
}

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Version strings (single source of truth: APP_VERSION)
  const verPill = document.getElementById('verBannerPill'); if (verPill) verPill.textContent = 'v' + APP_VERSION;
  const verAbout = document.getElementById('aboutVersion'); if (verAbout) verAbout.textContent = 'v' + APP_VERSION;
  const verFooter = document.getElementById('footerVersion'); if (verFooter) verFooter.textContent = 'v' + APP_VERSION;

  // Restore last tab
  const lastTab = localStorage.getItem('met_lasttab') || 'symbols';
  switchTab(lastTab);

  // Tab 1 — Symbols
  renderSymbols();
  renderSnippets();

  // Tab 2 — ATEX
  initEncoder();
  renderZoneMatrix();
  calcIPAtex();
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
  renderAWGSection();
  updateGgenSizes();        // init gland generator dropdowns
  updateCgenUI();           // init cable descriptor generator

  // Tab 5b — Wonder Tool
  initWonderTool();

  // Tab 6 — NPT
  showNPTInfo();
  showAdapterInfo();
  renderNPTTable();

  // Tab 7 — Prompt engineering
  renderPromptRoles();
  renderPromptTipsBuiltin();

  // Recycle Bin
  renderRecycleBin();

  // Doc number generator
  initDocSearch();

  // Close modals on backdrop click
  document.getElementById('aboutModal').addEventListener('click', e => {
    if (e.target === document.getElementById('aboutModal')) closeAbout();
  });
  document.getElementById('emojiModal').addEventListener('click', e => {
    if (e.target === document.getElementById('emojiModal')) closeEmojiModal();
  });

  // Keyboard shortcut ESC to close modal
  document.addEventListener('keydown', e => { if (e.key==='Escape') closeAbout(); });
});
