// ══════════════════════════════════════════════════════════
// WONDER TOOL — Motor → Cable → Gland one-stop shop
// IEC 60092-352, NEK 606, Hawke International
// ══════════════════════════════════════════════════════════

// ── PDF Generator ────────────────────────────────────────────
function wtGeneratePDF() {
  const d = window._wtData;
  if (!d) { alert('Run a calculation first.'); return; }
  const p = d.proj;

  // Cable comparison table rows
  const tableRows = d.tableSlice.map(e => {
    const { cores, csa, od, current: rated } = e;
    const derated  = +(rated * d.combinedDerating).toFixed(1);
    const totalCap = +(derated * d.parallel).toFixed(1);
    const cmp      = d.showTotal ? totalCap : derated;
    const ratio    = cmp / d.fla;
    const isSel    = csa === d.selCSA;
    const thr = d.borderlineThreshold || 0.10;
    let badgeClass, status;
    if (ratio >= 1 + thr)  { badgeClass = 'pdf-badge-pass'; status = 'OK'; }
    else if (ratio >= 1.0) { badgeClass = 'pdf-badge-warn'; status = 'Borderline'; }
    else                   { badgeClass = 'pdf-badge-fail'; status = 'Under'; }
    const weight = isSel ? '700' : '400';
    const border = isSel ? 'border-left:3px solid #2E7CC0;' : '';
    return `<tr style="${border}font-weight:${weight}">
      <td>${isSel ? '▶ ' : ''}${cores}C × ${csa} mm²</td>
      <td>${rated} A</td>
      <td>${derated} A</td>
      ${d.showTotal ? `<td>${totalCap} A</td>` : ''}
      <td>${od} mm</td>
      <td><span class="pdf-badge ${badgeClass}">${status}</span></td>
    </tr>`;
  }).join('');

  // Gland data — one block per family (braided/armoured, barrier, compression), each with
  // its own best-fit size and the same directional fit wording as the Cable & Gland tab.
  const glandItem = (k, v) => `<div class="data-item"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  const glandBlocks = ['453','653','421'].map(type => {
    const g = d.glandFamilies[type];
    const name = glandFamilyName(type);
    if (!g.match) {
      return `<div class="sec" style="margin-top:10px;font-size:9pt">${name}</div>
<p style="color:#B33F31;padding:4px 0">No gland found for OD ${d.gOD}mm — select manually.</p>`;
    }
    const gm = g.match;
    const fitRow = glandItem('Fit vs Cable OD', glandFitSummaryText(gm));
    let rows;
    if (type === '453') {
      rows =
        glandItem('Size Ref', gm.size) +
        glandItem(d.useNPT?'NPT Entry':'Metric Entry', d.useNPT?gm.npt:gm.metric) +
        glandItem('Inner Sheath Range', `${gm.innerMin}–${gm.innerMax} mm`) +
        glandItem('Outer Sheath Range', `${gm.outerMin}–${gm.outerMax} mm`) +
        glandItem('Armour Wire Ø', `${gm.arm1} mm`) +
        fitRow;
    } else if (type === '653') {
      rows =
        glandItem('Size Ref', gm.size) +
        glandItem(d.useNPT?'NPT Entry':'Metric Entry', d.useNPT?gm.npt:gm.metric) +
        glandItem('Max Inner Sheath', `${gm.innerMax} mm`) +
        glandItem('Max Core Ø', `${gm.coreMax} mm`) +
        glandItem('Outer Sheath Range', `${gm.outerMin}–${gm.outerMax} mm`) +
        fitRow;
    } else {
      rows =
        glandItem('Size Ref', gm.size) +
        glandItem(d.useNPT?'NPT Entry':'Metric Entry', d.useNPT?gm.npt:gm.metric) +
        glandItem('Std Seal OD Range', `${gm.stdMin}–${gm.stdMax} mm`) +
        (gm.altMin ? glandItem('Alt Seal OD Range', `${gm.altMin}–${gm.altMax} mm`) : '') +
        fitRow;
    }
    return `<div class="sec" style="margin-top:10px;font-size:9pt">${name}</div>
<div class="order-box">
  <div class="order-label">Order Code</div>
  <div class="order-code">${g.orderCode}</div>
</div>
<div class="data-grid">${rows}</div>`;
  }).join('');

  const flaLine = d.flaIsOverride
    ? `Nameplate override — ${d.fla.toFixed(2)} A`
    : `(${d.modeLabel}) ÷ (√3 × ${d.volt} V × PF ${d.pf.toFixed(2)} × η ${d.eff.toFixed(2)}) = <strong>${d.fla.toFixed(2)} A</strong>`;

  const dateStr = p.date || new Date().toISOString().slice(0,10);

  const bodyHtml = `
<!-- Title block -->
<div class="title-block">
  <table>
    <tr>
      <td class="lbl">Project</td>
      <td class="val" colspan="3">${p.name || '—'}</td>
    </tr>
    <tr>
      <td class="lbl">Project No.</td><td class="val">${p.num || '—'}</td>
      <td class="lbl">Date</td><td class="val">${dateStr}</td>
    </tr>
    <tr>
      <td class="lbl">Cable Tag</td><td class="val">${p.tag || '—'}</td>
      <td class="lbl">Revision</td><td class="val">${p.rev || '01'}</td>
    </tr>
    <tr>
      <td class="lbl">Circuit</td><td class="val">${p.circuit || '—'}</td>
      <td class="lbl">Prepared By</td><td class="val">${p.by || '—'}</td>
    </tr>
  </table>
</div>

<!-- Motor & FLA -->
<div class="sec">1 — Motor &amp; Supply</div>
<div class="data-grid">
  <div class="data-item"><div class="k">Motor Rating</div><div class="v">${d.modeLabel}</div></div>
  <div class="data-item"><div class="k">Supply Voltage</div><div class="v">${d.volt} V (L-L)</div></div>
  <div class="data-item"><div class="k">Efficiency Class</div><div class="v">${d.ie}</div></div>
  <div class="data-item"><div class="k">Power Factor</div><div class="v">${d.pf.toFixed(2)}</div></div>
  <div class="data-item"><div class="k">Efficiency (η)</div><div class="v">${d.eff.toFixed(2)}</div></div>
  <div class="data-item"><div class="k">Ambient Temperature</div><div class="v">${d.tempLabel}</div></div>
  ${d.uprateLine ? `<div class="data-item full"><div class="k">60 Hz Uprating</div><div class="v">${d.uprateLine}</div></div>` : ''}
  <div class="data-item full ${d.flaIsOverride?'':'accent'}">
    <div class="k">${d.flaIsOverride ? 'FLA — Nameplate Override' : 'Calculated FLA'}</div>
    ${d.flaIsOverride
      ? `<div class="fla-result">${d.fla.toFixed(2)} A</div>`
      : `<div class="fla-formula">FLA = (${d.modeLabel.split(' (')[0].replace(' kW','kW')} × 1000) ÷ (√3 × ${d.volt}V × ${d.pf.toFixed(2)} × ${d.eff.toFixed(2)})</div>
         <div class="fla-result">${d.fla.toFixed(2)} A</div>`}
  </div>
</div>

<!-- Derating -->
<div class="sec">2 — Derating</div>
<div class="data-grid">
  <div class="data-item"><div class="k">Temperature Factor</div><div class="v">${d.tempFactor} (${d.tempLabel})</div></div>
  <div class="data-item"><div class="k">Grouping Factor</div><div class="v">${d.groupFactor} (${d.groupLabel})</div></div>
  <div class="data-item accent"><div class="k">Combined Derating</div><div class="v">×${d.combinedDerating.toFixed(3)}</div></div>
  ${d.parallel > 1 ? `<div class="data-item"><div class="k">Parallel Runs</div><div class="v">${d.parallel}</div></div>` : '<div class="data-item"><div class="k">Installation</div><div class="v">Single run</div></div>'}
</div>

<!-- Cable comparison table -->
<div class="sec">3 — Cable Size Comparison</div>
<table class="cmp-table">
  <thead><tr>
    <th>Cable</th><th>Book Rating</th><th>De-Rated</th>
    ${d.showTotal ? `<th>Total (${d.parallel} runs)</th>` : ''}
    <th>OD</th><th>vs ${d.fla.toFixed(1)} A FLA</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>

<div class="sec">3a — Design Checks</div>
<table class="cmp-table">
  <thead><tr><th>Check</th><th>Basis</th><th>Result</th><th>Limit</th><th>Verdict</th></tr></thead>
  <tbody>
    <tr><td>Current rating</td><td>FLA ${d.fla.toFixed(1)} A ÷ derating${d.parallel>1?' ÷ runs':''} = ${d.requiredPerRun.toFixed(1)} A/run required</td><td>${d.cRating} A book</td><td>≥ ${d.requiredPerRun.toFixed(1)} A</td><td>${wtPdfBadge(true)}</td></tr>
    <tr><td>Running voltage drop</td><td>${d.vd.len > 0 ? `${d.vd.len} m, PF ${d.pf.toFixed(2)}, ${d.vd.hz} Hz` : 'No route length entered'}</td><td>${wtPct(d.chk.vdRun, 2)}</td><td>${d.vd.runLimit}%</td><td>${wtPdfBadge(d.chk.vdRunOk)}</td></tr>
    <tr><td>Starting voltage drop</td><td>${d.vd.len > 0 ? `${d.vd.startLabel}, ${d.vd.startMult}× FLA @ PF ${d.vd.startPf}` : 'No route length entered'}</td><td>${wtPct(d.chk.vdStart, 2)}</td><td>${d.vd.startLimit}%</td><td>${wtPdfBadge(d.chk.vdStartOk)}</td></tr>
    <tr><td>Short-circuit withstand</td><td>${d.chk.scOk != null ? `${d.vd.ik} kA for ${d.vd.tk} s (adiabatic, 1 s rating ÷ √t)` : 'No fault level entered'}</td><td>${d.chk.scAllow != null ? (d.chk.scAllow/1000).toFixed(1) + ' kA' : '—'}</td><td>${d.chk.scOk != null ? '≥ ' + d.vd.ik + ' kA' : '—'}</td><td>${wtPdfBadge(d.chk.scOk)}</td></tr>
  </tbody>
</table>
${d.sizeDriver ? `<p style="font-size:8.5pt;color:#1B4B72;margin-bottom:10px">Sized up for ${d.sizeDriver} — current rating alone required ${d.ampMinCSA}mm².</p>` : ''}
<p style="font-size:7.5pt;color:#94a3b8;margin-bottom:10px">Voltage drop is for the cable only (ΔU = √3·I·L·(R₉₀cosφ + X·sinφ), Draka R at 90 °C) and excludes supply-side drop.</p>

${d.isUpsized ? `<div style="background:rgba(46,124,192,0.07);border:1px solid rgba(46,124,192,0.4);border-left:3px solid #2E7CC0;border-radius:4px;padding:8px 12px;margin-bottom:10px;font-size:8.5pt;color:#1B4B72">
  ⬆ <strong>Upsized at engineer's discretion</strong> — minimum cable was ${d.prevCableCSA}mm² (borderline).
  Selected ${d.cCSA}mm² to achieve adequate headroom.
</div>` : ''}
<!-- Selected cable -->
<div class="sec">4 — Selected Cable</div>
<div class="data-grid">
  <div class="data-item full"><div class="k">Cable Type</div><div class="v">${d.powerDataLabel}</div></div>
  <div class="data-item accent"><div class="k">Size</div><div class="v">${d.cCores}-core ${d.cCSA} mm²${d.pCode?' ('+d.pCode+')':''}</div></div>
  <div class="data-item accent"><div class="k">Overall OD</div><div class="v">${d.cOD} mm</div></div>
  ${d.innerOD ? `<div class="data-item"><div class="k">Inner Sheath OD</div><div class="v">${d.innerOD} mm</div></div>` : ''}
  <div class="data-item"><div class="k">Book Rating @45°C</div><div class="v">${d.cRating} A</div></div>
  <div class="data-item"><div class="k">De-Rated</div><div class="v">${d.cDerated} A${d.showTotal?' / run':''}</div></div>
  ${d.showTotal ? `<div class="data-item"><div class="k">Total Capacity</div><div class="v">${d.totalCap} A (${d.parallel} runs)</div></div>` : ''}
  <div class="data-item"><div class="k">Headroom</div><div class="v">+${d.headroom}%</div></div>
  <div class="data-item"><div class="k">Weight</div><div class="v">${d.cWeight} kg/km</div></div>
  <div class="data-item"><div class="k">Voltage Rating</div><div class="v">${d.powerDataVoltage}</div></div>
  <div class="data-item"><div class="k">Min Bend Radius</div><div class="v">${(d.cOD*8).toFixed(0)} mm (8×OD)</div></div>
  <div class="data-item full"><div class="k">Colour Code</div><div class="v">${d.powerDataColour}</div></div>
</div>

<!-- Gland -->
<div class="sec">5 — Gland Recommendation</div>
<div class="data-grid" style="margin-bottom:6px">
  <div class="data-item"><div class="k">Entry Thread</div><div class="v">${d.useNPT ? 'NPT' : 'Metric'}</div></div>
  <div class="data-item"><div class="k">Cable OD Checked</div><div class="v">${d.gOD} mm${d.glandOdManual ? ' (measured)' : ' (book)'}</div></div>
</div>
${glandBlocks}

<!-- Disclaimer -->
<div class="disclaimer">
  <strong>Disclaimer:</strong> This output is indicative only. Always verify FLA against the motor rating plate, confirm cable selection against project derating schedule and site conditions, and check gland selection against Hawke International datasheets before ordering, installing, or certifying. Cable ratings per IEC 60092-352:2016 Table B.4 / NEK 606. Gland data per Hawke International product datasheets.
</div>

<!-- Footer -->
<div class="footer">
  <span>Generated by M.E.T. v${APP_VERSION}</span>
  <span>${p.tag ? 'Cable Tag: ' + p.tag + ' &nbsp;|&nbsp; ' : ''}${p.num || ''}</span>
  <span>${dateStr}</span>
</div>`;

  const html = buildPdfDocument(`MET — ${p.tag || 'Cable & Gland Selection'}`, APP_VERSION, bodyHtml);
  printHtmlDocument(html);
}

function wtPdfBadge(ok) {
  if (ok === null || ok === undefined) return `<span class="pdf-badge">N/A</span>`;
  return ok ? `<span class="pdf-badge pdf-badge-pass">OK</span>` : `<span class="pdf-badge pdf-badge-fail">Fail</span>`;
}

// IEC 60092-352 ambient temperature correction factors
// Base: 45°C | Max conductor: 90°C (XLPE/EPR)
// Ct = sqrt((90 − T_amb) / (90 − 45))
const WT_TEMP = [
  { temp:20, factor:1.25, label:'20°C' },
  { temp:25, factor:1.20, label:'25°C' },
  { temp:30, factor:1.15, label:'30°C' },
  { temp:35, factor:1.11, label:'35°C' },
  { temp:40, factor:1.05, label:'40°C' },
  { temp:45, factor:1.00, label:'45°C — base (IEC 60092-352 default)' },
  { temp:50, factor:0.94, label:'50°C' },
  { temp:55, factor:0.88, label:'55°C' },
  { temp:60, factor:0.82, label:'60°C' },
  { temp:65, factor:0.75, label:'65°C' },
];

// NEMA_HP, IEC_KW, flaLookup(), computeFLA() are defined in js/data-motors.js

let wtHz      = 50;   // 50 | 60 | '5060'
let wtGroup   = 1.00; // grouping derating factor
let wtUpsized = false; // engineer chose next size up

// Graduated borderline threshold — tighter at higher currents
// <50A: 15%, 50–100A: 10%, >100A: 5%
function wtBorderlineThreshold(fla) {
  if (fla < 50)  return 0.15;
  if (fla < 100) return 0.10;
  return 0.05;
}

function wtSetUpsized(val) {
  wtUpsized = val;
  wtCalc();
}

// ── Init ────────────────────────────────────────────────────
function initWonderTool() {
  document.getElementById('wt_temp_wrap').innerHTML =
    `<select id="wt_temp" onchange="wtCalc()">` +
    WT_TEMP.map(t =>
      `<option value="${t.factor}"${t.temp===45?' selected':''}>${t.label} (×${t.factor})</option>`
    ).join('') + `</select>`;

  wtLoadProjectFields();
  wtSetHz(50); // renders power + voltage selects, then calls wtCalc
}

// ── Project details ───────────────────────────────────────────
const WT_PROJ_KEYS = ['name','num','by','date','tag','circuit','rev'];

function wtLoadProjectFields() {
  WT_PROJ_KEYS.forEach(k => {
    const el = document.getElementById('wt_proj_' + k);
    if (!el) return;
    const saved = localStorage.getItem('met_wt_proj_' + k);
    if (saved !== null) {
      el.value = saved;
    } else if (k === 'date') {
      el.value = new Date().toISOString().slice(0, 10);
    } else if (k === 'rev') {
      el.value = '01';
    }
  });
}

function wtSaveField(k) {
  const el = document.getElementById('wt_proj_' + k);
  if (el) localStorage.setItem('met_wt_proj_' + k, el.value);
}

function wtGetProj() {
  const g = k => document.getElementById('wt_proj_' + k)?.value?.trim() || '';
  return {
    name: g('name'), num: g('num'), by: g('by'),
    date: g('date'), tag: g('tag'), circuit: g('circuit'), rev: g('rev')
  };
}

// ── Frequency mode ───────────────────────────────────────────
function wtSetHz(hz) {
  wtHz = hz;

  // Highlight the active button
  ['wt_btn_50','wt_btn_60','wt_btn_5060'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const activeId = hz===50?'wt_btn_50':hz===60?'wt_btn_60':'wt_btn_5060';
  document.getElementById(activeId)?.classList.add('active');

  // Rebuild power input
  const powerWrap = document.getElementById('wt_power_wrap');
  if (!powerWrap) return;

  if (hz === 60) {
    // NEMA HP dropdown — Manual first
    const hpOpts = `<option value="0">Manual…</option>` +
      NEMA_HP.map(h => `<option value="${h}"${h===25?' selected':''}>${h} HP</option>`).join('');
    powerWrap.innerHTML =
      `<select id="wt_hp" onchange="wtHpChange()">${hpOpts}</select>
       <input type="number" id="wt_hp_manual" placeholder="Enter HP" style="margin-top:6px;display:none" oninput="wtCalc()">`;
  } else {
    // IEC kW dropdown — Manual first
    const kwOpts = `<option value="0">Manual…</option>` +
      IEC_KW.map(k => `<option value="${k}"${k===22?' selected':''}>${k} kW</option>`).join('');
    powerWrap.innerHTML =
      `<select id="wt_kw" onchange="wtKwChange()">${kwOpts}</select>
       <input type="number" id="wt_kw_manual" placeholder="Enter kW" style="margin-top:6px;display:none" oninput="wtCalc()">`;
  }

  // Show/hide 60Hz correction factor row
  const corrRow = document.getElementById('wt_corr_row');
  if (corrRow) corrRow.style.display = hz === '5060' ? 'block' : 'none';

  // Voltage hint — varies by frequency mode
  const hintEl = document.getElementById('wt_volt_hint');
  if (hintEl) {
    if (hz === 50) {
      hintEl.textContent = 'Typical IEC: 380 V, 400 V, 415 V, 440 V';
      hintEl.style.display = 'block';
    } else if (hz === 60) {
      hintEl.textContent = 'Typical NEMA: 440 V, 460 V, 480 V';
      hintEl.style.display = 'block';
    } else {
      hintEl.textContent = 'Typical 60 Hz supply: 440 V, 460 V, 480 V';
      hintEl.style.display = 'block';
    }
  }

  // Rebuild voltage if not already rendered
  if (!document.getElementById('wt_volt')) {
    const voltOpts = [['0','Manual…'], ...VOLT_OPTS.filter(([v])=>v!=='0')]
      .map(([v,l]) => `<option value="${v}"${v==='400'?' selected':''}>${l}</option>`).join('');
    document.getElementById('wt_volt_wrap').innerHTML =
      `<select id="wt_volt" onchange="wtVoltChange()">${voltOpts}</select>
       <input type="number" id="wt_volt_manual" placeholder="Enter voltage (V)" style="margin-top:6px;display:none" oninput="wtCalc()">`;
  }

  wtCalc();
}

function wtFillPfEff(kw) {
  const ie = document.getElementById('wt_ie')?.value || 'IE3';
  if (!isNaN(kw) && kw > 0) {
    const { eff, pf } = flaLookup(kw, ie);
    const pfEl  = document.getElementById('wt_pf');
    const effEl = document.getElementById('wt_eff');
    if (pfEl  && pfEl.dataset.manual  !== '1') pfEl.value  = pf.toFixed(2);
    if (effEl && effEl.dataset.manual !== '1') effEl.value = eff.toFixed(2);
  }
}

function wtKwChange() {
  const sel = document.getElementById('wt_kw');
  const m   = document.getElementById('wt_kw_manual');
  const v   = parseFloat(sel?.value);
  if (m) m.style.display = v === 0 ? 'block' : 'none';
  const kw = v === 0 ? parseFloat(m?.value) : v;
  wtFillPfEff(kw);
  wtCalc();
}

function wtIEChange() {
  // Re-fill PF/eff from new IE class, then recalc
  const kwSel = parseFloat(document.getElementById('wt_kw')?.value);
  const kw = kwSel === 0
    ? parseFloat(document.getElementById('wt_kw_manual')?.value)
    : kwSel;
  // Clear manual override flags so lookup re-fills
  const pfEl  = document.getElementById('wt_pf');
  const effEl = document.getElementById('wt_eff');
  if (pfEl)  pfEl.dataset.manual  = '0';
  if (effEl) effEl.dataset.manual = '0';
  wtFillPfEff(kw);
  wtCalc();
}

function wtSetGroup(val) {
  wtGroup = val;
  document.getElementById('wt_grp_1')  ?.classList.toggle('active', val === 1.00);
  document.getElementById('wt_grp_085')?.classList.toggle('active', val === 0.85);
  wtCalc();
}

function wtHpChange() {
  const v = parseFloat(document.getElementById('wt_hp')?.value);
  const m = document.getElementById('wt_hp_manual');
  if (m) m.style.display = v === 0 ? 'block' : 'none';
  wtCalc();
}

function wtVoltChange() {
  const v = parseFloat(document.getElementById('wt_volt')?.value);
  const m = document.getElementById('wt_volt_manual');
  if (m) m.style.display = v === 0 ? 'block' : 'none';
  wtCalc();
}

// ── Core calculation ─────────────────────────────────────────
function wtCalc() {
  const result = document.getElementById('wt_result');
  if (!result) return;

  // ── Read power input ──
  let kw, modeLabel;
  if (wtHz === 60) {
    const hpSel = parseFloat(document.getElementById('wt_hp')?.value);
    const hp = hpSel === 0 ? parseFloat(document.getElementById('wt_hp_manual')?.value) : hpSel;
    if (isNaN(hp) || hp <= 0) { result.innerHTML = wtPrompt(); return; }
    kw = hp * 0.7457;
    modeLabel = `${hp} HP (NEMA 60 Hz)`;
  } else {
    const kwSel = parseFloat(document.getElementById('wt_kw')?.value);
    kw = kwSel === 0 ? parseFloat(document.getElementById('wt_kw_manual')?.value) : kwSel;
    if (isNaN(kw) || kw <= 0) { result.innerHTML = wtPrompt(); return; }
    modeLabel = wtHz === 50 ? `${kw} kW (IEC 50 Hz)` : `${kw} kW (50 Hz motor on 60 Hz supply)`;
  }

  // ── Read voltage ──
  const voltSel = parseFloat(document.getElementById('wt_volt')?.value);
  const volt = voltSel === 0 ? parseFloat(document.getElementById('wt_volt_manual')?.value) : voltSel;
  if (isNaN(volt) || volt <= 0) { result.innerHTML = wtPrompt(); return; }

  const ie          = document.getElementById('wt_ie')?.value        || 'IE3';
  const tempFactor  = parseFloat(document.getElementById('wt_temp')?.value   || 1.00);
  const groupFactor = wtGroup;
  const cableType   = document.getElementById('wt_cabletype')?.value  || 'RFOU';
  const cores       = parseInt(document.getElementById('wt_cores')?.value    || 4);
  const parallel    = parseInt(document.getElementById('wt_parallel')?.value || 1);
  const useNPT      = document.getElementById('wt_entry')?.value === 'npt';
  const corrFactor  = parseFloat(document.getElementById('wt_corr_factor')?.value || 1.2);

  // ── PF / eff — fill fields if empty, then read ──
  wtFillPfEff(kw);
  const pf  = parseFloat(document.getElementById('wt_pf')?.value  || 0.88);
  const eff = parseFloat(document.getElementById('wt_eff')?.value || 0.92);

  // ── FLA — for 50/60 mode, uprate kW by correction factor ──
  let kwEffective = kw;
  let uprateLine = '';
  if (wtHz === '5060') {
    kwEffective = kw * corrFactor;
    uprateLine = `At 60 Hz: ${kw} kW × ${corrFactor} = ${kwEffective.toFixed(1)} kW effective`;
    // Show below the power dropdown
    const upEl = document.getElementById('wt_uprate_note');
    if (upEl) { upEl.textContent = uprateLine; upEl.style.display = 'block'; }
  } else {
    const upEl = document.getElementById('wt_uprate_note');
    if (upEl) upEl.style.display = 'none';
  }

  // ── FLA — use override if entered, otherwise calculate ──
  const flaOverride = parseFloat(document.getElementById('wt_fla_override')?.value);
  const flaIsOverride = !isNaN(flaOverride) && flaOverride > 0;
  const fla = flaIsOverride
    ? flaOverride
    : computeFLA(kwEffective, volt, pf, eff);

  // ── Update FLA display immediately — before any early returns ──
  const flaEl = document.getElementById('wt_fla_display');
  if (flaEl) {
    if (flaIsOverride) {
      flaEl.innerHTML = `
        <div class="wt-fla-formula">FLA — nameplate override</div>
        <div class="wt-fla-result">= <strong>${fla.toFixed(2)} A</strong></div>`;
    } else {
      const kwDisp = wtHz === '5060' ? `${kwEffective.toFixed(1)} kW (uprated)` : `${kwEffective.toFixed(1)} kW`;
      flaEl.innerHTML = `
        <div class="wt-fla-formula">FLA = (${kwDisp} × 1000) ÷ (√3 × ${volt} V × PF ${pf.toFixed(2)} × η ${eff.toFixed(2)})</div>
        <div class="wt-fla-result">= <strong>${fla.toFixed(2)} A</strong></div>`;
    }
  }

  // ── Derating ──
  const combinedDerating = tempFactor * groupFactor;
  // requiredPerRun = minimum RATED cable current needed so that derated current ≥ FLA per run
  const requiredPerRun = fla / (combinedDerating * parallel);

  // ── Cable selection — filter on RATED current, derating already in requiredPerRun ──
  const powerData = CABLE_DATA[cableType]?.Power;
  if (!powerData) { result.innerHTML = `<p style="color:var(--danger)">Cable data not found.</p>`; return; }

  const allEntries = powerData.entries.filter(e => e.cores === cores && typeof e.current === 'number').sort((a,b) => a.csa-b.csa);

  // ── Voltage drop / short-circuit (optional — only when a route length / fault level is given) ──
  const vd = wtReadVdInputs(fla, volt, pf, parallel);
  const checkOf = e => wtCableChecks(e, requiredPerRun, vd);
  const ampOnly    = allEntries.filter(e => e.current >= requiredPerRun);
  const candidates = allEntries.filter(e => checkOf(e).ok);
  // What pushed the size up beyond the current-rating minimum, if anything
  // — judged on the next size DOWN from the pick (the one that just failed), so the note names the
  // criterion that actually set the size rather than everything the smallest cable fails.
  let sizeDriver = null;
  if (candidates.length && ampOnly.length && candidates[0].csa !== ampOnly[0].csa) {
    const pickIdx = ampOnly.findIndex(e => e.csa === candidates[0].csa);
    const c0 = checkOf(ampOnly[Math.max(0, pickIdx - 1)]);
    sizeDriver = c0.vdNoData || c0.scNoData ? 'missing R/X data on the smaller size' : [c0.vdRunOk === false ? 'running voltage drop' : null, c0.vdStartOk === false ? 'starting voltage drop' : null, c0.scOk === false ? 'short-circuit withstand' : null].filter(Boolean).join(' + ');
  }

  if (!candidates.length && ampOnly.length) {
    const largest = checkOf(ampOnly[ampOnly.length - 1]);
    const why = largest.vdNoData || largest.scNoData ? 'it has no published R/X / short-circuit data to check against (legacy unverified entry)'
      : [largest.vdRunOk === false ? `running VD ${largest.vdRun.toFixed(1)}% > ${vd.runLimit}%` : null,
         largest.vdStartOk === false ? `starting VD ${largest.vdStart.toFixed(1)}% > ${vd.startLimit}%` : null,
         largest.scOk === false ? `short-circuit ${vd.ik} kA > ${(largest.scAllow/1000).toFixed(1)} kA for ${vd.tk}s` : null].filter(Boolean).join('; ');
    result.innerHTML = `<div class="wt-alert">
      <strong>No single cable meets every check.</strong> Current rating is satisfied from ${ampOnly[0].csa}mm², but even the largest ${cores}-core ${cableType} (${ampOnly[ampOnly.length-1].csa}mm²) fails: ${why}.
      ${parallel < 3 ? ` Try <strong>${parallel + 1} parallel runs</strong>, a shorter route, or` : ' Try'} review the project limits.
    </div>`;
    return;
  }

  if (!candidates.length) {
    const altCores = cores === 4 ? 3 : 4;
    const altEntries = powerData.entries.filter(e => e.cores === altCores && typeof e.current === 'number').sort((a,b) => a.csa-b.csa);
    const altCandidates = altEntries.filter(e => e.current >= requiredPerRun);
    const altHint = altCandidates.length
      ? ` Try switching to <strong>${altCores}-core</strong> (largest available: ${altCandidates[0].csa}mm² rated ${altCandidates[0].current} A).`
      : '';
    const parallelHint = parallel < 3
      ? ` Or increase to <strong>${parallel + 1} parallel runs</strong>.`
      : '';
    result.innerHTML = `<div class="wt-alert">
      <strong>No single cable found.</strong> No ${cores}-core ${cableType} cable is rated ≥ ${requiredPerRun.toFixed(1)} A
      (FLA ${fla.toFixed(1)} A ÷ ${combinedDerating.toFixed(2)} derating${parallel>1?' ÷ '+parallel+' runs':''}).
      ${altHint}${parallelHint}
    </div>`;
    return;
  }

  // ── Apply upsize if requested ──
  const minCable = candidates[0];
  const showTotal = parallel > 1;
  const borderlineThreshold = wtBorderlineThreshold(fla);

  // Check if minimum cable is borderline
  const minDerated = +(minCable.current * combinedDerating).toFixed(1);
  const minTotal   = +(minDerated * parallel).toFixed(1);
  const minRatio   = (showTotal ? minTotal : minDerated) / fla;
  const minIsBorderline = minRatio >= 1.0 && (minRatio - 1) < borderlineThreshold;

  // If upsized, pick next candidate; if none available, revert
  let cable, isUpsized = false, prevCable = null;
  if (wtUpsized && candidates.length > 1) {
    cable = candidates[1];
    prevCable = candidates[0];
    isUpsized = true;
  } else {
    if (wtUpsized) wtUpsized = false; // can't upsize, revert silently
    cable = candidates[0];
  }

  const cCores = cable.cores, cCSA = cable.csa, cOD = cable.od, cOdTol = cable.odTol, cWeight = cable.weight, cRating = cable.current, cInnerOD = cable.innerOD;
  const cDerated = +(cRating * combinedDerating).toFixed(1);
  const totalCap = +(cDerated * parallel).toFixed(1);
  const headroom = (((showTotal ? totalCap : cDerated) / fla - 1) * 100).toFixed(0);

  // ── Cable comparison table slice ──
  const selIdx     = allEntries.findIndex(e => e.csa === cCSA);
  const tableSlice = allEntries.slice(Math.max(0, selIdx-2), Math.min(allEntries.length, selIdx+3));

  // ── Gland — best fit from each of the three Hawke families, same recommender as the
  //    Cable & Gland tab (js/data-glands.js) ──
  const chk = checkOf(cable);
  const odM = parseFloat(document.getElementById('wt_od_manual')?.value);
  const innerM = parseFloat(document.getElementById('wt_innerod_manual')?.value);
  const gOD = isNaN(odM) ? cOD : odM, gOdTol = isNaN(odM) ? cOdTol : 0;
  const gInner = isNaN(innerM) ? cInnerOD : innerM, gInnerTol = isNaN(innerM) ? cable.innerODTol : 0;
  const glandOpts = { useNPT, codeTransform: useNPT ? wtNptCode : undefined, coreBundle: estimateCoreBundleOD(cable), odManual: !isNaN(odM), innerManual: !isNaN(innerM) };
  const glandFamilies = bestGlandPerFamily(gOD, gOdTol, gInner, gInnerTol);
  const tempObj    = WT_TEMP.find(t => Math.abs(t.factor - tempFactor) < 0.001);
  const tempLabel  = tempObj ? `${tempObj.temp}°C` : `×${tempFactor}`;
  const groupLabel = groupFactor === 1.00 ? '≤6 cables' : '>6 cables';
  const pCode      = (powerData.label.match(/\(([^)]+)\)/)?.[1]) || '';
  const cableDesc  = `${cCores}-core ${cCSA}mm² ${cableType}${pCode?' ('+pCode+')':''} 600/1000V`;
  const glandSummaryLines = ['453','653','421'].map(type => {
    const g = glandFamilies[type];
    return g.match
      ? `  ${glandFamilyName(type)}: ${g.orderCode} — Size ${g.match.size}, Entry ${useNPT ? g.match.npt : g.match.metric}`
      : `  ${glandFamilyName(type)}: no fit for OD ${gOD}mm`;
  }).join('\n');
  const vdSummary = vd.len > 0 && chk.vdRun != null
    ? `\nVolt drop: ${vd.len} m route — running ${wtPct(chk.vdRun, 2)} (limit ${vd.runLimit}%), starting ${wtPct(chk.vdStart, 2)} (limit ${vd.startLimit}%, ${vd.startMult}× FLA)`
    : '';
  const scSummary = chk.scOk != null ? `\nShort-circuit: ${vd.ik} kA for ${vd.tk}s vs ${(chk.scAllow/1000).toFixed(1)} kA cable withstand — ${chk.scOk ? 'OK' : 'FAIL'}` : '';

  // ── Summary (stored globally to avoid quote-in-onclick issues) ──
  window._wtSummary =
`WONDER TOOL — Motor Cable & Gland Selection
============================================
Motor:    ${modeLabel} | ${volt} V | ${ie}
${wtHz==='5060'?`Uprated: ${uprateLine}\n`:''}FLA:      ${fla.toFixed(2)} A  (PF ${pf.toFixed(2)}, η ${eff.toFixed(2)})
Ambient:  ${tempLabel}  (×${tempFactor})
Grouping: ${groupLabel}  (×${groupFactor})${parallel>1?`\nParallel: ${parallel} runs`:''}
Derating: ×${combinedDerating.toFixed(3)} combined

Cable:    ${parallel>1?parallel+' × ':''}${cableDesc}
  Rated ${cRating} A — Derated ${cDerated} A — OD ${cOD} mm — ${cWeight} kg/km
  ${headroom}% headroom over FLA${parallel>1?` (total ${totalCap} A)`:''}${vdSummary}${scSummary}${sizeDriver ? `\n  Sized up for ${sizeDriver}` : ''}

Gland recommendations (best fit per family):
${glandSummaryLines}

Generated by M.E.T. v${APP_VERSION}`;

  window._wtCableDesc = `${parallel>1?parallel+' × ':''}${cableDesc} — OD ${cOD}mm — Rated ${cRating}A — Derated ${cDerated}A`;

  // ── Store all data for PDF generator ──
  window._wtData = {
    proj: wtGetProj(),
    modeLabel, volt, ie, pf, eff, fla, flaIsOverride,
    uprateLine: wtHz === '5060' ? uprateLine : null,
    kwEffective, corrFactor,
    tempLabel, tempFactor, groupFactor, groupLabel,
    parallel, showTotal, combinedDerating,
    cCores, cCSA, cOD, cWeight, cRating, cDerated, totalCap, headroom,
    cableDesc, pCode, innerOD: cInnerOD,
    powerDataLabel: powerData.label, powerDataVoltage: powerData.voltage, powerDataColour: powerData.colourCode,
    useNPT, glandFamilies, gOD, glandOdManual: !isNaN(odM),
    vd, chk, sizeDriver, requiredPerRun, ampMinCSA: ampOnly[0]?.csa,
    tableSlice, selCSA: cCSA, flaForTable: fla,
    isUpsized, prevCableCSA: prevCable?.csa, borderlineThreshold
  };
  document.getElementById('wt_pdf_btn')?.removeAttribute('disabled');

  // ── Render ──────────────────────────────────────────────────
  const capLine = showTotal
    ? `derated ${cDerated} A/run, <strong>${totalCap} A total</strong>`
    : `derated <strong>${cDerated} A</strong>`;

  const upsizeNote = isUpsized
    ? `<div class="wt-upsize-note"><strong>Upsized at engineer's discretion</strong> — minimum size was
        <strong>${prevCable.csa}mm²</strong> (${+(prevCable.current*combinedDerating).toFixed(1)} A derated,
        ${(((showTotal?+(prevCable.current*combinedDerating*parallel).toFixed(1):+(prevCable.current*combinedDerating).toFixed(1))/fla-1)*100).toFixed(0)}% headroom — borderline).
        Selected <strong>${cCSA}mm²</strong> instead.
        <button class="btn" style="font-size:0.75rem;margin-left:10px" onclick="wtSetUpsized(false)">Revert to ${prevCable.csa}mm²</button>
      </div>`
    : minIsBorderline && candidates.length > 1
      ? `<div class="wt-borderline-note">Selected cable is within the borderline margin (+${headroom}% headroom,
          threshold ${(borderlineThreshold*100).toFixed(0)}% for ${fla.toFixed(0)} A FLA).
          <button class="btn primary" style="font-size:0.75rem;margin-left:10px" onclick="wtSetUpsized(true)">Use next size up (${candidates[1].csa}mm²)</button>
        </div>`
      : '';

  const driverNote = sizeDriver
    ? `<div class="wt-upsize-note"><strong>Sized up for ${sizeDriver}</strong> — current rating alone needs only ${ampOnly[0].csa}mm²; ${cCSA}mm² is the smallest that also meets the ${sizeDriver} limit${sizeDriver.includes('+') ? 's' : ''}.</div>`
    : '';

  result.innerHTML = `
    <div class="kicker">Recommendation</div>
    <div class="wt-summary-card">
      ${driverNote}${upsizeNote}
      <p class="wt-summary-text">
        <strong>${modeLabel}</strong> at <strong>${volt} V</strong>${wtHz==='5060'?` — uprated to <strong>${kwEffective.toFixed(1)} kW</strong> at 60 Hz`:''}
        → FLA <strong>${fla.toFixed(1)} A</strong> (PF ${pf.toFixed(2)}, η ${eff.toFixed(2)}).
        Ambient ${tempLabel}, grouping ${groupLabel}: combined derating <strong>×${combinedDerating.toFixed(3)}</strong>.
        ${parallel>1?`<strong>${parallel} parallel runs</strong> — `:''}
        Select <strong>${parallel>1?parallel+' × ':''}${cableDesc}</strong>, rated ${cRating} A, ${capLine}, giving <strong>+${headroom}% headroom</strong>.
        Glands: ${['453','653','421'].map(t => glandFamilies[t].match
          ? `<span class="wt-inline-code">${glandFamilies[t].orderCode}</span> (${glandFamilyName(t)})`
          : `<span style="color:var(--danger)">no ${glandFamilyName(t)} fit</span>`).join(', ')}.
      </p>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" style="font-size:0.8rem" onclick="copyText(window._wtSummary)">Copy Summary</button>
        <button class="btn primary" style="font-size:0.8rem" onclick="wtGeneratePDF()">Generate PDF</button>
      </div>
    </div>

    <div class="wt-chips">
      <div class="wt-chip"><div class="wt-chip-label">FLA</div><div class="wt-chip-val">${fla.toFixed(2)} A</div></div>
      <div class="wt-chip"><div class="wt-chip-label">Temp ×</div><div class="wt-chip-val">${tempFactor}</div></div>
      <div class="wt-chip"><div class="wt-chip-label">Group ×</div><div class="wt-chip-val">${groupFactor}</div></div>
      <div class="wt-chip"><div class="wt-chip-label">Combined</div><div class="wt-chip-val">×${combinedDerating.toFixed(3)}</div></div>
      ${showTotal?`<div class="wt-chip"><div class="wt-chip-label">Runs</div><div class="wt-chip-val">${parallel}</div></div>`:''}
      <div class="wt-chip wt-chip-accent"><div class="wt-chip-label">Headroom</div><div class="wt-chip-val">+${headroom}%</div></div>
      ${chk.vdRun != null ? `<div class="wt-chip"><div class="wt-chip-label">Run VD</div><div class="wt-chip-val">${wtPct(chk.vdRun)}</div></div>
      <div class="wt-chip"><div class="wt-chip-label">Start VD</div><div class="wt-chip-val">${wtPct(chk.vdStart)}</div></div>` : ''}
    </div>

    <div class="kicker" style="margin-top:24px">Cable Size Comparison
      <span style="font-size:0.72rem;font-weight:400;color:var(--text2);text-transform:none;letter-spacing:normal">IEC 60092-352 / NEK 606</span>
    </div>
    ${wtCableTable(tableSlice, cCSA, fla, combinedDerating, parallel, checkOf, vd)}

    <div class="kicker" style="margin-top:24px">Selected Cable</div>
    <div class="gland-card">
      ${wtDesignChecksHTML({ fla, combinedDerating, tempFactor, groupFactor, parallel, requiredPerRun, cDerated, totalCap, showTotal, vd, chk })}
      ${wtCableCard(cCores, cCSA, cOD, cWeight, cRating, cInnerOD, powerData, combinedDerating, parallel, cableDesc)}
    </div>

    <div class="kicker" style="margin-top:24px">Gland Selection — Hawke ATEX/IECEx</div>
    ${renderGlandRecSummary(gOD, gOdTol, gInner, gInnerTol, glandOpts)}
    ${renderGlandRecommender(gOD, gOdTol, gInner, gInnerTol, glandOpts)}

    <div class="wt-disclaimer">
      Indicative results only. Always verify FLA against motor nameplate, confirm cable
      selection against project derating schedule and installation conditions, and check gland
      selection against Hawke datasheets before ordering. IEC 60092-352:2016 Table B.4.
    </div>`;
}

function wtPrompt() {
  const flaEl = document.getElementById('wt_fla_display');
  if (flaEl) flaEl.innerHTML = '';
  window._wtData = null;
  document.getElementById('wt_pdf_btn')?.setAttribute('disabled', '');
  return `<p style="color:var(--text2);padding:16px 0">Enter motor power and voltage above to get a recommendation.</p>`;
}

// ── Cable comparison table ────────────────────────────────────
function wtCableTable(entries, selCSA, fla, derating, parallel, checkOf, vd) {
  const showTotal = parallel > 1;
  const showVD = vd && vd.len > 0, showSC = vd && vd.ik > 0;
  const rows = entries.map(e => {
    const c = checkOf ? checkOf(e) : null;
    const extraFail = c && (c.vdRunOk === false || c.vdStartOk === false || c.scOk === false);
    const { cores, csa, od, current: rated } = e;
    const derated  = +(rated * derating).toFixed(1);
    const totalCap = +(derated * parallel).toFixed(1);
    const ratio    = (showTotal ? totalCap : derated) / fla;
    const isSel    = csa === selCSA;
    let statusTag, rowClass;
    const threshold = wtBorderlineThreshold(fla);
    if (ratio >= 1.0 && extraFail) {
      const what = c.vdNoData || c.scNoData ? 'No R/X data'
        : [c.vdRunOk === false ? 'Run VD' : null, c.vdStartOk === false ? 'Start VD' : null, c.scOk === false ? 'SC' : null].filter(Boolean).join(' / ');
      statusTag = `<span class="tag tag-red"><svg style="width:11px;height:11px"><use href="#i-x"/></svg>${what}</span>`;
      rowClass  = isSel ? 'wt-row-selected' : 'wt-row-red';
    } else if (ratio >= 1 + threshold) {
      statusTag = `<span class="tag tag-green"><svg style="width:11px;height:11px"><use href="#i-check"/></svg>OK</span>`;
      rowClass  = isSel ? 'wt-row-selected wt-row-green' : 'wt-row-green';
    } else if (ratio >= 1.0 && !extraFail) {
      statusTag = `<span class="tag tag-yellow"><svg style="width:11px;height:11px"><use href="#i-warn"/></svg>Borderline</span>`;
      rowClass  = isSel ? 'wt-row-selected wt-row-orange' : 'wt-row-orange';
    } else {
      statusTag = `<span class="tag tag-red"><svg style="width:11px;height:11px"><use href="#i-x"/></svg>Under</span>`;
      rowClass  = isSel ? 'wt-row-selected' : 'wt-row-red';
    }
    const marker = isSel ? '<span class="wt-sel-arrow">▶</span> ' : '';
    return `<tr class="${rowClass}">
      <td style="font-family:var(--mono);font-weight:${isSel?700:400}">${marker}${cores}C × ${csa} mm²</td>
      <td style="font-family:var(--mono)">${rated} A</td>
      <td style="font-family:var(--mono)">${derated} A</td>
      ${showTotal ? `<td style="font-family:var(--mono)">${totalCap} A</td>` : ''}
      <td>${od} mm</td>
      ${showVD ? `<td class="mono">${wtPct(c.vdRun)} / ${wtPct(c.vdStart)}</td>` : ''}
      ${showSC ? `<td class="mono">${c.scAllow != null ? (c.scAllow/1000).toFixed(1) + ' kA' : '—'}</td>` : ''}
      <td>${statusTag}</td>
    </tr>`;
  }).join('');

  return `<table class="wt-table">
    <thead><tr>
      <th>Cable</th><th>Book Rating (A)</th><th>De-Rated (A)</th>
      ${showTotal ? `<th>Total (${parallel} runs)</th>` : ''}
      <th>OD</th>
      ${showVD ? `<th>VD run / start</th>` : ''}
      ${showSC ? `<th>SC @ ${vd.tk}s</th>` : ''}
      <th>vs ${fla.toFixed(1)} A FLA</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ── Voltage drop / short-circuit ──────────────────────────────
const wtPct = (x, dp = 1) => x == null ? '—' : x.toFixed(dp) + '%';
const WT_START_DEFAULTS = { dol: [6.5, 0.3], sd: [2.2, 0.3], soft: [3.5, 0.4], vfd: [1.0, 0.9] };

function wtStartChange() {
  const d = WT_START_DEFAULTS[document.getElementById('wt_start')?.value] || WT_START_DEFAULTS.dol;
  document.getElementById('wt_start_mult').value = d[0];
  document.getElementById('wt_start_pf').value = d[1];
  wtCalc();
}

function wtReadVdInputs(fla, volt, pf, parallel) {
  const num = (id, def) => { const v = parseFloat(document.getElementById(id)?.value); return isNaN(v) ? def : v; };
  const sel = document.getElementById('wt_start');
  return {
    len: num('wt_len', 0), runLimit: num('wt_vd_run', 5), startLimit: num('wt_vd_start', 15),
    startMult: num('wt_start_mult', 6.5), startPf: num('wt_start_pf', 0.3),
    startLabel: sel ? sel.options[sel.selectedIndex].text.split(' (')[0] : 'DOL',
    ik: num('wt_ik', 0), tk: num('wt_tk', 0.1),
    hz: wtHz === 50 ? 50 : 60, fla, volt, pf, parallel,
  };
}

// 3-phase ΔU% over the cable for current I (A, per run) at power factor cosφ, using the cable's
// own Draka R at 90 °C and X at the supply frequency (Ω/km). Cable-only — excludes supply-side drop.
function wtVdPct(e, I, cosphi, v) {
  const R = e.r90, X = v.hz === 60 ? e.x60 : e.x50;
  if (R == null || X == null || !(v.len > 0)) return null;
  const sin = Math.sqrt(Math.max(0, 1 - cosphi * cosphi));
  return Math.sqrt(3) * I * (v.len / 1000) * (R * cosphi + X * sin) / v.volt * 100;
}

// Per-criterion verdicts for one cable. A null *Ok means "not checked" (no length / fault level).
function wtCableChecks(e, requiredPerRun, v) {
  const amp = e.current >= requiredPerRun;
  const perRun = v.fla / v.parallel;
  const vdRun = wtVdPct(e, perRun, v.pf, v);
  const vdStart = wtVdPct(e, perRun * v.startMult, v.startPf, v);
  const scAllow = e.sc1s ? e.sc1s / Math.sqrt(v.tk) : null;
  // A check that was asked for (length / fault level entered) but can't be done because the cable
  // has no R/X or short-circuit data counts as a FAIL — never a silent pass. Only the legacy
  // `unverified` entries lack this data.
  const wantVd = v.len > 0, wantSc = v.ik > 0;
  const vdNoData = wantVd && vdRun == null, scNoData = wantSc && scAllow == null;
  const vdRunOk = vdNoData ? false : vdRun == null ? null : vdRun <= v.runLimit;
  const vdStartOk = vdNoData ? false : vdStart == null ? null : vdStart <= v.startLimit;
  const scOk = scNoData ? false : wantSc ? v.ik * 1000 <= scAllow : null;
  return { amp, vdRun, vdStart, scAllow, vdRunOk, vdStartOk, scOk, vdNoData, scNoData,
    ok: amp && vdRunOk !== false && vdStartOk !== false && scOk !== false };
}

// The inputs that justified the selection, laid out next to it with one badge per criterion.
function wtDesignChecksHTML(d) {
  const badge = ok => ok === null ? `<span class="badge mut">Not checked</span>`
    : ok ? `<span class="badge pass"><svg><use href="#i-check"/></svg>Pass</span>`
    : `<span class="badge fail"><svg><use href="#i-x"/></svg>Fail</span>`;
  const cap = d.showTotal ? d.totalCap : d.cDerated;
  const v = d.vd, c = d.chk;
  return `<div class="spec wt-checks">
    <div class="full"><div class="k">Required rating per run</div><div class="v">FLA ${d.fla.toFixed(1)} A ÷ (${d.tempFactor} temp × ${d.groupFactor} group${d.parallel>1?` × ${d.parallel} runs`:''}) = <b>${d.requiredPerRun.toFixed(1)} A</b></div></div>
    <div><div class="k">Current rating</div><div class="v">${cap} A ≥ ${d.fla.toFixed(1)} A ${badge(true)}</div></div>
    <div><div class="k">Running VD${v.len > 0 ? ` — ${v.len} m` : ''}</div><div class="v">${c.vdRun != null ? `${c.vdRun.toFixed(2)}% ${c.vdRunOk ? '≤' : '>'} ${v.runLimit}% ` : ''}${badge(c.vdRunOk)}</div></div>
    <div><div class="k">Starting VD — ${v.startLabel} ${v.startMult}× @ PF ${v.startPf}</div><div class="v">${c.vdStart != null ? `${c.vdStart.toFixed(2)}% ${c.vdStartOk ? '≤' : '>'} ${v.startLimit}% ` : ''}${badge(c.vdStartOk)}</div></div>
    <div><div class="k">Short-circuit @ ${v.tk}s</div><div class="v">${c.scOk != null ? `${v.ik} kA ${c.scOk ? '≤' : '>'} ${(c.scAllow/1000).toFixed(1)} kA ` : ''}${badge(c.scOk)}</div></div>
  </div>`;
}

// ── Cable detail card ─────────────────────────────────────────
function wtCableCard(cores, csa, od, weight, rating, innerOD, powerData, derating, parallel, desc) {
  const minBend  = (od * 8).toFixed(0);
  const derated  = (rating * derating).toFixed(1);
  const totalCap = (rating * derating * parallel).toFixed(1);
  const copyDesc = `${desc} — OD ${od}mm — Rated ${rating}A — Derated ${derated}A`;
  return `
    <div class="spec">
      <div class="full"><div class="k">Cable Type</div><div class="v plain">${powerData.label}</div></div>
      <div><div class="k">Configuration</div><div class="v">${cores}-core ${csa} mm²${parallel>1?` × ${parallel} runs`:''}</div></div>
      <div><div class="k">Overall OD</div><div class="v hi">${od} <small>mm</small></div></div>
      ${innerOD ? `<div><div class="k">Inner Sheath OD <small>(for gland inner range)</small></div><div class="v">${innerOD} <small>mm</small></div></div>` : ''}
      <div><div class="k">Rated @45°C</div><div class="v">${rating} <small>A</small></div></div>
      <div><div class="k">Derated per run</div><div class="v hi">${derated} <small>A</small></div></div>
      ${parallel>1?`<div><div class="k">Total (${parallel} runs)</div><div class="v hi">${totalCap} <small>A</small></div></div>`:''}
      <div><div class="k">Weight</div><div class="v">${weight} <small>kg/km</small></div></div>
      <div><div class="k">Voltage Rating</div><div class="v">${powerData.voltage}</div></div>
      <div><div class="k">Min Bend Radius</div><div class="v">${minBend} <small>mm (8×OD)</small></div></div>
      <div class="full"><div class="k">Colour Code</div><div class="v plain">${powerData.colourCode}</div></div>
    </div>
    <div class="result-box" style="margin-top:12px">
      <span style="color:var(--text2);font-size:0.75rem">Cable description</span><br>
      <span style="font-family:var(--mono);font-size:0.82rem">${desc}</span>
      <button class="copy-btn" onclick="copyText(window._wtCableDesc)">Copy</button>
    </div>`;
}

// Convert Hawke NP suffix to NPT as preferred by supplier — used as the codeTransform
// passed into the shared gland renderers (js/data-glands.js) when NPT entry is selected.
function wtNptCode(raw) {
  return raw.replace(/NP$/, 'NPT');
}
