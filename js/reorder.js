// ══════════════════════════════════════════════════════════
// SITE-WIDE CARD REORDER
// Generalises the Symbols tab's existing section-level drag-reorder
// (tab-symbols.js — left untouched, manages sections *inside* one card
// area) to every other top-level .card across all tabs.
//
// Cards are grouped by their immediate parent element, so a drag can
// never move a card out of its layout column — e.g. the ATEX
// decoder/encoder pair, which share a 2-column grid, only reorder
// against each other, never against the full-width cards below.
//
// Persisted per tab as a flat array of card ids in met_cardorder.
// Unknown/new cards keep their DOM position (same forward-compat
// approach as tab-symbols.js's getSectionOrder()).
// ══════════════════════════════════════════════════════════

let cardOrder = JSON.parse(localStorage.getItem('met_cardorder') || '{}');

function saveCardOrder() {
  localStorage.setItem('met_cardorder', JSON.stringify(cardOrder));
}

// One "group" per distinct parent element that holds two or more
// reorderable cards — only groups of 2+ are draggable, a lone card has
// nothing to reorder against.
function getCardGroups(tabEl) {
  const groups = [];
  const seenParents = new Set();
  tabEl.querySelectorAll(':scope .card[id]').forEach(card => {
    const parent = card.parentElement;
    if (seenParents.has(parent)) return;
    seenParents.add(parent);
    const siblingCards = [...parent.children].filter(c => c.matches('.card[id]'));
    if (siblingCards.length > 1) groups.push({ parent, cards: siblingCards });
  });
  return groups;
}

function applyCardOrder(tabId, groups) {
  const saved = cardOrder[tabId] || [];
  groups.forEach(({ parent, cards }) => {
    const ids = cards.map(c => c.id);
    const ordered = saved.filter(id => ids.includes(id));
    ids.forEach(id => { if (!ordered.includes(id)) ordered.push(id); });

    // Rebuild the parent's full child list, substituting the reordered
    // cards into their original slot positions — any non-card sibling
    // (e.g. a disabled "coming soon" stub section sitting between real
    // cards) stays exactly where it was instead of getting shoved to
    // the end, which plain sequential appendChild would do.
    const orderedEls = ordered.map(id => document.getElementById(id));
    let cardCursor = 0;
    const finalChildren = [...parent.children].map(el =>
      el.matches('.card[id]') ? orderedEls[cardCursor++] : el
    );
    parent.append(...finalChildren);
  });
}

function persistCardOrder(tabId, tabEl) {
  const flat = [];
  getCardGroups(tabEl).forEach(({ parent }) => {
    [...parent.children].filter(c => c.matches('.card[id]')).forEach(c => flat.push(c.id));
  });
  cardOrder[tabId] = flat;
  saveCardOrder();
}

let _cardDragSrc = null;
function cardDragStart(e) {
  _cardDragSrc = e.currentTarget;
  e.currentTarget.classList.add('dragging');
}
function cardDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}
function cardDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function cardDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const dst = e.currentTarget;
  if (_cardDragSrc && _cardDragSrc !== dst && _cardDragSrc.parentElement === dst.parentElement) {
    const parent = dst.parentElement;
    const cards = [...parent.children].filter(c => c.matches('.card[id]'));
    const si = cards.indexOf(_cardDragSrc), di = cards.indexOf(dst);
    if (si !== -1 && di !== -1) {
      if (si < di) parent.insertBefore(_cardDragSrc, dst.nextSibling);
      else parent.insertBefore(_cardDragSrc, dst);
      const tabEl = parent.closest('.tab-content');
      if (tabEl) persistCardOrder(tabEl.id.replace(/^tab-/, ''), tabEl);
    }
  }
  if (_cardDragSrc) _cardDragSrc.classList.remove('dragging');
  _cardDragSrc = null;
}

function initCardReorder() {
  document.querySelectorAll('.tab-content').forEach(tabEl => {
    const tabId = tabEl.id.replace(/^tab-/, '');
    const groups = getCardGroups(tabEl);
    if (!groups.length) return;

    applyCardOrder(tabId, groups);

    groups.forEach(({ cards }) => {
      cards.forEach(card => {
        if (card.dataset.reorderInit) return;
        card.dataset.reorderInit = '1';
        const kicker = card.querySelector(':scope > .kicker, :scope > div > .kicker');
        const handle = document.createElement('span');
        handle.className = 'drag-handle';
        handle.title = 'Drag to reorder';
        handle.textContent = '⠿';
        if (kicker) kicker.insertBefore(handle, kicker.firstChild);
        else card.insertBefore(handle, card.firstChild);
        card.draggable = true;
        card.addEventListener('dragstart', cardDragStart);
        card.addEventListener('dragover', cardDragOver);
        card.addEventListener('dragleave', cardDragLeave);
        card.addEventListener('drop', cardDrop);
      });
    });
  });
}
