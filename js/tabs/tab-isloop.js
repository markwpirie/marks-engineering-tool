// ══════════════════════════════════════════════════════════
// IS LOOP CALCULATION — Entity parameter check (IEC 60079-25)
// Standard MTL-style barrier/isolator vs field instrument vs cable
// comparison. Internal base units: capacitance in nF, inductance in µH —
// all per-field unit selects normalise to these before comparing.
// ══════════════════════════════════════════════════════════

const IS_STATIC_KEYS = [
  'proj_tag','proj_desc','proj_num','proj_doc','proj_rev','proj_date','proj_by',
  'bar_preset','bar_mfr','bar_model','bar_cert','bar_note','bar_uo','bar_io','bar_po',
  'bar_co','bar_co_unit','bar_lo','bar_lo_unit','bar_loro',
  'inst_preset','inst_tag','inst_mfr','inst_model','inst_cert','inst_simple',
  'inst_ui','inst_ii','inst_pi','inst_ci','inst_ci_unit','inst_li','inst_li_unit',
];

function isSaveField(k) {
  const el = document.getElementById('is_' + k);
  if (!el) return;
  const val = el.type === 'checkbox' ? (el.checked ? '1' : '') : el.value;
  localStorage.setItem('met_is_' + k, val);
}

function isLoadFields() {
  IS_STATIC_KEYS.forEach(k => {
    const el = document.getElementById('is_' + k);
    if (!el) return;
    const saved = localStorage.getItem('met_is_' + k);
    if (saved === null) return;
    if (el.type === 'checkbox') el.checked = saved === '1';
    else el.value = saved;
  });
  const dateEl = document.getElementById('is_proj_date');
  if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);
  const revEl = document.getElementById('is_proj_rev');
  if (revEl && !revEl.value) revEl.value = '01';
}

