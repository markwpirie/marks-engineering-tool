// ══════════════════════════════════════════════════════════
// WONDER TOOL — Motor → Cable → Gland one-stop shop
// ══════════════════════════════════════════════════════════

const WT_DERATING_OPTS = [
  { val: 1.00, label: '1.00 — Single cable / no grouping' },
  { val: 0.90, label: '0.90 — 2 cables grouped' },
  { val: 0.85, label: '0.85 — 3 cables grouped (default)' },
  { val: 0.80, label: '0.80 — 4–6 cables grouped' },
  { val: 0.75, label: '0.75 — 7–9 cables grouped' },
  { val: 0.70, label: '0.70 — 10+ cables grouped' },
  { val: 0,    label: 'Manual…' },
];

function initWonderTool() {
  const iecOpts = IEC_KW.map(k =>
    `<option value="${k}"${k === 22 ? ' selected' : ''}>${k} kW</option>`
  ).join('') + '<option value="0">Manual…</option>';

  const voltOpts = VOLT_OPTS.map(([v, l]) =>
    `<option value="${v}"${v === '400' ? ' selected' : ''}>${l}</option>`
  ).join('');

  const deratingOpts = WT_DERATING_OPTS.map(o =>
    `<option value="${o.val}"${o.val === 0.85 ? ' selected' : ''}>${o.label}</option>`
  ).join('');

  document.getElementById('wt_kw_wrap').innerHTML = `
    <select id="wt_kw" onchange="wtKwChange()">${iecOpts}</select>
    <input type="number" id="wt_kw_manual" placeholder="Enter kW" style="margin-top:6px;display:none" oninput="wtCalc()">`;

  document.getElementById('wt_volt_wrap').innerHTML = `
    <select id="wt_volt" onchange="wtVoltChange()">${voltOpts}</select>
    <input type="number" id="wt_volt_manual" placeholder="Enter voltage (V)" style="margin-top:6px;display:none" oninput="wtCalc()">`;

  document.getElementById('wt_derating_wrap').innerHTML = `
    <select id="wt_derating" onchange="wtDeratingChange()">${deratingOpts}</select>
    <input type="number" id="wt_derating_manual" placeholder="e.g. 0.82" step="0.01" min="0.1" max="1" style="margin-top:6px;display:none" oninput="wtCalc()">`;

  wtCalc();
}

function wtKwChange() {
  const sel = document.getElementById('wt_kw');
  const man = document.getElementById('wt_kw_manual');
  if (sel && man) man.style.display = parseFloat(sel.value) === 0 ? 'block' : 'none';
  wtCalc();
}

function wtVoltChange() {
  const sel = document.getElementById('wt_volt');
  const man = document.getElementById('wt_volt_manual');
  if (sel && man) man.style.display = parseFloat(sel.value) === 0 ? 'block' : 'none';
  wtCalc();
}

function wtDeratingChange() {
  const sel = document.getElementById('wt_derating');
  const man = document.getElementById('wt_derating_manual');
  if (sel && man) man.style.display = parseFloat(sel.value) === 0 ? 'block' : 'none';
  wtCalc();
}

