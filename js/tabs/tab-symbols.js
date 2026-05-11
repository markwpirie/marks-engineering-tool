// ══════════════════════════════════════════════════════════
// TAB — SYMBOLS  (v3.4)
// ══════════════════════════════════════════════════════════

// ── Persistent state ──
let snippets        = JSON.parse(localStorage.getItem('met_snippets')    || '[]');
let customSections  = JSON.parse(localStorage.getItem('met_customsecs')  || '[]');
let recycledSections= JSON.parse(localStorage.getItem('met_recycled')    || '[]');
let sectionOrder    = (() => {
  const saved = JSON.parse(localStorage.getItem('met_secorder') || 'null');
  if (!saved || !saved.includes('datetime')) { localStorage.removeItem('met_secorder'); return null; }
  return saved;
})();

function saveAll() {
  localStorage.setItem('met_snippets',   JSON.stringify(snippets));
  localStorage.setItem('met_customsecs', JSON.stringify(customSections));
  localStorage.setItem('met_recycled',   JSON.stringify(recycledSections));
  localStorage.setItem('met_secorder',   JSON.stringify(getSectionOrder()));
}

// ── Copy helper ──
function symCopy(el) {
  const txt = el.getAttribute('data-copy');
  if (txt) copyText(txt);
}

function makeSymCard(symbol, label) {
  const safe = symbol.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<div class="sym-card" data-copy="${safe}" onclick="symCopy(this)" title="${label.replace(/"/g,'&quot;')}"><span class="sym">${symbol}</span><span class="sym-label">${label}</span></div>`;
}

// ── Date/Time section ──
function getTodayFormats() {
  const d = new Date();
  const pad = n => String(n).padStart(2,'0');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const daysShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const ordinal = n => { const s=['th','st','nd','rd']; const v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); };
  const D=d.getDate(), M=d.getMonth(), Y=d.getFullYear(), H=d.getHours(), Min=d.getMinutes(), S=d.getSeconds();
  return [
    { label:'DD/MM/YYYY',           val:`${pad(D)}/${pad(M+1)}/${Y}` },
    { label:'MM/DD/YYYY (US)',       val:`${pad(M+1)}/${pad(D)}/${Y}` },
    { label:'YYYY-MM-DD (ISO)',      val:`${Y}-${pad(M+1)}-${pad(D)}` },
    { label:'DD-MM-YY',             val:`${pad(D)}-${pad(M+1)}-${String(Y).slice(2)}` },
    { label:'D MMM YYYY',           val:`${D} ${monthsShort[M]} ${Y}` },
    { label:'DD MMM YYYY',          val:`${pad(D)} ${monthsShort[M]} ${Y}` },
    { label:'D Month YYYY',         val:`${D} ${months[M]} ${Y}` },
    { label:'DD Month YYYY',        val:`${pad(D)} ${months[M]} ${Y}` },
    { label:'Ordinal long',         val:`${ordinal(D)} ${months[M]} ${Y}` },
    { label:'Month the Dth YYYY',   val:`${months[M]} the ${ordinal(D)} ${Y}` },
    { label:'Day, D Month YYYY',    val:`${days[d.getDay()]}, ${D} ${months[M]} ${Y}` },
    { label:'Day D Mon YYYY',       val:`${daysShort[d.getDay()]} ${pad(D)} ${monthsShort[M]} ${Y}` },
    { label:'DDMMYY (compact)',     val:`${pad(D)}${pad(M+1)}${String(Y).slice(2)}` },
    { label:'YYYYMMDD (sortable)',  val:`${Y}${pad(M+1)}${pad(D)}` },
    { label:'HH:MM',                val:`${pad(H)}:${pad(Min)}` },
    { label:'HH:MM:SS',             val:`${pad(H)}:${pad(Min)}:${pad(S)}` },
    { label:'HH:MM (12hr)',         val:`${H%12||12}:${pad(Min)} ${H<12?'AM':'PM'}` },
    { label:'ISO 8601 datetime',    val:d.toISOString() },
    { label:'Unix timestamp',       val:Math.floor(d.getTime()/1000).toString() },
    { label:'Week number',          val:`W${pad(Math.ceil((((d - new Date(Y,0,1))/86400000) + new Date(Y,0,1).getDay() + 1) / 7))} ${Y}` },
    { label:'Q (quarter)',          val:`Q${Math.ceil((M+1)/3)} ${Y}` },
    { label:'Month Year',           val:`${months[M]} ${Y}` },
    { label:'Mon YY',               val:`${monthsShort[M]} ${String(Y).slice(2)}` },
    { label:'Month only',           val:months[M] },
    { label:'Day only',             val:days[d.getDay()] },
  ];
}