// ── Barrier / Instrument presets (data-is.js) ───────────────
// Autofills the entity-parameter fields from a known barrier/instrument so a repeated
// device doesn't have to be retyped every loop. Values are transcribed from a previous
// project's IS loop register — always re-verify against the equipment's current
// certificate before relying on this for a new project.
function isPresetOptionsHtml(presets, labelFn) {
  return '<option value="">— Select to autofill, or enter manually —</option>' +
    presets.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(labelFn(p))}</option>`).join('');
}

function renderIsPresets() {
  const barSel = document.getElementById('is_bar_preset');
  if (barSel) {
    barSel.innerHTML = isPresetOptionsHtml(IS_BARRIER_PRESETS,
      p => `${p.mfr} ${p.model} — ${p.uo}V / ${p.io}mA / ${p.po}W / ${p.co}${p.coUnit === 'uF' ? 'µF' : p.coUnit} / ${p.lo}${p.loUnit}`);
  }
  const instSel = document.getElementById('is_inst_preset');
  if (instSel) {
    instSel.innerHTML = isPresetOptionsHtml(IS_INSTRUMENT_PRESETS,
      p => `${p.mfr} ${p.model}${p.desc ? ' — ' + p.desc : ''}`);
  }
}

// Sets a field's value and persists it, without needing an existing element reference.
// `null` means the source certificate stated no limit for that parameter — leave the field
// blank rather than writing the literal string "null" or fabricating a number.
function isSetField(field, val) {
  const el = document.getElementById('is_' + field);
  if (!el) return;
  el.value = (val === null || val === undefined) ? '' : val;
  isSaveField(field);
}

function isApplyBarrierPreset() {
  isSaveField('bar_preset');
  const p = IS_BARRIER_PRESETS.find(x => x.id === document.getElementById('is_bar_preset')?.value);
  if (!p) return;
  isSetField('bar_mfr', p.mfr);
  isSetField('bar_model', p.model);
  isSetField('bar_cert', p.cert);
  isSetField('bar_uo', p.uo);
  isSetField('bar_io', p.io);
  isSetField('bar_po', p.po);
  isSetField('bar_co', p.co);
  isSetField('bar_co_unit', p.coUnit);
  isSetField('bar_lo', p.lo);
  isSetField('bar_lo_unit', p.loUnit);
  isCalc();
}

function isApplyInstrumentPreset() {
  isSaveField('inst_preset');
  const p = IS_INSTRUMENT_PRESETS.find(x => x.id === document.getElementById('is_inst_preset')?.value);
  if (!p) return;
  // Tag is loop-specific, not part of the device preset — left untouched.
  isSetField('inst_mfr', p.mfr);
  isSetField('inst_model', p.model);
  isSetField('inst_cert', p.cert);
  isSetField('inst_ui', p.ui);
  isSetField('inst_ii', p.ii);
  isSetField('inst_pi', p.pi);
  isSetField('inst_ci', p.ci);
  isSetField('inst_ci_unit', p.ciUnit);
  isSetField('inst_li', p.li);
  isSetField('inst_li_unit', p.liUnit);
  isCalc();
  // Ui/Ii left blank means the source certificate stated no limit — the comparison can't
  // proceed until that's consciously resolved (a blank field elsewhere usually just means
  // "not filled in yet", so the calc deliberately won't guess which case this is).
  if (p.note) alert(p.note);
}

function isGetProj() {
  const g = k => document.getElementById('is_proj_' + k)?.value?.trim() || '';
  return { tag: g('tag'), desc: g('desc'), num: g('num'), doc: g('doc'), rev: g('rev'), date: g('date'), by: g('by') };
}

// ── Unit conversion — internal base: capacitance nF, inductance µH ──
function isToNF(val, unit) {
  if (unit === 'pF') return val * 0.001;
  if (unit === 'uF') return val * 1000;
  return val; // nF
}
function isToUH(val, unit) {
  if (unit === 'mH') return val * 1000;
  return val; // uH
}

// ── Cable segment type options — built from INSTR_ELECTRICAL (data-cable.js) ──
const IS_CABLE_TYPES = (() => {
  const opts = [];
  ['shielded', 'unshielded'].forEach(kind => {
    Object.keys(INSTR_ELECTRICAL[kind]).forEach(csa => {
      const e = INSTR_ELECTRICAL[kind][csa];
      opts.push({
        id: `${kind}_${csa}`,
        label: `${kind === 'shielded' ? 'Shielded' : 'Unshielded'} ${csa} mm²`,
        cap: e.cap, ind: e.ind, r: e.r, lr: e.lr,
      });
    });
  });
  [['shieldedSpecial', 'Shielded'], ['unshieldedSpecial', 'Unshielded']].forEach(([kind, label]) => {
    Object.keys(INSTR_ELECTRICAL[kind]).forEach(key => {
      const e = INSTR_ELECTRICAL[kind][key];
      const parts = key.split('-');
      const csa = parts[parts.length - 1];
      const unitType = parts[parts.length - 2] === 'TR' ? 'triples' : 'pairs';
      const countRange = parts.slice(0, parts.length - 2).join('-');
      opts.push({
        id: `${kind}_${key}`,
        label: `${label} ${csa} mm² — ${countRange} ${unitType} (large fill)`,
        cap: e.cap, ind: e.ind, r: e.r, lr: e.lr,
      });
    });
  });
  opts.push({ id: 'manual', label: 'Manual entry', cap: null, ind: null, r: null, lr: null });
  return opts;
})();

function isCableTypeOptionsHtml() {
  return IS_CABLE_TYPES.map(o => `<option value="${o.id}">${o.label}</option>`).join('');
}

function isCableSegmentHtml(n) {
  return `<div class="is-cable-seg" style="border-top:1px solid var(--border);padding-top:12px;margin-top:12px">
    <div style="font-size:0.78rem;font-weight:600;color:var(--text2);margin-bottom:8px">Segment ${n}</div>
    <div class="flex-row" style="flex-wrap:wrap;gap:10px;align-items:flex-end">
      <div class="field" style="flex:2;min-width:220px"><label>Cable Type</label>
        <select id="is_cab${n}_type" onchange="isCableTypeChange(${n})">${isCableTypeOptionsHtml()}</select>
      </div>
      <div class="field" style="flex:1;min-width:90px"><label>Length (m)</label>
        <input type="number" id="is_cab${n}_len" step="any" min="0" oninput="isSaveField('cab${n}_len');isCalc()">
      </div>
      <div class="field" style="flex:1;min-width:100px"><label>Cap (nF/km)</label>
        <input type="number" id="is_cab${n}_cap" step="any" oninput="isSaveField('cab${n}_cap');isCalc()">
      </div>
      <div class="field" style="flex:1;min-width:100px"><label>Ind (mH/km)</label>
        <input type="number" id="is_cab${n}_ind" step="any" oninput="isSaveField('cab${n}_ind');isCalc()">
      </div>
      <div class="field" style="flex:1;min-width:90px"><label>R (Ω/km)</label>
        <input type="number" id="is_cab${n}_r" step="any" oninput="isSaveField('cab${n}_r');isCalc()">
      </div>
      <div class="field" style="flex:1;min-width:100px"><label>L/R (µH/Ω) <span style="font-size:0.7rem;color:var(--text3)">opt.</span></label>
        <input type="number" id="is_cab${n}_lr" step="any" oninput="isSaveField('cab${n}_lr');isCalc()">
      </div>
    </div>
    <div id="is_cab${n}_totals" style="margin-top:6px;font-size:0.78rem;color:var(--text2)"></div>
  </div>`;
}

function renderCableSegments() {
  const el = document.getElementById('isCableSegments');
  if (!el) return;
  el.innerHTML = [1, 2, 3].map(isCableSegmentHtml).join('');
  [1, 2, 3].forEach(isLoadCableSegment);
}

// Fills/locks the per-km fields from IS_CABLE_TYPES, or unlocks them for manual entry.
function applyCableTypeValues(n, typeId) {
  const opt = IS_CABLE_TYPES.find(o => o.id === typeId);
  const capEl = document.getElementById(`is_cab${n}_cap`);
  const indEl = document.getElementById(`is_cab${n}_ind`);
  const rEl   = document.getElementById(`is_cab${n}_r`);
  const lrEl  = document.getElementById(`is_cab${n}_lr`);
  const manual = !opt || opt.id === 'manual';
  [capEl, indEl, rEl, lrEl].forEach(el => { if (el) el.readOnly = !manual; });
  if (!manual) {
    capEl.value = opt.cap;
    indEl.value = opt.ind;
    rEl.value = opt.r;
    lrEl.value = opt.lr;
    ['cap', 'ind', 'r', 'lr'].forEach(f => isSaveField(`cab${n}_${f}`));
  }
}

function isCableTypeChange(n) {
  isSaveField(`cab${n}_type`);
  applyCableTypeValues(n, document.getElementById(`is_cab${n}_type`)?.value);
  isCalc();
}

function isLoadCableSegment(n) {
  const savedType = localStorage.getItem(`met_is_cab${n}_type`) || 'manual';
  const typeSel = document.getElementById(`is_cab${n}_type`);
  if (typeSel) typeSel.value = savedType;
  ['len', 'cap', 'ind', 'r', 'lr'].forEach(f => {
    const el = document.getElementById(`is_cab${n}_${f}`);
    if (!el) return;
    const saved = localStorage.getItem(`met_is_cab${n}_${f}`);
    if (saved !== null) el.value = saved;
  });
  applyCableTypeValues(n, savedType);
}

// ── Calculation ──────────────────────────────────────────────
function isBadge(pass) {
  return pass
    ? `<span class="badge pass"><svg><use href="#i-check"/></svg>Pass</span>`
    : `<span class="badge fail"><svg><use href="#i-x"/></svg>Fail</span>`;
}

function isCalc() {
  const out = document.getElementById('isResult');
  if (!out) return;

  const num = id => parseFloat(document.getElementById(id)?.value);

  const uo = num('is_bar_uo'), io = num('is_bar_io'), po = num('is_bar_po');
  const coRaw = num('is_bar_co'), coUnit = document.getElementById('is_bar_co_unit')?.value || 'nF';
  const loRaw = num('is_bar_lo'), loUnit = document.getElementById('is_bar_lo_unit')?.value || 'mH';
  const loRo = num('is_bar_loro');

  const simple = !!document.getElementById('is_inst_simple')?.checked;
  const ui = num('is_inst_ui'), ii = num('is_inst_ii'), pi = num('is_inst_pi');
  const ciRaw = num('is_inst_ci'), ciUnit = document.getElementById('is_inst_ci_unit')?.value || 'nF';
  const liRaw = num('is_inst_li'), liUnit = document.getElementById('is_inst_li_unit')?.value || 'uH';

  const vipRow = document.getElementById('is_inst_vip_row');
  if (vipRow) vipRow.style.opacity = simple ? '0.5' : '1';

  const haveBarrier = ![uo, io, po, coRaw, loRaw].some(isNaN);
  const haveInstCL = ![ciRaw, liRaw].some(isNaN);
  const haveInstVIP = simple || ![ui, ii, pi].some(isNaN);

  if (!haveBarrier || !haveInstCL || !haveInstVIP) {
    out.innerHTML = `<p style="color:var(--text2);padding:12px 0">Enter the barrier entity parameters (Uo/Io/Po/Co/Lo) and field instrument parameters (Ci/Li, plus Ui/Ii/Pi unless "Simple apparatus" is ticked) above to see the comparison.</p>`;
    window._isData = null;
    return;
  }

  const co = isToNF(coRaw, coUnit);
  const lo = isToUH(loRaw, loUnit);
  const ci = isToNF(ciRaw, ciUnit);
  const li = isToUH(liRaw, liUnit);

  document.getElementById('is_bar_co_norm').textContent = `= ${co.toFixed(3)} nF`;
  document.getElementById('is_bar_lo_norm').textContent = `= ${lo.toFixed(1)} µH`;
  document.getElementById('is_inst_ci_norm').textContent = `= ${ci.toFixed(3)} nF`;
  document.getElementById('is_inst_li_norm').textContent = `= ${li.toFixed(1)} µH`;

  const segs = [1, 2, 3].map(n => {
    const len = num(`is_cab${n}_len`) || 0;
    const cap = num(`is_cab${n}_cap`) || 0; // nF/km
    const ind = num(`is_cab${n}_ind`) || 0; // mH/km
    const r   = num(`is_cab${n}_r`)   || 0; // Ω/km
    const lrRaw = num(`is_cab${n}_lr`);
    const km = len / 1000;
    return {
      n, len,
      c: km * cap,
      l: km * ind * 1000, // mH/km × km = mH; ×1000 = µH
      r: km * r,
      lr: isNaN(lrRaw) ? null : lrRaw,
      active: len > 0,
    };
  });

  segs.forEach(s => {
    const el = document.getElementById(`is_cab${s.n}_totals`);
    if (el) el.textContent = s.active ? `Segment total — C ${s.c.toFixed(3)} nF · L ${s.l.toFixed(1)} µH · R ${s.r.toFixed(2)} Ω` : '';
  });

  const totalC = segs.reduce((s, x) => s + x.c, 0);
  const totalL = segs.reduce((s, x) => s + x.l, 0);
  const totalR = segs.reduce((s, x) => s + x.r, 0);

  const effUi = simple ? Infinity : ui;
  const effIi = simple ? Infinity : ii;
  const effPi = simple ? Infinity : pi;

  const checkV = uo <= effUi;
  const checkI = io <= effIi;
  const checkP = po <= effPi;
  const ciTotal = ci + totalC;
  const liTotal = li + totalL;
  const checkC = ciTotal <= co;
  const checkL = liTotal <= lo;

  let lr = null;
  if (!checkL && !isNaN(loRo)) {
    const activeSegs = segs.filter(s => s.active);
    const segsWithLR = activeSegs.filter(s => s.lr != null);
    const applicable = activeSegs.length > 0 && segsWithLR.length === activeSegs.length;
    lr = { applicable, pass: applicable && activeSegs.every(s => s.lr <= loRo), loRo };
  }

  const inductanceOk = checkL || (lr && lr.applicable && lr.pass);
  const overallPass = checkV && checkI && checkP && checkC && inductanceOk;

  const model = {
    proj: isGetProj(),
    barrier: {
      mfr: document.getElementById('is_bar_mfr')?.value.trim() || '',
      model: document.getElementById('is_bar_model')?.value.trim() || '',
      cert: document.getElementById('is_bar_cert')?.value.trim() || '',
      note: document.getElementById('is_bar_note')?.value.trim() || '',
      uo, io, po, co, lo, coRaw, coUnit, loRaw, loUnit, loRo: isNaN(loRo) ? null : loRo,
    },
    instrument: {
      tag: document.getElementById('is_inst_tag')?.value.trim() || '',
      mfr: document.getElementById('is_inst_mfr')?.value.trim() || '',
      model: document.getElementById('is_inst_model')?.value.trim() || '',
      cert: document.getElementById('is_inst_cert')?.value.trim() || '',
      simple, ui, ii, pi, ci, li, ciRaw, ciUnit, liRaw, liUnit,
    },
    segs, totalC, totalL, totalR,
    checkV, checkI, checkP, checkC, checkL, ciTotal, liTotal, lr,
    inductanceOk, overallPass,
  };
  window._isData = model;

  out.innerHTML = renderIsResult(model);
}

function isSpecRow(label, lhs, rhs, pass, full) {
  return `<div${full ? ' class="full"' : ''}><div class="k">${label}</div><div class="v">${lhs} ${pass ? '≤' : '>'} ${rhs} &nbsp; ${isBadge(pass)}</div></div>`;
}

function renderIsResult(m) {
  const b = m.barrier, i = m.instrument;

  const lrRow = m.lr
    ? `<div class="full"><div class="k">L/R Alternative <span style="font-weight:400;text-transform:none;letter-spacing:normal">(inductance failed — checking cable L/R vs Lo/Ro ${b.loRo} µH/Ω)</span></div><div class="v">${m.lr.applicable ? isBadge(m.lr.pass) : '<span class="badge mut">Not all active segments have an L/R value entered</span>'}</div></div>`
    : '';

  return `
    <div class="spec">
      ${isSpecRow('Voltage — Uo ≤ Ui', b.uo + ' V', i.simple ? 'Ui (simple apparatus — n/a)' : i.ui + ' V', m.checkV)}
      ${isSpecRow('Current — Io ≤ Ii', b.io + ' mA', i.simple ? 'Ii (simple apparatus — n/a)' : i.ii + ' mA', m.checkI)}
      ${isSpecRow('Power — Po ≤ Pi', b.po + ' W', i.simple ? 'Pi (simple apparatus — n/a)' : i.pi + ' W', m.checkP)}
      ${isSpecRow('Capacitance — Ci + ΣC(cable) ≤ Co', m.ciTotal.toFixed(3) + ' nF', b.co.toFixed(3) + ' nF', m.checkC)}
      ${isSpecRow('Inductance — Li + ΣL(cable) ≤ Lo', m.liTotal.toFixed(1) + ' µH', b.lo.toFixed(1) + ' µH', m.checkL)}
      ${lrRow}
      <div class="full"><div class="k">Total Cable Resistance <span style="font-weight:400;text-transform:none;letter-spacing:normal">(informative)</span></div><div class="v">${m.totalR.toFixed(2)} Ω</div></div>
    </div>

    <div style="margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span class="badge ${m.overallPass ? 'pass' : 'fail'}" style="font-size:0.85rem;padding:6px 14px">
        <svg><use href="#i-${m.overallPass ? 'check' : 'x'}"/></svg>${m.overallPass ? 'LOOP OK' : 'DOES NOT COMPLY'}
      </span>
      <button class="btn primary" style="font-size:0.8rem" onclick="isGeneratePDF()">Generate PDF</button>
    </div>

    <div class="notice" style="margin-top:16px">
      <svg><use href="#i-warn"/></svg>
      <span>For two-channel barriers the combined voltage, current and power must be calculated — refer to the barrier manufacturer if required.</span>
    </div>
    <div class="notice" style="margin-top:10px">
      <svg><use href="#i-warn"/></svg>
      <span>This calculation is indicative only. IS loop approval requires verification by a competent person against the actual equipment certificates before installation or certification.</span>
    </div>`;
}

// ── PDF Generator ────────────────────────────────────────────
function isGeneratePDF() {
  const m = window._isData;
  if (!m) { alert('Enter the loop details above first.'); return; }
  const p = m.proj, b = m.barrier, i = m.instrument;
  const dateStr = p.date || new Date().toISOString().slice(0, 10);

  const segRows = m.segs.filter(s => s.active).map(s => `
    <tr>
      <td>Segment ${s.n}</td><td>${s.len} m</td>
      <td>${s.c.toFixed(3)} nF</td><td>${s.l.toFixed(1)} µH</td><td>${s.r.toFixed(2)} Ω</td>
      <td>${s.lr != null ? s.lr + ' µH/Ω' : '—'}</td>
    </tr>`).join('') || `<tr><td colspan="6" style="color:#94a3b8">No cable segments entered (all lengths zero)</td></tr>`;

  const entityRows = [
    ['Voltage', `${b.uo} V`, i.simple ? 'n/a (simple apparatus)' : `${i.ui} V`, m.checkV],
    ['Current', `${b.io} mA`, i.simple ? 'n/a (simple apparatus)' : `${i.ii} mA`, m.checkI],
    ['Power', `${b.po} W`, i.simple ? 'n/a (simple apparatus)' : `${i.pi} W`, m.checkP],
    ['Capacitance', `${b.co.toFixed(3)} nF`, `${m.ciTotal.toFixed(3)} nF`, m.checkC],
    ['Inductance', `${b.lo.toFixed(1)} µH`, `${m.liTotal.toFixed(1)} µH`, m.checkL],
  ].map(([label, src, load, pass]) => `
    <tr><td>${label}</td><td>${src}</td><td>${load}</td><td><span class="pdf-badge ${pass ? 'pdf-badge-pass' : 'pdf-badge-fail'}">${pass ? 'OK' : 'Exceeds'}</span></td></tr>`).join('');

  const lrRow = m.lr ? `
    <tr><td>L/R Alternative</td><td>Lo/Ro ${b.loRo} µH/Ω</td><td>${m.lr.applicable ? 'all segments checked' : 'incomplete segment L/R data'}</td>
      <td><span class="pdf-badge ${m.lr.applicable && m.lr.pass ? 'pdf-badge-pass' : 'pdf-badge-warn'}">${m.lr.applicable ? (m.lr.pass ? 'OK' : 'Exceeds') : 'N/A'}</span></td></tr>` : '';

  const bodyHtml = `