function wtCalc() {
  const result = document.getElementById('wt_result');
  if (!result) return;

  // ── Read inputs ──────────────────────────────────────────
  const kwSel   = parseFloat(document.getElementById('wt_kw')?.value);
  const kw      = kwSel === 0
    ? parseFloat(document.getElementById('wt_kw_manual')?.value)
    : kwSel;

  const voltSel = parseFloat(document.getElementById('wt_volt')?.value);
  const volt    = voltSel === 0
    ? parseFloat(document.getElementById('wt_volt_manual')?.value)
    : voltSel;

  const deratingSel = parseFloat(document.getElementById('wt_derating')?.value);
  const derating    = deratingSel === 0
    ? parseFloat(document.getElementById('wt_derating_manual')?.value)
    : deratingSel;

  const ie         = document.getElementById('wt_ie')?.value       || 'IE3';
  const cableType  = document.getElementById('wt_cabletype')?.value || 'RFOU';
  const cores      = parseInt(document.getElementById('wt_cores')?.value || 4);
  const glandPref  = document.getElementById('wt_glandtype')?.value || '453';
  const entryPref  = document.getElementById('wt_entry')?.value     || 'metric';

  if (isNaN(kw) || kw <= 0 || isNaN(volt) || volt <= 0 || isNaN(derating) || derating <= 0) {
    result.innerHTML = `<p style="color:var(--text2);padding:12px 0">Enter motor power and voltage above to get a recommendation.</p>`;
    return;
  }

  // ── Step 1: Motor FLA ────────────────────────────────────
  const { eff, pf } = flaLookup(kw, ie);
  const fla = (kw * 1000) / (Math.sqrt(3) * volt * pf * eff);

  // ── Step 2: Required cable rating ───────────────────────
  const required = fla / derating;

  // ── Step 3: Select cable ─────────────────────────────────
  const powerData = CABLE_DATA[cableType]?.Power;
  if (!powerData) {
    result.innerHTML = `<p style="color:var(--danger)">Cable type "${cableType}" not found.</p>`;
    return;
  }

  const candidates = powerData.entries
    .filter(e => e[0] === cores && e[4] >= required)
    .sort((a, b) => a[1] - b[1]);

  if (!candidates.length) {
    result.innerHTML = `
      <div class="wt-alert">
        <strong>No cable found.</strong> No ${cores}-core ${cableType} cable is rated for
        ${required.toFixed(1)} A (FLA ${fla.toFixed(1)} A ÷ ${derating} derating).
        Consider a multi-run arrangement or check the Cable &amp; Gland tab for manual selection.
      </div>`;
    return;
  }

  const [cCores, cCSA, cOD, , cRating] = candidates[0];

  // ── Step 4: Select gland ─────────────────────────────────
  let glandMatch = null;
  let glandName, glandTypeLabel;

  if (glandPref === '453') {
    glandName      = '501/453/UNIV';
    glandTypeLabel = 'Coldflow Armoured';
    glandMatch     = GLAND_453.find(g => cOD >= g.outerMin && cOD <= g.outerMax);
  } else if (glandPref === '653') {
    glandName      = 'ICG/653/UNIV';
    glandTypeLabel = 'Barrier';
    glandMatch     = GLAND_653.find(g => cOD >= g.outerMin && cOD <= g.outerMax);
  } else {
    glandName      = '501/421/UNIV';
    glandTypeLabel = 'Compression Non-Armoured';
    glandMatch     = GLAND_421.find(g => cOD >= g.stdMin && cOD <= g.stdMax);
  }

  const entryVal = entryPref === 'metric' ? glandMatch?.metric : glandMatch?.npt;
  const orderCode = glandMatch
    ? getGlandOrderCode(glandPref, glandMatch.size, entryPref, entryVal)
    : null;

  // ── Step 5: Build derating label ─────────────────────────
  const deratingLabel = WT_DERATING_OPTS.find(o => o.val === derating)?.label.split('—')[1]?.trim()
    || `${(derating * 100).toFixed(0)}% correction factor`;

  // ── Step 6: Render ───────────────────────────────────────
  const glandBlock = glandMatch ? `
    For a <strong>${glandTypeLabel} (Hawke ${glandName})</strong> gland, order code:
    <span class="wt-code">${orderCode}</span>
    (Size ${glandMatch.size}, ${entryPref === 'metric' ? glandMatch.metric : glandMatch.npt} entry, fits OD ${cOD} mm).`
  : `<span style="color:var(--danger)">No ${glandName} gland found for OD ${cOD} mm — check manually.</span>`;

  result.innerHTML = `
    <div class="wt-summary">
      <div class="wt-summary-header">⚡ Recommendation</div>
      <p class="wt-summary-text">
        For a <strong>${kw} kW</strong> motor on a <strong>${volt} V</strong> supply (${ie}),
        with a <strong>${(derating * 100).toFixed(0)}% grouping correction factor</strong>
        (${deratingLabel}), use a
        <strong>${cCores}-core ${cCSA} mm² ${cableType}</strong> cable.
        The motor FLA is <strong>${fla.toFixed(1)} A</strong> — the cable is rated
        <strong>${cRating} A</strong> (${(cRating * derating).toFixed(1)} A derated),
        which gives a <strong>${(((cRating * derating) / fla - 1) * 100).toFixed(0)}% headroom</strong>.
        ${glandBlock}
      </p>
    </div>

    <div class="wt-cards">
      <div class="wt-card">
        <div class="wt-card-label">Motor FLA</div>
        <div class="wt-card-value">${fla.toFixed(2)} A</div>
        <div class="wt-card-note">${volt} V · PF ${pf.toFixed(2)} · η ${eff.toFixed(2)} (${ie})</div>
      </div>
      <div class="wt-card">
        <div class="wt-card-label">Required Rating</div>
        <div class="wt-card-value">${required.toFixed(2)} A</div>
        <div class="wt-card-note">FLA ÷ ${derating} derating</div>
      </div>
      <div class="wt-card">
        <div class="wt-card-label">Cable</div>
        <div class="wt-card-value">${cCores}C × ${cCSA} mm² ${cableType}</div>
        <div class="wt-card-note">Rated ${cRating} A · OD ${cOD} mm · 600/1000 V</div>
      </div>
      <div class="wt-card ${glandMatch ? '' : 'wt-card-warn'}">
        <div class="wt-card-label">Gland Order Code</div>
        <div class="wt-card-value wt-card-code">${orderCode || 'No match'}</div>
        <div class="wt-card-note">${glandMatch ? `${glandTypeLabel} · ${entryVal} · Size ${glandMatch.size}` : `OD ${cOD} mm out of range`}</div>
      </div>
    </div>

    <div class="wt-disclaimer">
      ⚠ Indicative results only. Always verify FLA against motor nameplate, confirm cable
      selection against project derating schedule and ambient conditions, and check gland
      selection against Hawke datasheets before ordering.
    </div>`;
}