// ── Special built-in sections ──
const SPECIAL_SECTIONS = {
  datetime: {
    key: 'datetime', emoji: '📅', name: 'Date & Time — Today',
    render(q) {
      const items = getTodayFormats().filter(f => !q || f.label.toLowerCase().includes(q) || f.val.toLowerCase().includes(q));
      if (!items.length && q) return '';
      return `<p style="font-size:0.75rem;color:var(--text3);margin-bottom:10px">Live — all formats show today's date. Click to copy.</p>
        <div class="symbol-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
          ${items.map(f => {
            const safe = f.val.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return `<div class="sym-card" data-copy="${safe}" onclick="symCopy(this)" style="flex-direction:row;align-items:center;justify-content:flex-start;gap:8px;padding:10px">
              <div style="min-width:0"><div style="font-family:var(--mono);font-size:0.88rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.val}</div>
              <div class="sym-label" style="text-align:left;margin-top:2px">${f.label}</div></div></div>`;
          }).join('')}
        </div>`;
    }
  },
  emojipicker: {
    key: 'emojipicker', emoji: '😊', name: 'Emoji Picker',
    render(q) {
      let html = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">`;
      EMOJI_CATS.forEach((cat,ci) => {
        html += `<button class="btn" style="font-size:0.75rem;padding:4px 10px" onclick="switchEmojiCat(${ci})" id="emcat_${ci}">${cat.name}</button>`;
      });
      html += `</div><div id="emojiGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:4px"></div>`;
      return html;
    }
  }
};

// SYMBOL_CATS indices: 0=Fractions,1=Temperature,2=Electrical,3=Docs,4=Maths,5=Currency
// 'datetime' and 'emojipicker' are special sections
// Custom sections rendered separately with 'custom_N' keys in order array
const DEFAULT_ORDER = [0, 1, 'datetime', 2, 3, 4, 5, 'emojipicker'];

function getSectionOrder() {
  return sectionOrder || DEFAULT_ORDER;
}

// ── Emoji picker active category ──
let _emojiCatIdx = 0;
function switchEmojiCat(idx) {
  _emojiCatIdx = idx;
  // Update button styles
  EMOJI_CATS.forEach((_,i) => {
    const b = document.getElementById('emcat_'+i);
    if (b) b.classList.toggle('active', i===idx);
  });
  const grid = document.getElementById('emojiGrid');
  if (!grid) return;
  const cat = EMOJI_CATS[idx];
  grid.innerHTML = cat.emojis.map(e => {
    return `<div class="sym-card" data-copy="${e}" onclick="symCopy(this)" style="font-size:1.4rem;padding:6px;justify-content:center;min-height:44px" title="${e}">${e}</div>`;
  }).join('');
}

function initEmojiPicker() {
  switchEmojiCat(0);
}