<div class="title-block">
  <table>
    <tr><td class="lbl">Loop Tag</td><td class="val" colspan="3">${p.tag || '—'}${p.desc ? ' — ' + p.desc : ''}</td></tr>
    <tr>
      <td class="lbl">Project No.</td><td class="val">${p.num || '—'}</td>
      <td class="lbl">Date</td><td class="val">${dateStr}</td>
    </tr>
    <tr>
      <td class="lbl">Document No.</td><td class="val">${p.doc || '—'}</td>
      <td class="lbl">Revision</td><td class="val">${p.rev || '01'}</td>
    </tr>
    <tr>
      <td class="lbl">Prepared By</td><td class="val" colspan="3">${p.by || '—'}</td>
    </tr>
  </table>
</div>

<div class="sec">1 — Barrier / Isolator (Source)</div>
<div class="data-grid">
  <div class="data-item"><div class="k">Manufacturer</div><div class="v">${b.mfr || '—'}</div></div>
  <div class="data-item"><div class="k">Model</div><div class="v">${b.model || '—'}</div></div>
  <div class="data-item full"><div class="k">Certificate Number</div><div class="v">${b.cert || '—'}</div></div>
  ${b.note ? `<div class="data-item full"><div class="k">Channel Config.</div><div class="v">${b.note}</div></div>` : ''}
  <div class="data-item"><div class="k">Uo</div><div class="v">${b.uo} V</div></div>
  <div class="data-item"><div class="k">Io</div><div class="v">${b.io} mA</div></div>
  <div class="data-item"><div class="k">Po</div><div class="v">${b.po} W</div></div>
  <div class="data-item"><div class="k">Co</div><div class="v">${b.coRaw} ${b.coUnit} <span style="color:#94a3b8">(${b.co.toFixed(3)} nF)</span></div></div>
  <div class="data-item"><div class="k">Lo</div><div class="v">${b.loRaw} ${b.loUnit} <span style="color:#94a3b8">(${b.lo.toFixed(1)} µH)</span></div></div>
  ${b.loRo != null ? `<div class="data-item"><div class="k">Lo/Ro</div><div class="v">${b.loRo} µH/Ω</div></div>` : ''}
