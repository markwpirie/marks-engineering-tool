// ══════════════════════════════════════════════════════════
// SITE-WIDE CARD COLLAPSE + HIDE
// Adds, to every top-level .card[id] that js/reorder.js already makes
// draggable, a collapse toggle and (for non-essential cards) a ✕ that
// hides it. Mirrors the Symbols tab's built-in-section hide: nothing is
// deleted, the card just moves to the Recycle Bin tab until restored.
//
// PROTECTED_CARDS holds each tool's primary input/output chain, plus
// the one card that houses a tab's only way to generate output (e.g.
// Wonder Tool's PDF button lives in card-wonder-project) — hiding one
// of these would strand the rest of that tab, so they get collapse +
// move but no ✕.
//
// Cards with no .kicker/.card-head header row (card-units-converter,
// card-calcs-panel) are each a tab's sole feature anyway and are
// skipped entirely — reorder.js still makes them draggable.
// ══════════════════════════════════════════════════════════

const PROTECTED_CARDS = new Set([
  'card-wonder-project', 'card-wonder-motor', 'card-wonder-cable', 'card-wonder-gland',
  'card-isloop-project', 'card-isloop-barrier', 'card-isloop-instrument', 'card-isloop-cable', 'card-isloop-result',
  'card-sym-customsections',
  'card-cable-selector',
]);

// Collapsed the first time a viewer ever sees it (before any saved state exists) —
// a UX default, not a protection — so Wonder Tool opens with the motor form in
// focus rather than a 7-field project header.
const DEFAULT_COLLAPSED = ['card-wonder-project'];

let cardHidden    = JSON.parse(localStorage.getItem('met_cardhidden')    || '[]');
let cardCollapsed = JSON.parse(localStorage.getItem('met_cardcollapsed') || 'null');
if (cardCollapsed === null) cardCollapsed = DEFAULT_COLLAPSED.slice();

function saveCardHidden()    { localStorage.setItem('met_cardhidden',    JSON.stringify(cardHidden)); }
function saveCardCollapsed() { localStorage.setItem('met_cardcollapsed', JSON.stringify(cardCollapsed)); }

function cardChromeTitle(card) {
  const kicker = card.querySelector(':scope > .kicker, :scope > .card-head .kicker, :scope > div > .kicker');
  return (kicker ? kicker.textContent : card.id).trim().replace(/\s+/g, ' ');
}

function toggleCardCollapse(id) {
  if (cardCollapsed.includes(id)) cardCollapsed = cardCollapsed.filter(c => c !== id);
  else cardCollapsed.push(id);
  saveCardCollapsed();
  applyCardCollapse(id);
}

function applyCardCollapse(id) {
  const card = document.getElementById(id);
  if (!card) return;
  const body = card.querySelector(':scope > .card-chrome-body');
  const chevron = card.querySelector(':scope .card-chrome-chevron');
  const closed = cardCollapsed.includes(id);
  if (body) body.classList.toggle('closed', closed);
  if (chevron) chevron.textContent = closed ? '▸' : '▾';
}

function hideCard(id) {
  if (!cardHidden.includes(id)) cardHidden.push(id);
  saveCardHidden();
  applyCardHidden(id);
  if (typeof renderRecycleBin === 'function') renderRecycleBin();
}

function restoreCard(id) {
  cardHidden = cardHidden.filter(c => c !== id);
  saveCardHidden();
  applyCardHidden(id);
  if (typeof renderRecycleBin === 'function') renderRecycleBin();
}

function applyCardHidden(id) {
  const card = document.getElementById(id);
  if (card) card.classList.toggle('card-chrome-hidden', cardHidden.includes(id));
}

// Recycle Bin tab — concatenated onto tab-symbols.js's renderRecycleBin() output.
function renderHiddenCardsList() {
  return cardHidden.map(id => {
    const card = document.getElementById(id);
    const name = card ? cardChromeTitle(card) : id;
    return `
    <div class="card mb-10">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:1.5rem">🧩</div>
        <div class="flex-1">
          <div style="font-weight:600;color:var(--text)">${escapeHtml(name)}</div>
          <div class="small muted">Hidden section</div>
        </div>
        <button class="btn small" onclick="restoreCard('${id}')">Restore</button>
      </div>
    </div>`;
  }).join('');
}

// Re-reads saved state (e.g. after an import) and re-applies it to any card
// chrome already injected by initCardChrome() — doesn't re-inject chrome.
function refreshCardChrome() {
  cardHidden    = JSON.parse(localStorage.getItem('met_cardhidden')    || '[]');
  cardCollapsed = JSON.parse(localStorage.getItem('met_cardcollapsed') || 'null');
  if (cardCollapsed === null) cardCollapsed = DEFAULT_COLLAPSED.slice();
  document.querySelectorAll('.tab-content .card[id][data-chrome-init]').forEach(card => {
    applyCardCollapse(card.id);
    applyCardHidden(card.id);
  });
}

function initCardChrome() {
  document.querySelectorAll('.tab-content .card[id]').forEach(card => {
    if (card.dataset.chromeInit) return;
    const kicker = card.querySelector(':scope > .kicker, :scope > .card-head > .kicker, :scope > div > .kicker');
    if (!kicker) return; // no single header row to hang chrome off — reorder.js still handles drag
    card.dataset.chromeInit = '1';

    const header = kicker.parentElement.matches('.card-head') ? kicker.parentElement : kicker;

    // Collapsible body — every child of the card except the header row.
    const bodyChildren = [...card.children].filter(c => c !== header);
    const body = document.createElement('div');
    body.className = 'card-chrome-body collapsible';
    body.style.maxHeight = '9999px';
    bodyChildren.forEach(c => body.appendChild(c));
    card.appendChild(body);

    const chevron = document.createElement('span');
    chevron.className = 'card-chrome-chevron';
    chevron.title = 'Collapse / expand';
    chevron.textContent = '▾';
    kicker.insertBefore(chevron, kicker.firstChild);

    if (!PROTECTED_CARDS.has(card.id)) {
      const hideBtn = document.createElement('button');
      hideBtn.type = 'button';
      hideBtn.className = 'card-chrome-hide';
      hideBtn.title = 'Hide — send to Recycle Bin';
      hideBtn.textContent = '✕';
      hideBtn.onclick = e => { e.stopPropagation(); hideCard(card.id); };
      kicker.insertBefore(hideBtn, kicker.firstChild);
    }

    header.style.cursor = 'pointer';
    header.addEventListener('click', e => {
      if (e.target.closest('button, input, select, a, textarea')) return;
      toggleCardCollapse(card.id);
    });

    applyCardCollapse(card.id);
    applyCardHidden(card.id);
  });
}