// ── Main render ──
function renderSymbols() {
  const q = document.getElementById('symSearch').value.toLowerCase();
  let html = '';
  const order = getSectionOrder();

  order.forEach(key => {
    if (typeof key === 'string' && key.startsWith('custom_')) {
      // custom section by index embedded in order
      const si = parseInt(key.split('_')[1]);
      html += renderCustomSectionCard(si, q, key);
    } else if (typeof key === 'string') {
      const spec = SPECIAL_SECTIONS[key];
      if (!spec) return;
      const inner = spec.render(q);
      if (inner === '' && q) return;
      html += makeDraggableSection(key, `${spec.emoji} ${spec.name}`, inner || '', false);
    } else {
      const cat = SYMBOL_CATS[key];
      if (!cat) return;
      const filtered = cat.items.filter(([s,l]) => !q || s.toLowerCase().includes(q) || l.toLowerCase().includes(q));
      if (!filtered.length && q) return;
      const inner = `<div class="symbol-grid">${filtered.map(([s,l]) => makeSymCard(s,l)).join('')}</div>`;
      html += makeDraggableSection(key, `${cat.emoji} ${cat.name}`, inner, false);
    }
  });

  // Custom sections not yet in order (newly created)
  customSections.forEach((sec, si) => {
    const key = 'custom_'+si;
    if (!order.includes(key)) {
      html += renderCustomSectionCard(si, q, key);
    }
  });

  document.getElementById('sym-sections').innerHTML = html;

  // Init emoji picker after render
  if (document.getElementById('emojiGrid')) initEmojiPicker();
}

function makeDraggableSection(dataIdx, title, inner, isCustom, extraHeaderHtml='') {
  return `<div class="card sym-section" style="margin-bottom:12px" data-idx="${dataIdx}" draggable="true"
    ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="dragDrop(event)" ondragleave="dragLeave(event)">
    <div class="section-toggle" onclick="this.nextElementSibling.classList.toggle('closed')">
      <h3><span class="drag-handle" title="Drag to reorder">⠿</span>${title}</h3>
      <div style="display:flex;align-items:center;gap:8px">${extraHeaderHtml}<span style="color:var(--text2)">▾</span></div>
    </div>
    <div class="collapsible" style="max-height:9999px">${inner}</div>
  </div>`;
}

function renderCustomSectionCard(si, q, dataKey) {
  const sec = customSections[si];
  if (!sec) return '';
  const filtered = (sec.items||[]).filter(it => !q || it.text.toLowerCase().includes(q));
  const inner = `
    <div class="flex-row" style="margin-bottom:10px">
      <input type="text" id="csitem_${si}" placeholder="Add item..." style="flex:1" onkeydown="if(event.key==='Enter')addCustomItem(${si})">
      <button class="btn primary" onclick="addCustomItem(${si})">+</button>
    </div>
    <div class="symbol-grid">
      ${filtered.map((it,ii) => {
        const safe = it.text.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const label = (it.label||'').replace(/"/g,'&quot;');
        return `<div class="sym-card" data-copy="${safe}" onclick="symCopy(this)" title="${label}" style="position:relative">
          <span class="sym" style="font-size:0.9rem;word-break:break-all">${it.text}</span>
          ${label ? `<span class="sym-label">${it.label}</span>` : ''}
          <button onclick="event.stopPropagation();deleteCustomItem(${si},${ii})" style="position:absolute;top:2px;right:2px;background:none;border:none;color:var(--text2);cursor:pointer;font-size:0.7rem;line-height:1;padding:2px">✕</button>
        </div>`;
      }).join('')}
    </div>`;
  const trashBtn = `<button title="Send to Recycle Bin" onclick="event.stopPropagation();recycleCustomSection(${si})" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:1rem;padding:0 4px" title="Remove section">✕</button>`;
  return makeDraggableSection(dataKey, `${sec.emoji||'📌'} ${sec.name}`, inner, true, trashBtn);
}