</div>

<div class="sec">2 — Field Instrument (Load)</div>
<div class="data-grid">
  <div class="data-item"><div class="k">Tag</div><div class="v">${i.tag || '—'}</div></div>
  <div class="data-item"><div class="k">Manufacturer</div><div class="v">${i.mfr || '—'}</div></div>
  <div class="data-item"><div class="k">Model</div><div class="v">${i.model || '—'}</div></div>
  <div class="data-item"><div class="k">Certificate Number</div><div class="v">${i.cert || '—'}</div></div>
  <div class="data-item"><div class="k">Ui</div><div class="v">${i.simple ? 'Simple apparatus — n/a' : i.ui + ' V'}</div></div>
  <div class="data-item"><div class="k">Ii</div><div class="v">${i.simple ? 'Simple apparatus — n/a' : i.ii + ' mA'}</div></div>
  <div class="data-item"><div class="k">Pi</div><div class="v">${i.simple ? 'Simple apparatus — n/a' : i.pi + ' W'}</div></div>
  <div class="data-item"><div class="k">Ci</div><div class="v">${i.ciRaw} ${i.ciUnit} <span style="color:#94a3b8">(${i.ci.toFixed(3)} nF)</span></div></div>
  <div class="data-item"><div class="k">Li</div><div class="v">${i.liRaw} ${i.liUnit} <span style="color:#94a3b8">(${i.li.toFixed(1)} µH)</span></div></div>
