// ══════════════════════════════════════════════════════════
// WONDER TOOL — Motor → Cable → Gland one-stop shop
// IEC 60092-352, NEK 606, Hawke International
// ══════════════════════════════════════════════════════════

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

// NEMA_HP is defined in tab-calcs.js — reuse it here

let wtHz      = 50;   // 50 | 60 | '5060'
let wtGroup   = 1.00; // grouping derating factor

// ── Init ────────────────────────────────────────────────────
function initWonderTool() {
  document.getElementById('wt_temp_wrap').innerHTML =
    `<select id="wt_temp" onchange="wtCalc()">` +
    WT_TEMP.map(t =>
      `<option value="${t.factor}"${t.temp===45?' selected':''}>${t.label} (×${t.factor})</option>`
    ).join('') + `</select>`;

  wtSetHz(50); // renders power + voltage selects, then calls wtCalc
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
      hintEl.textContent = '💡 Typical IEC: 380 V, 400 V, 415 V, 440 V';
      hintEl.style.display = 'block';
    } else if (hz === 60) {
      hintEl.textContent = '💡 Typical NEMA: 440 V, 460 V, 480 V';
      hintEl.style.display = 'block';
    } else {
      hintEl.textContent = '💡 Typical 60 Hz supply: 440 V, 460 V, 480 V';
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
  const glandPref   = document.getElementById('wt_glandtype')?.value  || '453';
  const useNPT      = document.getElementById('wt_entry')?.value === 'npt';
  const corrFactor  = parseFloat(document.getElementById('wt_corr_factor')?.value || 1.15);

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

  const fla = (kwEffective * 1000) / (Math.sqrt(3) * volt * pf * eff);

  // ── Derating ──
  const combinedDerating = tempFactor * groupFactor;
  // requiredPerRun = minimum RATED cable current needed so that derated current ≥ FLA per run
  const requiredPerRun = fla / (combinedDerating * parallel);

  // ── Cable selection — filter on RATED current, derating already in requiredPerRun ──
  const powerData = CABLE_DATA[cableType]?.Power;
  if (!powerData) { result.innerHTML = `<p style="color:var(--danger)">Cable data not found.</p>`; return; }

  const allEntries = powerData.entries.filter(e => e[0] === cores).sort((a,b) => a[1]-b[1]);
  const candidates = allEntries.filter(e => e[4] >= requiredPerRun);

  if (!candidates.length) {
    result.innerHTML = `<div class="wt-alert">
      <strong>No cable found.</strong> No ${cores}-core ${cableType} cable rated ≥ ${requiredPerRun.toFixed(1)} A
      (FLA ${fla.toFixed(1)} A ÷ ${combinedDerating.toFixed(2)} combined derating${parallel>1?' ÷ '+parallel+' runs':''}).
      Consider parallel runs or checking the Cable &amp; Gland tab.
    </div>`;
    return;
  }

  const cable = candidates[0];
  const [cCores, cCSA, cOD, cWeight, cRating, cInnerOD] = cable;
  const showTotal  = parallel > 1;
  const cDerated = +(cRating * combinedDerating).toFixed(1);
  const totalCap = +(cDerated * parallel).toFixed(1);
  const headroom = (((showTotal ? totalCap : cDerated) / fla - 1) * 100).toFixed(0);

  // ── Cable comparison table slice ──
  const selIdx     = allEntries.findIndex(e => e[1] === cCSA);
  const tableSlice = allEntries.slice(Math.max(0, selIdx-2), Math.min(allEntries.length, selIdx+3));

  // ── Gland ──
  const glandResult = wtFindGland(glandPref, cOD);
  const tempObj    = WT_TEMP.find(t => Math.abs(t.factor - tempFactor) < 0.001);
  const tempLabel  = tempObj ? `${tempObj.temp}°C` : `×${tempFactor}`;
  const groupLabel = groupFactor === 1.00 ? '≤6 cables' : '>6 cables';
  const cableDesc  = `${cCores}-core ${cCSA}mm² ${cableType} 600/1000V`;
  const glandCode  = glandResult.match ? glandResult.orderCode : 'No match';

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
  ${headroom}% headroom over FLA${parallel>1?` (total ${totalCap} A)`:''}

Gland:    ${glandCode}  (${wtGlandTypeName(glandPref)})${glandResult.match?`
  Size ${glandResult.match.size} | Entry: ${useNPT?glandResult.match.npt:glandResult.match.metric}`:''}

Generated by M.E.T. v3.7 — tools.brigelectric.com`;

  window._wtCableDesc = `${parallel>1?parallel+' × ':''}${cableDesc} — OD ${cOD}mm — Rated ${cRating}A — Derated ${cDerated}A`;

  // ── Live FLA display in input section ──
  const flaEl = document.getElementById('wt_fla_display');
  if (flaEl) {
    const kwDisp = wtHz === '5060' ? `${kwEffective.toFixed(1)} kW (uprated)` : `${kwEffective.toFixed(1)} kW`;
    flaEl.innerHTML = `
      <div class="wt-fla-formula">
        FLA = (${kwDisp} × 1000) ÷ (√3 × ${volt} V × PF ${pf.toFixed(2)} × η ${eff.toFixed(2)})
      </div>
      <div class="wt-fla-result">= <strong>${fla.toFixed(2)} A</strong></div>`;
  }

  // ── Render ──────────────────────────────────────────────────
  const capLine = showTotal
    ? `derated ${cDerated} A/run, <strong>${totalCap} A total</strong>`
    : `derated <strong>${cDerated} A</strong>`;

  result.innerHTML = `
    <div class="wt-section-header">⚡ Recommendation</div>
    <div class="wt-summary-card">
      <p class="wt-summary-text">
        <strong>${modeLabel}</strong> at <strong>${volt} V</strong>${wtHz==='5060'?` — uprated to <strong>${kwEffective.toFixed(1)} kW</strong> at 60 Hz`:''}
        → FLA <strong>${fla.toFixed(1)} A</strong> (PF ${pf.toFixed(2)}, η ${eff.toFixed(2)}).
        Ambient ${tempLabel}, grouping ${groupLabel}: combined derating <strong>×${combinedDerating.toFixed(3)}</strong>.
        ${parallel>1?`<strong>${parallel} parallel runs</strong> — `:''}
        Select <strong>${parallel>1?parallel+' × ':''}${cableDesc}</strong>, rated ${cRating} A, ${capLine}, giving <strong>+${headroom}% headroom</strong>.
        ${glandResult.match
          ? `Gland: <span class="wt-inline-code">${glandCode}</span>.`
          : `<span style="color:var(--danger)">No ${wtGlandTypeName(glandPref)} gland found for OD ${cOD} mm.</span>`}
      </p>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" style="font-size:0.8rem" onclick="copyText(window._wtSummary)">⎘ Copy Summary</button>
        <button class="btn" style="font-size:0.8rem" onclick="window.print()">🖨 Print</button>
      </div>
    </div>

    <div class="wt-chips">
      <div class="wt-chip"><div class="wt-chip-label">FLA</div><div class="wt-chip-val">${fla.toFixed(2)} A</div></div>
      <div class="wt-chip"><div class="wt-chip-label">Min rated / run</div><div class="wt-chip-val">${requiredPerRun.toFixed(1)} A</div></div>
      <div class="wt-chip"><div class="wt-chip-label">Temp ×</div><div class="wt-chip-val">${tempFactor}</div></div>
      <div class="wt-chip"><div class="wt-chip-label">Group ×</div><div class="wt-chip-val">${groupFactor}</div></div>
      <div class="wt-chip"><div class="wt-chip-label">Combined</div><div class="wt-chip-val">×${combinedDerating.toFixed(3)}</div></div>
      ${showTotal?`<div class="wt-chip"><div class="wt-chip-label">Runs</div><div class="wt-chip-val">${parallel}</div></div>`:''}
      <div class="wt-chip wt-chip-accent"><div class="wt-chip-label">Headroom</div><div class="wt-chip-val">+${headroom}%</div></div>
    </div>

    <div class="wt-section-header" style="margin-top:24px">📊 Cable Size Comparison
      <span style="font-size:0.72rem;font-weight:400;color:var(--text2)">IEC 60092-352 / NEK 606</span>
    </div>
    ${wtCableTable(tableSlice, cCSA, fla, combinedDerating, parallel)}

    <div class="wt-section-header" style="margin-top:24px">🔌 Selected Cable</div>
    <div class="gland-card">
      ${wtCableCard(cCores, cCSA, cOD, cWeight, cRating, cInnerOD, powerData, combinedDerating, parallel, cableDesc)}
    </div>

    <div class="wt-section-header" style="margin-top:24px">🔩 Gland — ${wtGlandTypeName(glandPref)}</div>
    ${wtGlandCard(glandPref, cOD, useNPT)}

    <div class="wt-disclaimer">
      ⚠ Indicative results only. Always verify FLA against motor nameplate, confirm cable
      selection against project derating schedule and installation conditions, and check gland
      selection against Hawke datasheets before ordering. IEC 60092-352:2016 Table B.4.
    </div>`;
}

function wtPrompt() {
  const flaEl = document.getElementById('wt_fla_display');
  if (flaEl) flaEl.innerHTML = '';
  return `<p style="color:var(--text2);padding:16px 0">Enter motor power and voltage above to get a recommendation.</p>`;
}

// ── Gland helpers ────────────────────────────────────────────
function wtFindGland(glandPref, OD) {
  if (glandPref === '453') {
    const m = GLAND_453.find(g => OD >= g.outerMin && OD <= g.outerMax);
    return { match: m, orderCode: m ? getGlandOrderCode('453', m.size, 'metric', m.metric) : null };
  } else if (glandPref === '653') {
    const m = GLAND_653.find(g => OD >= g.outerMin && OD <= g.outerMax);
    return { match: m, orderCode: m ? getGlandOrderCode('653', m.size, 'metric', m.metric) : null };
  } else {
    const m = GLAND_421.find(g => OD >= g.stdMin && OD <= g.stdMax) ||
              GLAND_421.find(g => g.altMin && OD >= g.altMin && OD <= g.altMax);
    return { match: m, orderCode: m ? getGlandOrderCode('421', m.size, 'metric', m.metric) : null };
  }
}

function wtGlandTypeName(pref) {
  return pref==='453' ? 'Hawke Braided Gland (501/453/UNIV)'
       : pref==='653' ? 'Hawke Barrier Gland (ICG/653/UNIV)'
       : 'Hawke Compression Gland (501/421/UNIV)';
}

// ── Cable comparison table ────────────────────────────────────
function wtCableTable(entries, selCSA, fla, derating, parallel) {
  const showTotal = parallel > 1;
  const rows = entries.map(e => {
    const [cores, csa, od, , rated] = e;
    const derated  = +(rated * derating).toFixed(1);
    const totalCap = +(derated * parallel).toFixed(1);
    const ratio    = (showTotal ? totalCap : derated) / fla;
    const isSel    = csa === selCSA;
    let statusTag, rowClass;
    if (ratio >= 1.10) {
      statusTag = `<span class="tag tag-green">✓ OK</span>`;
      rowClass  = isSel ? 'wt-row-selected wt-row-green' : 'wt-row-green';
    } else if (ratio >= 1.0) {
      statusTag = `<span class="tag tag-yellow">~ Borderline</span>`;
      rowClass  = isSel ? 'wt-row-selected wt-row-orange' : 'wt-row-orange';
    } else {
      statusTag = `<span class="tag tag-red">✗ Under</span>`;
      rowClass  = isSel ? 'wt-row-selected' : 'wt-row-red';
    }
    const marker = isSel ? '<span class="wt-sel-arrow">▶</span> ' : '';
    return `<tr class="${rowClass}">
      <td style="font-family:var(--mono);font-weight:${isSel?700:400}">${marker}${cores}C × ${csa} mm²</td>
      <td style="font-family:var(--mono)">${rated} A</td>
      <td style="font-family:var(--mono)">${derated} A</td>
      ${showTotal ? `<td style="font-family:var(--mono)">${totalCap} A</td>` : ''}
      <td>${od} mm</td>
      <td>${statusTag}</td>
    </tr>`;
  }).join('');

  return `<table class="wt-table">
    <thead><tr>
      <th>Cable</th><th>Rated (A)</th><th>Derated / run</th>
      ${showTotal ? `<th>Total (${parallel} runs)</th>` : ''}
      <th>OD</th><th>vs ${fla.toFixed(1)} A FLA</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ── Cable detail card ─────────────────────────────────────────
function wtCableCard(cores, csa, od, weight, rating, innerOD, powerData, derating, parallel, desc) {
  const minBend  = (od * 8).toFixed(0);
  const derated  = (rating * derating).toFixed(1);
  const totalCap = (rating * derating * parallel).toFixed(1);
  const copyDesc = `${desc} — OD ${od}mm — Rated ${rating}A — Derated ${derated}A`;
  return `
    <div class="gland-info-grid">
      <div class="gland-info-item"><div class="key">Cable Type</div><div class="val" style="font-size:0.8rem">${powerData.label}</div></div>
      <div class="gland-info-item"><div class="key">Configuration</div><div class="val">${cores}-core ${csa} mm²${parallel>1?` × ${parallel} runs`:''}</div></div>
      <div class="gland-info-item"><div class="key">Overall OD</div><div class="val" style="color:var(--accent);font-size:1.1rem">${od} mm</div></div>
      ${innerOD ? `<div class="gland-info-item"><div class="key">Inner Sheath OD <span style="font-size:0.7rem;color:var(--text3)">(for gland inner range)</span></div><div class="val">${innerOD} mm</div></div>` : ''}
      <div class="gland-info-item"><div class="key">Rated @45°C</div><div class="val">${rating} A</div></div>
      <div class="gland-info-item"><div class="key">Derated per run</div><div class="val" style="color:var(--accent)">${derated} A</div></div>
      ${parallel>1?`<div class="gland-info-item"><div class="key">Total (${parallel} runs)</div><div class="val" style="color:var(--success)">${totalCap} A</div></div>`:''}
      <div class="gland-info-item"><div class="key">Weight</div><div class="val">${weight} kg/km</div></div>
      <div class="gland-info-item"><div class="key">Voltage Rating</div><div class="val">${powerData.voltage}</div></div>
      <div class="gland-info-item"><div class="key">Min Bend Radius</div><div class="val">${minBend} mm (8×OD)</div></div>
      <div class="gland-info-item" style="grid-column:1/-1"><div class="key">Colour Code</div><div class="val" style="font-size:0.8rem">${powerData.colourCode}</div></div>
    </div>
    <div class="result-box" style="margin-top:12px">
      <span style="color:var(--text2);font-size:0.75rem">Cable description</span><br>
      <span style="font-family:var(--mono);font-size:0.82rem">${desc}</span>
      <button class="copy-btn" onclick="copyText(window._wtCableDesc)">⎘</button>
    </div>`;
}

// ── Gland card ────────────────────────────────────────────────
function wtGlandCard(glandPref, OD, useNPT) {
  if (glandPref === '453') {
    const g = GLAND_453.find(g => OD >= g.outerMin && OD <= g.outerMax);
    if (!g) return `<div class="gland-card"><div class="gland-card-header">Hawke 501/453/UNIV <span class="tag tag-red">NO MATCH</span></div><p style="color:var(--text2)">OD ${OD}mm outside the 501/453 outer sheath range.</p></div>`;
    const entry = useNPT ? g.npt.split(' ')[0] : g.metric;
    const code  = getGlandOrderCode('453', g.size, useNPT?'npt':'metric', entry);
    const metEx = `501/453/UNIV/${g.size}/${g.metric.replace('/','-')}`;
    const nptEx = `501/453/UNIV/${g.size}/${g.npt.split(' ')[0].replace('"','').replace('/','')+'NP'}`;
    return `<div class="gland-card">
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:10px">
        <img src="jpg/501-453.jpg" alt="Hawke 501/453/UNIV" style="width:180px;border-radius:6px;border:1px solid var(--border);flex-shrink:0">
        <div style="flex:1">
          <div class="gland-card-header" style="margin-bottom:6px">Hawke 501/453/UNIV — Armoured / Braided <span class="tag tag-blue">ARMOURED</span></div>
          <p style="font-size:0.78rem;color:var(--text2)">Dual certified Exe/Exd. Passive diaphragm seal. Reversible armour clamp for SWA, wire braid, steel tape. IP66/67/68/69.</p>
        </div>
      </div>
      <div class="gland-info-grid">
        <div class="gland-info-item"><div class="key">Size Ref</div><div class="val">${g.size}</div></div>
        <div class="gland-info-item"><div class="key">${useNPT?'NPT Entry':'Metric Entry'}</div><div class="val">${useNPT?g.npt:g.metric}</div></div>
        <div class="gland-info-item"><div class="key">Inner Sheath Range</div><div class="val">${g.innerMin}–${g.innerMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Outer Sheath Range</div><div class="val">${g.outerMin}–${g.outerMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Armour Wire Ø</div><div class="val">${g.arm1} mm</div></div>
        <div class="gland-info-item"><div class="key">Cable OD ${OD}mm</div><div class="val"><span class="tag tag-green">FITS</span></div></div>
      </div>
      <div class="result-box" style="margin-top:12px">
        <span style="color:var(--text2);font-size:0.75rem">Order code</span><br>
        <span style="font-family:var(--mono);font-size:0.88rem">${code}</span>
        <button class="copy-btn" onclick="copyText('${code}')">⎘</button>
      </div>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text2)">Metric: <code>${metEx}</code> &nbsp;|&nbsp; NPT: <code>${nptEx}</code></div>
      ${useNPT?'<div style="margin-top:6px;font-size:0.75rem;color:var(--warn)">⚠️ NPT entries in ATEX zones require certified adapters — check MOC implications</div>':''}
    </div>`;

  } else if (glandPref === '653') {
    const g = GLAND_653.find(g => OD >= g.outerMin && OD <= g.outerMax);
    if (!g) return `<div class="gland-card"><div class="gland-card-header">Hawke ICG/653/UNIV <span class="tag tag-red">NO MATCH</span></div><p style="color:var(--text2)">OD ${OD}mm outside the ICG/653 outer sheath range.</p></div>`;
    const entry = useNPT ? g.npt.split(' ')[0] : g.metric;
    const code  = getGlandOrderCode('653', g.size, useNPT?'npt':'metric', entry);
    const metEx = `ICG/653/UNIV/${g.size}/${g.metric}`;
    const nptEx = `ICG/653/UNIV/${g.size}/${g.npt.split(' ')[0].replace('"','').replace('/','')+'NP'}`;
    return `<div class="gland-card">
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:10px">
        <img src="jpg/icg653.jpg" alt="Hawke ICG/653/UNIV" style="width:180px;border-radius:6px;border:1px solid var(--border);flex-shrink:0">
        <div style="flex:1">
          <div class="gland-card-header" style="margin-bottom:6px">Hawke ICG/653/UNIV — Barrier Gland <span class="tag tag-orange">BARRIER</span></div>
          <p style="font-size:0.78rem;color:var(--text2)">Dual certified Exe/Exd. Seals around individual cores. Cold flow, hygroscopic fillers, fibre optic cables. ExPress resin standard. QSP available (suffix Q).</p>
        </div>
      </div>
      <div class="gland-info-grid">
        <div class="gland-info-item"><div class="key">Size Ref</div><div class="val">${g.size}</div></div>
        <div class="gland-info-item"><div class="key">${useNPT?'NPT Entry':'Metric Entry'}</div><div class="val">${useNPT?g.npt:g.metric}</div></div>
        <div class="gland-info-item"><div class="key">Max Inner Sheath</div><div class="val">${g.innerMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Max Core Ø</div><div class="val">${g.coreMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Outer Sheath Range</div><div class="val">${g.outerMin}–${g.outerMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Cable OD ${OD}mm</div><div class="val"><span class="tag tag-green">FITS</span></div></div>
      </div>
      <div class="result-box" style="margin-top:12px">
        <span style="color:var(--text2);font-size:0.75rem">Order code</span><br>
        <span style="font-family:var(--mono);font-size:0.88rem">${code}</span>
        <button class="copy-btn" onclick="copyText('${code}')">⎘</button>
      </div>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text2)">Metric: <code>${metEx}</code> &nbsp;|&nbsp; NPT: <code>${nptEx}</code></div>
      ${useNPT?'<div style="margin-top:6px;font-size:0.75rem;color:var(--warn)">⚠️ NPT entries in ATEX zones require certified adapters — check MOC implications</div>':''}
    </div>`;

  } else {
    const g    = GLAND_421.find(g => OD >= g.stdMin && OD <= g.stdMax);
    const gAlt = g ? null : GLAND_421.find(g => g.altMin && OD >= g.altMin && OD <= g.altMax);
    const gland = g || gAlt;
    if (!gland) return `<div class="gland-card"><div class="gland-card-header">Hawke 501/421/UNIV <span class="tag tag-red">NO MATCH</span></div><p style="color:var(--text2)">OD ${OD}mm outside the 501/421 selection range.</p></div>`;
    const isSeal = g ? 'Standard Seal' : 'Alternative Seal (S)';
    const sealTag = g ? 'tag-green' : 'tag-yellow';
    const entry   = useNPT ? gland.npt.split(' ')[0] : gland.metric;
    const code    = getGlandOrderCode('421', gland.size, useNPT?'npt':'metric', entry) + (gAlt?'S':'');
    const metEx   = `501/421/UNIV/${gland.size}/${gland.metric}`;
    const nptEx   = `501/421/UNIV/${gland.size}/${gland.npt.split(' ')[0].replace('"','').replace('/','')+'NP'}`;
    return `<div class="gland-card">
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:10px">
        <img src="jpg/501-421.jpg" alt="Hawke 501/421" style="width:180px;border-radius:6px;border:1px solid var(--border);flex-shrink:0">
        <div style="flex:1">
          <div class="gland-card-header" style="margin-bottom:6px">Hawke 501/421/UNIV — Compression, Non-Armoured <span class="tag ${sealTag}">${isSeal}</span></div>
          <p style="font-size:0.78rem;color:var(--text2)">Dual certified Exe/Exd. For non-armoured elastomer and plastic insulated cables. Braid cables: braid passes into enclosure and terminates inside.</p>
        </div>
      </div>
      <div class="gland-info-grid">
        <div class="gland-info-item"><div class="key">Size Ref</div><div class="val">${gland.size}</div></div>
        <div class="gland-info-item"><div class="key">${useNPT?'NPT Entry':'Metric Entry'}</div><div class="val">${useNPT?gland.npt:gland.metric}</div></div>
        <div class="gland-info-item"><div class="key">Std Seal OD Range</div><div class="val">${gland.stdMin}–${gland.stdMax} mm</div></div>
        ${gland.altMin?`<div class="gland-info-item"><div class="key">Alt Seal OD Range</div><div class="val">${gland.altMin}–${gland.altMax} mm</div></div>`:''}
        <div class="gland-info-item"><div class="key">Cable OD ${OD}mm</div><div class="val"><span class="tag ${g?'tag-green':gAlt?'tag-yellow':'tag-red'}">${g?'STD FIT':gAlt?'ALT FIT':'NO FIT'}</span></div></div>
      </div>
      <div class="result-box" style="margin-top:12px">
        <span style="color:var(--text2);font-size:0.75rem">Order code</span><br>
        <span style="font-family:var(--mono);font-size:0.88rem">${code}</span>
        <button class="copy-btn" onclick="copyText('${code}')">⎘</button>
      </div>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text2)">Metric: <code>${metEx}</code> &nbsp;|&nbsp; NPT: <code>${nptEx}</code></div>
      ${useNPT?'<div style="margin-top:8px;font-size:0.75rem;color:var(--warn)">⚠️ NPT entries in ATEX zones require certified adapters — check MOC implications</div>':''}
    </div>`;
  }
}