// ── Drag-reorder ──
let dragSrc = null;
function dragStart(e) { dragSrc=e.currentTarget; e.currentTarget.classList.add('dragging'); }
function dragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function dragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function dragDrop(e) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  if (dragSrc && dragSrc !== e.currentTarget) {
    const rawSrc = dragSrc.dataset.idx;
    const rawDst = e.currentTarget.dataset.idx;
    const srcKey = isNaN(rawSrc) ? rawSrc : parseInt(rawSrc);
    const dstKey = isNaN(rawDst) ? rawDst : parseInt(rawDst);
    const order = getSectionOrder().slice();
    // Ensure custom sections present in order
    customSections.forEach((_,si) => { const k='custom_'+si; if (!order.includes(k)) order.push(k); });
    const si = order.indexOf(srcKey), di = order.indexOf(dstKey);
    if (si !== -1 && di !== -1) {
      order.splice(si, 1); order.splice(di, 0, srcKey);
      sectionOrder = order;
      saveAll();
      renderSymbols();
    }
  }
  if (dragSrc) dragSrc.classList.remove('dragging');
  dragSrc = null;
}

function filterSymbols() { renderSymbols(); renderSnippets(); }

// ══════════════════════════════════════════════════════════
// SNIPPETS
// ══════════════════════════════════════════════════════════
function addSnippet() {
  const t = document.getElementById('snipTitle').value.trim();
  const b = document.getElementById('snipBody').value.trim();
  if (!b) return;
  snippets.unshift({title: t||'Untitled', body: b});
  saveAll();
  document.getElementById('snipTitle').value = '';
  document.getElementById('snipBody').value = '';
  renderSnippets();
}

function deleteSnippet(i) {
  snippets.splice(i, 1);
  saveAll();
  renderSnippets();
}

function startEditSnippet(i) {
  const el = document.getElementById('snip_card_'+i);
  if (!el) return;
  const s = snippets[i];
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;width:100%">
      <input type="text" id="snip_etitle_${i}" value="${s.title.replace(/"/g,'&quot;')}" style="font-weight:600;font-size:0.85rem" placeholder="Title">
      <textarea id="snip_ebody_${i}" rows="3" style="font-size:0.82rem;resize:vertical">${s.body}</textarea>
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="btn" style="font-size:0.75rem;padding:4px 10px" onclick="cancelEditSnippet(${i})">Cancel</button>
        <button class="btn primary" style="font-size:0.75rem;padding:4px 10px" onclick="saveEditSnippet(${i})">Save</button>
      </div>
    </div>`;
}

function saveEditSnippet(i) {
  const t = document.getElementById('snip_etitle_'+i)?.value.trim();
  const b = document.getElementById('snip_ebody_'+i)?.value.trim();
  if (!b) return;
  snippets[i] = {title: t||'Untitled', body: b};
  saveAll();
  renderSnippets();
}

function cancelEditSnippet(i) { renderSnippets(); }

function renderSnippets() {
  const q = document.getElementById('symSearch').value.toLowerCase();
  const filtered = snippets.map((s,i)=>({s,i})).filter(({s}) => !q || s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q));
  document.getElementById('snippetList').innerHTML = filtered.length
    ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">
        ${filtered.map(({s,i}) => {
          const safeBody = s.body.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          return `<div class="snippet-card" id="snip_card_${i}" data-copy="${safeBody}" onclick="symCopy(this)" style="position:relative;cursor:pointer">
            <div class="snip-title">${s.title}</div>
            <div class="snip-body">${s.body.substring(0,200)}${s.body.length>200?'…':''}</div>
            <div style="position:absolute;top:4px;right:4px;display:flex;gap:2px">
              <button title="Edit" onclick="event.stopPropagation();startEditSnippet(${i})" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:0.8rem;padding:2px 4px">✎</button>
              <button title="Delete" onclick="event.stopPropagation();deleteSnippet(${i})" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:0.8rem;padding:2px 4px">✕</button>
            </div>
          </div>`;
        }).join('')}
      </div>`
    : '<p style="color:var(--text2);font-size:0.82rem">No snippets yet.</p>';
}

// ══════════════════════════════════════════════════════════
// CUSTOM SECTIONS
// ══════════════════════════════════════════════════════════
let _pickerTargetField = null; // 'new' or index of custom section being edited