</div>

<div class="sec">3 — Cable Segments</div>
<table class="cmp-table">
  <thead><tr><th>Segment</th><th>Length</th><th>C</th><th>L</th><th>R</th><th>L/R</th></tr></thead>
  <tbody>${segRows}</tbody>
</table>
<p style="font-size:7.5pt;color:#94a3b8;margin-bottom:6px">Total cable — C ${m.totalC.toFixed(3)} nF · L ${m.totalL.toFixed(1)} µH · R ${m.totalR.toFixed(2)} Ω</p>

<div class="sec">4 — Entity Comparison</div>
<table class="cmp-table">
  <thead><tr><th>Check</th><th>Source (Barrier)</th><th>Load (Instrument + Cable)</th><th>Verdict</th></tr></thead>
  <tbody>${entityRows}${lrRow}</tbody>
</table>

<div class="sec">5 — Overall Verdict</div>
<div class="order-box" style="${m.overallPass ? '' : 'background:rgba(179,63,49,0.07);border-color:rgba(179,63,49,0.35)'}">
  <div class="order-label" style="${m.overallPass ? '' : 'color:#B33F31'}">Verdict</div>
  <div class="order-code" style="${m.overallPass ? '' : 'color:#B33F31'}">${m.overallPass ? 'LOOP OK' : 'DOES NOT COMPLY'}</div>
</div>

<div class="pdf-notice">For two-channel barriers the combined voltage, current and power must be calculated — refer to the barrier manufacturer if required.</div>

<div class="disclaimer">
  <strong>Disclaimer:</strong> This calculation is indicative only. IS loop approval requires verification by a competent person against the actual equipment certificates before installation or certification. Cable electrical data per Draka/Prysmian NEK TS 606 datasheets where selected from the standard list; manually entered cable data must be verified against the source datasheet.
</div>

<div class="footer">
  <span>Generated by M.E.T. v${APP_VERSION}</span>
  <span>${p.tag ? 'Loop Tag: ' + p.tag + ' &nbsp;|&nbsp; ' : ''}${p.doc || ''}</span>
  <span>${dateStr}</span>
</div>`;

  const html = buildPdfDocument(`MET — IS Loop ${p.tag || 'Calculation'}`, APP_VERSION, bodyHtml);
  printHtmlDocument(html);
}

// ── INIT ──
function initIsLoop() {
  renderIsPresets();
  isLoadFields();
  renderCableSegments();
  isCalc();
}