function openEmojiModal(target) {
  _pickerTargetField = target;
  // Render modal
  let catHtml = EMOJI_CATS.map((c,i) =>
    `<button class="btn" id="mpcat_${i}" onclick="switchModalEmojiCat(${i})" style="font-size:0.75rem;padding:4px 8px">${c.name}</button>`
  ).join('');
  document.getElementById('emojiModal').style.display = 'flex';
  document.getElementById('emojiModalCats').innerHTML = catHtml;
  switchModalEmojiCat(0);
}

function closeEmojiModal() {
  document.getElementById('emojiModal').style.display = 'none';
  _pickerTargetField = null;
}

function switchModalEmojiCat(idx) {
  EMOJI_CATS.forEach((_,i) => {
    const b = document.getElementById('mpcat_'+i);
    if (b) b.classList.toggle('active', i===idx);
  });
  const grid = document.getElementById('emojiModalGrid');
  if (!grid) return;
  grid.innerHTML = EMOJI_CATS[idx].emojis.map(e =>
    `<div onclick="selectModalEmoji('${e}')" style="font-size:1.4rem;cursor:pointer;padding:5px;border-radius:4px;text-align:center;transition:background 0.1s" onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background=''">${e}</div>`
  ).join('');
}

function selectModalEmoji(e) {
  if (_pickerTargetField === 'new') {
    document.getElementById('customSecEmoji').value = e;
  } else if (_pickerTargetField !== null) {
    document.getElementById('csEmoji_'+_pickerTargetField).value = e;
    customSections[_pickerTargetField].emoji = e;
    saveAll();
    renderSymbols();
  }
  closeEmojiModal();
}

function addCustomSection() {
  const name = document.getElementById('customSecName').value.trim();
  const emoji = document.getElementById('customSecEmoji').value.trim() || '📌';
  if (!name) return;
  const si = customSections.length;
  customSections.push({name, emoji, items:[]});
  // Add to section order
  const order = getSectionOrder().slice();
  customSections.forEach((_,i) => { const k='custom_'+i; if (!order.includes(k)) order.push(k); });
  sectionOrder = order;
  saveAll();
  document.getElementById('customSecName').value = '';
  document.getElementById('customSecEmoji').value = '';
  renderSymbols();
}

function recycleCustomSection(si) {
  const sec = customSections[si];
  recycledSections.push({...sec, deletedAt: new Date().toISOString()});
  customSections.splice(si, 1);
  // Rebuild order — remap custom_N keys
  const order = getSectionOrder().filter(k => k !== 'custom_'+si).map(k => {
    if (typeof k === 'string' && k.startsWith('custom_')) {
      const n = parseInt(k.split('_')[1]);
      return n > si ? 'custom_'+(n-1) : k;
    }
    return k;
  });
  sectionOrder = order;
  saveAll();
  renderSymbols();
  renderRecycleBin();
}

function addCustomItem(si) {
  const val = document.getElementById('csitem_'+si).value.trim();
  if (!val) return;
  customSections[si].items = customSections[si].items || [];
  // Support "text | label" format
  const parts = val.split('|');
  customSections[si].items.push({text: parts[0].trim(), label: parts[1]?.trim() || ''});
  saveAll();
  renderSymbols();
}

function deleteCustomItem(si,ii) {
  customSections[si].items.splice(ii,1);
  saveAll();
  renderSymbols();
}

// ══════════════════════════════════════════════════════════
// RECYCLE BIN
// ══════════════════════════════════════════════════════════
function renderRecycleBin() {
  const el = document.getElementById('recycleBinContent');
  if (!el) return;
  if (!recycledSections.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text2)">
      <div style="font-size:2rem;margin-bottom:12px">🗑️</div>
      <div style="font-size:0.95rem;font-weight:600;margin-bottom:8px;color:var(--text)">Nothing here yet</div>
      <div style="font-size:0.82rem;line-height:1.6">When you remove a custom section using the ✕ button on its header,<br>it moves here instead of being permanently deleted.<br>You can restore it or permanently delete it from here.</div>
    </div>`;
    return;
  }
  el.innerHTML = recycledSections.map((sec,i) => `
    <div class="card" style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:1.5rem">${sec.emoji||'📌'}</div>
        <div style="flex:1">
          <div style="font-weight:600;color:var(--text)">${sec.name}</div>
          <div style="font-size:0.78rem;color:var(--text2)">${sec.items?.length||0} item(s) · Deleted ${new Date(sec.deletedAt).toLocaleDateString('en-GB')}</div>
        </div>
        <button class="btn" style="font-size:0.78rem" onclick="restoreSection(${i})">↩️ Restore</button>
        <button class="btn danger" style="font-size:0.78rem" onclick="permanentDeleteSection(${i})">🗑️ Delete</button>
      </div>
    </div>`).join('');
}

function restoreSection(i) {
  const sec = recycledSections.splice(i,1)[0];
  delete sec.deletedAt;
  customSections.push(sec);
  const order = getSectionOrder().slice();
  const k = 'custom_'+(customSections.length-1);
  if (!order.includes(k)) order.push(k);
  sectionOrder = order;
  saveAll();
  renderSymbols();
  renderRecycleBin();
}

function permanentDeleteSection(i) {
  recycledSections.splice(i,1);
  saveAll();
  renderRecycleBin();
}

// ══════════════════════════════════════════════════════════
// CABLE DESCRIPTOR GENERATOR
// ══════════════════════════════════════════════════════════
const CABLE_CSAS = ['0.5','0.75','1.0','1.5','2.5','4','6','10','16','25','35','50','70','95','120','150','185','240','300'];

const CABLE_POWER_CORES = ['1C','2C','3C','3G','4C','5C','7C','12C','19C','27C','37C'];

// Screen codes by type
const SCREEN_CODES = {
  'RFOU':   'P1/P8',
  'BFOU':   'P5/P12',
  'RFOU(i)':'S1/S5',
  'BFOU(i)':'S3/S7',
  'RFOU(c)':'S2/S6',
  'BFOU(c)':'S4/S8',
};

function isScreenedType(t) { return t==='RFOU(i)'||t==='BFOU(i)'||t==='RFOU(c)'||t==='BFOU(c)'; }
function isPowerType(t)    { return t==='RFOU'||t==='BFOU'; }
function isUXEarth(t)      { return t==='UX Earth'; }

function updateCgenUI() {
  const type = document.getElementById('cgen_type').value;
  const elBox  = document.getElementById('cgen_elements_box');
  const perBox = document.getElementById('cgen_perelement_box');
  const colBox = document.getElementById('cgen_colour_box');
  const unitLbl= document.getElementById('cgen_unit_label');

  if (isUXEarth(type)) {
    elBox.style.display  = 'none';
    perBox.style.display = 'none';
    colBox.style.display = 'none';
  } else if (isPowerType(type)) {
    elBox.style.display  = 'flex';
    perBox.style.display = 'none';
    colBox.style.display = 'none';
    // Populate cores
    const sel = document.getElementById('cgen_elements');
    sel.innerHTML = CABLE_POWER_CORES.map(c=>`<option value="${c}">${c}</option>`).join('');
    if (unitLbl) unitLbl.textContent = 'Cores';
  } else {
    // Screened — pairs/triples
    elBox.style.display  = 'flex';
    perBox.style.display = 'flex';
    colBox.style.display = 'flex';
    const sel = document.getElementById('cgen_elements');
    sel.innerHTML = [1,2,3,4,6,8,12,16,24].map(n=>`<option value="${n}">${n}</option>`).join('');
    if (unitLbl) unitLbl.textContent = 'Count';
    const perSel = document.getElementById('cgen_perelement');
    perSel.innerHTML = [
      '<option value="pr">Pair (2)</option>',
      '<option value="tr">Triple (3)</option>'
    ].join('');
  }
  genCableDesc();
}

function genCableDesc() {
  const type   = document.getElementById('cgen_type')?.value;
  const csa    = document.getElementById('cgen_csa')?.value;
  const colour = document.getElementById('cgen_colour')?.value || '';
  const extra  = document.getElementById('cgen_extra')?.value.trim() || '';
  const out    = document.getElementById('cgenOutput');
  if (!out) return;

  let variants = [];

  if (isUXEarth(type)) {
    const base = `1C ${csa}mm² UX P15 EARTH (GN/YL)`;
    const extra2 = extra ? ` ${extra}` : '';
    variants = [{ fmt:'Standard', val: base+extra2 }];
  } else if (isPowerType(type)) {
    const cores = document.getElementById('cgen_elements')?.value || '3C';
    const sc = SCREEN_CODES[type] || '';
    const extra2 = extra ? ` ${extra}` : '';
    const base = `${cores} ${csa}mm² ${type} ${sc}${extra2}`;
    variants = [{ fmt:'Standard', val: base }];
  } else {
    // Screened
    const count = parseInt(document.getElementById('cgen_elements')?.value) || 1;
    const unit  = document.getElementById('cgen_perelement')?.value || 'pr';
    const col   = colour ? ` (${colour.toUpperCase()})` : '';
    const sc    = SCREEN_CODES[type] || '';
    const extra2= extra ? ` ${extra}` : '';

    const isPair = unit === 'pr';
    const longUnit  = isPair ? 'PAIR' : 'TRIPLE';
    const shortUnit = isPair ? 'pr'   : 'tr';
    const numCores  = isPair ? 2      : 3;

    variants = [
      { fmt:`${count}${shortUnit} format`,           val:`${count}${shortUnit} ${csa}mm² ${type} ${sc}${col}${extra2}` },
      { fmt:`${count} ${longUnit} format`,            val:`${count} ${longUnit} ${csa}mm² ${type} ${sc}${col}${extra2}` },
      { fmt:`${count}x${numCores} format`,            val:`${count}x${numCores} ${csa}mm² ${type} ${sc}${col}${extra2}` },
    ];
  }

  if (variants.length === 1) {
    out.innerHTML = makeCopyBox(variants[0].val, 'Cable description:');
  } else {
    out.innerHTML = variants.map(v =>
      `<div style="margin-bottom:8px">${makeCopyBox(v.val, v.fmt+':')}</div>`
    ).join('');
  }
}

// ══════════════════════════════════════════════════════════
// GLAND PART NUMBER GENERATOR
// ══════════════════════════════════════════════════════════
function updateGgenSizes() {
  const type = document.getElementById('ggen_type').value;
  const sel  = document.getElementById('ggen_size');
  const prev = sel.value;
  sel.innerHTML = '';
  const gsrc = type==='421' ? GLAND_421 : type==='453' ? GLAND_453 : GLAND_653;
  gsrc.forEach(g => sel.add(new Option(g.size, g.size)));
  // Restore previous or default to first option
  if (prev && [...sel.options].find(o => o.value===prev)) sel.value = prev;
  else if (sel.options.length > 0) sel.value = sel.options[0].value;
  updateGgenEntries();
}

function updateGgenEntries() {
  const type  = document.getElementById('ggen_type').value;
  const size  = document.getElementById('ggen_size').value;
  const eType = document.getElementById('ggen_entrytype').value;
  const sel   = document.getElementById('ggen_entry');
  const prev  = sel.value;
  sel.innerHTML = '';
  const gsrc2 = type==='421' ? GLAND_421 : type==='453' ? GLAND_453 : GLAND_653;
  const g = gsrc2.find(x => x.size===size);
  if (!g) return;
  if (eType === 'metric') {
    (g.metric||'').split('/').map(m => m.trim()).filter(Boolean).forEach(m => sel.add(new Option(m,m)));
  } else {
    (g.npt||'').split(' or ').map(n => n.trim()).filter(n => n && n!=='-').forEach(n => sel.add(new Option(n,n)));
  }
  if (prev && [...sel.options].find(o => o.value===prev)) sel.value = prev;
  else if (sel.options.length > 0) sel.value = sel.options[0].value;
  genGlandCode();
}

function genGlandCode() {
  const type    = document.getElementById('ggen_type').value;
  const size    = document.getElementById('ggen_size').value;
  const entry   = document.getElementById('ggen_entry').value;
  const eType   = document.getElementById('ggen_entrytype').value;
  if (!size || !entry) return;

  // Collect selected suffixes
  const suffixChecks = document.querySelectorAll('.ggen-suffix-check:checked');
  const suffix = [...suffixChecks].map(c=>c.value).join('/');
  const suffixStr = suffix ? '/'+suffix : '';

  let entryCode = '';
  if (eType === 'npt') {
    // e.g. ¾" → 34NP, 1" → 1NP, ½" → 12NP
    entryCode = entry.replace(/"/g,'').replace(/\//g,'') + 'NP';
  } else {
    // metric: for 453 use dash e.g. M16-M20, for others as-is
    entryCode = type==='453' ? entry.replace('/','-') : entry;
  }

  let code = '';
  if      (type==='453') code = `501/453/UNIV/${size}/${entryCode}${suffixStr}`;
  else if (type==='653') code = `ICG/653/UNIV/${size}/${entryCode}${suffixStr}`;
  else                   code = `501/421/UNIV/${size}/${entryCode}${suffixStr}`;

  document.getElementById('ggenOutput').innerHTML = makeCopyBox(code, 'Gland part number:');
}

// ── Document Number Generator (unchanged) ──
function initDocSearch() { renderDocCatButtons(); }

function renderDocCatButtons() {
  const cats = [...new Set(DOC_REGISTER.map(d => d.cat))].sort();
  const el = document.getElementById('docCatButtons');
  if (!el) return;
  el.innerHTML = cats.map(cat => {
    const first = DOC_REGISTER.find(d => d.cat===cat);
    return `<button class="btn" data-cat="${cat}" onclick="selectDocCat('${cat}')">${cat} — ${first ? first.catName : ''}</button>`;
  }).join('');
}

function selectDocCat(cat) {
  document.querySelectorAll('#docCatButtons .btn').forEach(b => b.classList.toggle('active', b.dataset.cat===cat));
  const codes = DOC_REGISTER.filter(d => d.cat===cat);
  const sel = document.getElementById('docCodeSelect');
  sel.innerHTML = '<option value="">— select code —</option>';
  codes.forEach(d => sel.add(new Option(`${d.code} — ${d.desc}`, d.code)));
  sel.style.display = 'block';
  document.getElementById('docDesc').value = '';
  genDocNumber();
}

function onDocCodeSelect() {
  const code = document.getElementById('docCodeSelect').value;
  if (!code) return;
  const rec = DOC_REGISTER.find(d => d.code===code);
  if (rec) document.getElementById('docDesc').value = rec.desc;
  genDocNumber();
}

function genDocNumber() {
  const project = document.getElementById('docProject').value.trim();
  const code    = document.getElementById('docCodeSelect')?.value || '';
  const seq     = String(parseInt(document.getElementById('docSeq').value)||1).padStart(4,'0');
  const sheet   = String(parseInt(document.getElementById('docSheet').value)||1).padStart(2,'0');
  const rev     = (document.getElementById('docRev').value.trim()||'01').padStart(2,'0');
  const desc    = document.getElementById('docDesc').value.trim();
  const out     = document.getElementById('docNumOutput');
  if (!code) { out.innerHTML = '<span style="color:var(--text2);font-size:0.82rem">Select a category and code above first</span>'; return; }
  let num = '';
  if (project) num += project + '-';
  num += `${code}-${seq}-${sheet}-${rev}`;
  const full = desc ? `${num} (${desc})` : num;
  out.innerHTML = makeCopyBox(full, 'Full reference:') + makeCopyBox(num, 'Number only:');
}
