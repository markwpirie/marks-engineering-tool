// ══════════════════════════════════════════════════════════
// TAB — GLANDING V2 (sandbox — see Cable & Gland tab for the live version)
// ══════════════════════════════════════════════════════════
// Cable-selector glue below is a deliberate duplicate of tab-cable.js's, not a shared helper — this
// tab exists to iterate on the gland recommender without any risk of regressing the live Cable &
// Gland tab. Both read the same CABLE_DATA (js/data-cable.js), so cable data itself is never
// duplicated, only the small amount of dropdown-population glue. Ambient temperature correction is
// intentionally left out here — it's orthogonal to the gland-fit workflow this tab is about.

let currentGlandTabV2 = 'metric';

// Datasheet-derived OD/innerOD for the currently selected cable — kept so applyGlandManualOverrideV2
// can fall back to book values when a manual entry field is cleared, without re-deriving them from
// the dropdowns. Reset by showCableResultV2 on every cable selection change.
let gv2Base = { OD: null, odTol: null, innerOD: null, innerODTol: null };

function switchGlandTabV2(tab) {
  currentGlandTabV2 = tab;
  document.getElementById('gv2-gland-metric-btn').classList.toggle('active', tab === 'metric');
  document.getElementById('gv2-gland-npt-btn').classList.toggle('active', tab === 'npt');
  showCableResultV2();
}

function updateCableAppV2() { updateCableCoresV2(); }

// See tab-cable.js's parseCoresVal/sortCores for why this can't just be parseInt — Power/Earth
// 'cores' can be a Draka 'NG' earth-variant code (e.g. "3G") as well as a plain number.
function parseCoresValV2(v) { return /G$/i.test(v) ? v : parseInt(v, 10); }

function sortCoresV2(a, b) {
  const na = parseInt(a, 10), nb = parseInt(b, 10);
  if (na !== nb) return na - nb;
  return String(a).length - String(b).length;
}

function updateCableCoresV2() {
  const rating = document.getElementById('gv2_rating').value;
  const app = document.getElementById('gv2_app').value;
  const sel = document.getElementById('gv2_cores');
  const prevVal = sel.value;
  sel.innerHTML = '';

  if (app === 'Earth') {
    const csas = [...new Set(CABLE_DATA[rating].Earth.entries.map(e => e.csa))].sort((a, b) => a - b);
    csas.forEach(c => sel.add(new Option(c + ' mm²', c)));
    restoreSelectValue(sel, prevVal);
    updateCableCSAV2();
    return;
  }

  const data = CABLE_DATA[rating][app];
  if (!data) return;
  const isPower = app === 'Power';

  if (isPower) {
    const cores = [...new Set(data.entries.map(e => e.cores))].sort(sortCoresV2);
    cores.forEach(c => {
      const label = /G$/i.test(c) ? `${c} (earth core)` : `${c} ${c === 1 ? 'core' : 'cores'}`;
      sel.add(new Option(label, c));
    });
  } else {
    const combos = [...new Set(data.entries.map(e => `${e.type}-${e.elements}`))];
    combos.sort((a, b) => parseInt(a.split('-')[1], 10) - parseInt(b.split('-')[1], 10));
    combos.forEach(c => {
      const [type, count] = c.split('-');
      const plural = count !== '1';
      const noun = type === 'PR' ? 'Pair' : type === 'TR' ? 'Triple' : 'Quad';
      sel.add(new Option(`${count} ${noun}${plural ? 's' : ''}`, c));
    });
  }
  restoreSelectValue(sel, prevVal);
  updateCableCSAV2();
}

function updateCableCSAV2() {
  const rating = document.getElementById('gv2_rating').value;
  const app = document.getElementById('gv2_app').value;
  const coresVal = document.getElementById('gv2_cores').value;
  const csaSel = document.getElementById('gv2_csa');
  const prevVal = csaSel.value;
  csaSel.innerHTML = '';

  if (app === 'Earth') {
    const csa = parseFloat(coresVal);
    csaSel.add(new Option(csa + ' mm²', csa));
    showCableResultV2(); return;
  }

  const data = CABLE_DATA[rating][app];
  if (!data) return;
  const isPower = app === 'Power';

  if (isPower) {
    const cores = parseCoresValV2(coresVal);
    data.entries.filter(e => e.cores === cores).forEach(e => csaSel.add(new Option(e.csa + ' mm²', e.csa)));
  } else {
    const [type, count] = coresVal.split('-');
    data.entries.filter(e => e.type === type && e.elements === parseInt(count, 10)).forEach(e => csaSel.add(new Option(e.csa + ' mm²', e.csa)));
  }
  restoreSelectValue(csaSel, prevVal);
  showCableResultV2();
}

function showCableResultV2() {
  const rating = document.getElementById('gv2_rating').value;
  const app = document.getElementById('gv2_app').value;
  const coresVal = document.getElementById('gv2_cores').value;
  const csa = parseFloat(document.getElementById('gv2_csa').value);
  const data = CABLE_DATA[rating][app];
  if (!data) return;

  let entry, OD, innerOD, weight, current;
  const isPower = app === 'Power';
  const isEarth = app === 'Earth';

  if (isEarth) {
    entry = data.entries.find(e => e.csa === csa);
    if (!entry) return;
    OD = entry.od; weight = entry.weight; current = entry.current; innerOD = null;
  } else if (isPower) {
    const cores = parseCoresValV2(coresVal);
    entry = data.entries.find(e => e.cores === cores && e.csa === csa);
    if (!entry) return;
    OD = entry.od; weight = entry.weight; current = entry.current; innerOD = entry.innerOD;
  } else {
    const [type, count] = coresVal.split('-');
    entry = data.entries.find(e => e.type === type && e.elements === parseInt(count, 10) && e.csa === csa);
    if (!entry) return;
    OD = entry.od; weight = entry.weight; current = null; innerOD = entry.innerOD;
  }

  const minBend = (OD * 8).toFixed(0);
  const fixedBend = (OD * 6).toFixed(0);
  let extras = '';
  if (isPower || isEarth) {
    if (entry.insDiam != null) extras += `<div><div class="k">Conductor OD Over Insulation</div><div class="v">${entry.insDiam}${entry.insDiamTol ? ' ± ' + entry.insDiamTol : ''} <small>mm</small></div></div>`;
    if (entry.condDiam != null) extras += `<div><div class="k">Conductor OD</div><div class="v">${entry.condDiam} <small>mm</small></div></div>`;
    if (entry.r20 != null) extras += `<div><div class="k">Conductor R (20°C / 90°C)</div><div class="v">${entry.r20} / ${entry.r90} <small>Ω/km</small></div></div>`;
    if (entry.x50 != null) extras += `<div><div class="k">Reactance (50Hz / 60Hz)</div><div class="v">${entry.x50} / ${entry.x60} <small>Ω/km</small></div></div>`;
    if (entry.sc1s) extras += `<div><div class="k">Short-circuit (1s)</div><div class="v">${entry.sc1s} <small>A</small></div></div>`;
    extras += `<div><div class="k">Weight</div><div class="v">${weight} <small>kg/km</small></div></div>`;
    if (entry.copper) extras += `<div><div class="k">Copper Content</div><div class="v">${entry.copper} <small>kg/km</small></div></div>`;
  } else if (data.electrical) {
    const elec = (INSTR_ELECTRICAL[data.electrical] || {})[csa];
    if (elec) {
      extras += `<div><div class="k">Capacitance</div><div class="v">${elec.cap} <small>nF/km</small></div></div>`;
      extras += `<div><div class="k">Inductance</div><div class="v">${elec.ind} <small>mH/km</small></div></div>`;
      extras += `<div><div class="k">Loop Resistance</div><div class="v">${elec.r} <small>Ω/km</small></div></div>`;
      extras += `<div><div class="k">L/R Ratio</div><div class="v">${elec.lr} <small>µH/Ω</small></div></div>`;
    }
  }

  let html = `<div class="spec">
    <div class="full"><div class="k">Cable Type</div><div class="v plain">${data.label}</div></div>
    <div><div class="k">Overall OD</div><div class="v hi">${OD}${entry.odTol ? ' ± ' + entry.odTol : ''} <small>mm</small></div>${glandManualEntryInputHTML('gv2_od_manual', 'Measured OD')}</div>
    ${innerOD ? `<div><div class="k">OD over inner insulation</div><div class="v">${innerOD}${entry.innerODTol ? ' ± ' + entry.innerODTol : ''} <small>mm</small></div>${glandManualEntryInputHTML('gv2_innerod_manual', 'Measured inner OD')}</div>` : ''}
    <div><div class="k">Min. Bend Radius</div><div class="v">${minBend} <small>mm install</small> / ${fixedBend} <small>mm fixed</small></div></div>
    ${current ? `<div><div class="k">Current @45°C</div><div class="v hi">${current} <small>A</small></div></div>` : ''}
    <div><div class="k">Voltage Rating</div><div class="v">${data.voltage}</div></div>
    ${extras}
    <div class="full"><div class="k">Colour Code</div><div class="v plain">${data.colourCode}</div></div>
  </div>
  ${entry.unverified ? `<div class="notice"><svg><use href="#i-warn"/></svg><span>Unverified — not present in the Draka NEK 606 datasheet; retained from the previous dataset. Confirm with manufacturer before use.</span></div>` : ''}`;

  document.getElementById('gv2_cableResult').innerHTML = html;

  // The manual-entry inputs just rendered are always empty (fresh elements), so this starts back
  // at the book values — any override from a previous cable selection is intentionally dropped
  // rather than silently carried over to a different cable.
  gv2Base = { OD, odTol: entry.odTol, innerOD, innerODTol: entry.innerODTol };
  applyGlandManualOverrideV2();
}

// Small number input for overriding a book OD figure with a physically measured value — for
// checking gland suitability against an actual cable rather than the datasheet. Left blank, the
// book value (gv2Base) is used untouched; the book figure itself is never overwritten, only what
// feeds the gland recommender.
function glandManualEntryInputHTML(id, placeholder) {
  return `<input type="number" id="${id}" step="0.1" min="0" placeholder="${placeholder} (mm)"
    title="Override with a physically measured value for gland fit checking — leave blank to use the book value"
    style="display:block;margin-top:6px;width:100%;max-width:200px;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-ctl);padding:4px 8px;font-family:var(--mono);font-size:0.78rem;color:var(--text)"
    oninput="applyGlandManualOverrideV2()">`;
}

// Reads the manual-entry inputs (if present/non-empty) and re-runs the gland recommender with
// whichever measured value(s) are set, falling back to gv2Base's book value otherwise. A measured
// value is treated as exact — 0 tolerance — since it's an actual reading, not a book range.
function applyGlandManualOverrideV2() {
  const odEl = document.getElementById('gv2_od_manual');
  const innerEl = document.getElementById('gv2_innerod_manual');
  const odVal = odEl && odEl.value !== '' ? parseFloat(odEl.value) : NaN;
  const innerVal = innerEl && innerEl.value !== '' ? parseFloat(innerEl.value) : NaN;
  const odManual = !isNaN(odVal);
  const innerManual = !isNaN(innerVal);

  const OD = odManual ? odVal : gv2Base.OD;
  const odTol = odManual ? 0 : gv2Base.odTol;
  const innerOD = innerManual ? innerVal : gv2Base.innerOD;
  const innerODTol = innerManual ? 0 : gv2Base.innerODTol;

  showGlandRecV2(OD, odTol, innerOD, innerODTol, odManual, innerManual);
}

// ── Gland recommender — cable-data summary strip + adjacent-size candidates ─
function showGlandRecV2(OD, odTol, innerOD, innerODTol, odManual, innerManual) {
  const useNPT = currentGlandTabV2 === 'npt';
  document.getElementById('gv2_cableSummary').innerHTML = renderGlandRecSummaryV2(OD, odTol, innerOD, innerODTol, odManual, innerManual);
  document.getElementById('gv2_glandResults').innerHTML = renderAllGlandFamiliesV2(OD, odTol, innerOD, innerODTol, useNPT, odManual, innerManual);
}

// Copies the OD figures that justified the recommendation down next to the recommendation itself,
// so checking a pick doesn't mean scrolling back up to the Cable Selector card. Only real datasheet
// values are shown by default — no derived "OD over cores" figure, since no cable datasheet in this
// tool publishes the bundled-core dimension the barrier gland's "Max Over Cores" bore actually
// checks. When a figure was overridden with a measured value, it's flagged as such so it's clear
// the recommendation isn't purely off the book data.
function renderGlandRecSummaryV2(OD, odTol, innerOD, innerODTol, odManual, innerManual) {
  const measuredNote = `<div style="font-size:0.7rem;color:var(--accent);margin-top:2px">Measured value — 0mm tolerance</div>`;
  return `<div class="spec" style="margin-bottom:14px">
    <div><div class="k">Overall OD</div><div class="v hi">${OD}${odTol ? ' ± ' + odTol : ''} <small>mm</small></div>${odManual ? measuredNote : ''}</div>
    ${innerOD ? `<div><div class="k">OD over inner insulation</div><div class="v">${innerOD}${innerODTol ? ' ± ' + innerODTol : ''} <small>mm</small></div>${innerManual ? measuredNote : ''}</div>` : ''}
  </div>`;
}

function renderAllGlandFamiliesV2(OD, odTol, innerOD, innerODTol, useNPT, odManual, innerManual) {
  let html = `<div class="family">
    <img src="jpg/501-453.jpg" alt="Hawke 501/453/UNIV cable gland cross-section">
    <div>
      <h3>Hawke 501/453/UNIV — Coldflow, Armoured/Braided</h3>
      <p>Dual certified Exe/Exd. Passive diaphragm seal for cold flow cables. Reversible armour clamp for SWA, wire braid, steel tape. IP66/67/68/69.</p>
    </div>
  </div>`;
  html += renderGlandFamilySectionV2('453', GLAND_453, OD, odTol, innerOD, innerODTol, useNPT, odManual, innerManual);

  html += `<div class="family">
    <img src="jpg/icg653.jpg" alt="Hawke ICG/653/UNIV barrier gland cross-section">
    <div>
      <h3>Hawke ICG/653/UNIV — Barrier</h3>
      <p>Dual certified Exe/Exd. Seals around individual cores. Cold flow, hygroscopic fillers, fibre optic cables. ExPress resin standard (30 min cure). QSP available (suffix Q).</p>
    </div>
  </div>`;
  html += renderGlandFamilySectionV2('653', GLAND_653, OD, odTol, innerOD, innerODTol, useNPT, odManual, innerManual);

  html += `<div class="family">
    <img src="jpg/501-421.jpg" alt="Hawke 501/421 cable gland cross-section">
    <div>
      <h3>Hawke 501/421/UNIV — Compression, Non-Armoured</h3>
      <p>Dual certified Exe/Exd. For non-armoured elastomer and plastic insulated cables. Braid cables: braid passes into enclosure and terminates inside.</p>
    </div>
  </div>`;
  html += renderGlandFamilySectionV2('421', GLAND_421, OD, odTol, innerOD, innerODTol, useNPT, odManual, innerManual);

  return html;
}

// Renders exactly one card by default — the recommendation — plus "show size below/above"
// toggles bracketing it. Any OTHER nominally-fitting-but-not-recommended size (e.g. a smaller size
// that only fits at book value while the recommendation fits full tolerance) is folded into those
// same toggles rather than listed alongside the recommendation, so there's only ever one visible
// gland by default. When nothing fits at all, shows the closest candidates inline instead, since
// that's exactly the case with nothing else to look at.
function renderGlandFamilySectionV2(type, list, OD, odTol, innerOD, innerODTol, useNPT, odManual, innerManual) {
  const matches = type === '421'
    ? findFitting421(OD, odTol)
    : findFittingGlands(list, OD, odTol, innerOD, innerODTol);
  const recommended = pickRecommendedGland(matches);
  const adj = glandAdjacentSizes(type, list, recommended, OD);
  const row = (g, isRecommended, sizeLabel) => renderGlandRowV2(type, g, OD, odTol, innerOD, innerODTol, useNPT, { isRecommended, sizeLabel, odManual, innerManual });

  if (recommended) {
    const mainHTML = row(recommended, true, 'Size ref');
    const below = adj.below ? glandToggleBlockV2('size below', row(adj.below, false, 'One size down')) : '';
    const above = adj.above ? glandToggleBlockV2('size above', row(adj.above, false, 'One size up')) : '';
    return below + mainHTML + above + (useNPT ? GLAND_NPT_ATEX_NOTICE : '');
  }

  const noneMsg = `<p style="color:var(--text2)">No size in this family covers the given cable OD${type === '421' ? ' (std or alternative seal)' : ''}.</p>`;
  if (!adj.below && !adj.anchor && !adj.above) return noneMsg;

  return noneMsg + `<div style="margin-top:10px">
    <p style="color:var(--text2);font-size:0.8rem;margin-bottom:6px">Closest candidates — none satisfy every dimension, shown for reference:</p>
    ${adj.below ? row(adj.below, false, 'One size down') : ''}
    ${adj.anchor ? row(adj.anchor, false, 'Closest size') : ''}
    ${adj.above ? row(adj.above, false, 'One size up') : ''}
  </div>` + (useNPT ? GLAND_NPT_ATEX_NOTICE : '');
}

// Hidden-by-default toggle + panel — same self-contained inline-onclick pattern already used for
// the Wonder Tool's "Show standard text" toggle (index.html), so no per-instance element IDs needed.
function glandToggleBlockV2(what, panelHTML) {
  return `<div style="margin-top:8px">
    <button class="btn" style="font-size:0.72rem;padding:4px 10px" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none';this.textContent=this.textContent.includes('▶')?'▼ Hide ${what}':'▶ Show ${what}'">▶ Show ${what}</button>
    <div style="display:none;margin-top:8px">${panelHTML}</div>
  </div>`;
}

// "<label> <b>value</b>" in the same style as the shared renderGlandSizeList's .meta spans.
function glandDimLabelHTML(label, valueText) {
  return `<div style="font-size:0.78rem;color:var(--text2)">${label} <b style="font-family:var(--mono);font-weight:500;color:var(--text)">${valueText}</b></div>`;
}

// A single dimension's own pass/fail badge + (if not a clean full-tolerance fit) a short reason —
// deliberately scoped to ONE dimension so it can sit directly under that dimension's value, rather
// than one combined badge for the whole card that doesn't say which dimension it's about.
function glandDimStatusHTML(val, tol, min, max) {
  if (val == null) return '';
  const reason = glandDimFailReason('', val, tol, min, max);
  const badge = !reason
    ? `<span class="badge pass"><svg><use href="#i-check"/></svg>Fits full tolerance</span>`
    : reason.level === 'warn'
      ? `<span class="badge pass"><svg><use href="#i-check"/></svg>Fits book value</span> <span class="badge warn"><svg><use href="#i-warn"/></svg>Tolerance edge</span>`
      : `<span class="badge fail"><svg><use href="#i-x"/></svg>Does not fit</span>`;
  const detail = reason
    ? `<div style="margin-top:3px;font-size:0.7rem;color:${reason.level === 'fail' ? 'var(--fail)' : 'var(--warn)'}">${reason.text.trim()}</div>`
    : '';
  return badge + detail;
}

// The cable's own measured/book value for one dimension, boxed so it visually reads as "what's
// being checked" rather than more gland spec — sits directly under that dimension's fit badge, next
// to the gland's own bore range, so the comparison doesn't need a trip back up to the summary strip.
function glandCableValueBoxHTML(label, val, tol, isManual) {
  if (val == null) return '';
  const tolText = isManual ? '' : (tol ? ` ± ${tol}` : '');
  return `<div style="margin-top:5px;padding:2px 7px;border:1px solid var(--accent);border-radius:var(--r-ctl);font-size:0.72rem;color:var(--accent);display:inline-block">${label} <b>${val}${tolText} mm</b>${isManual ? ' (measured)' : ''}</div>`;
}

// One size's card — used for both the single recommended card and the below/above candidates, so
// they look identical apart from the "Recommended" badge and dashed border. Each checked dimension
// (outer + inner sheath for 453/653, the one OD range for 421) is its own group: the gland's bore
// value, that dimension's own status badge, then the cable's own value it was checked against.
function renderGlandRowV2(type, g, od, odTol, innerOD, innerODTol, useNPT, opts) {
  const entryVal = useNPT ? g.npt.split(' ')[0] : g.metric;
  let orderCode, dimGroups;

  if (type === '421') {
    const [min, max] = glandPrimaryRange('421', g, od);
    const isAlt = g.altMin != null && min === g.altMin;
    orderCode = getGlandOrderCode('421', g.size, useNPT ? 'npt' : 'metric', entryVal) + (isAlt ? 'S' : '');
    dimGroups = `<div style="min-width:170px">
      ${glandDimLabelHTML(isAlt ? 'Alt seal OD' : 'Std seal OD', `${min}–${max} mm`)}
      <div style="margin-top:4px">${glandDimStatusHTML(od, odTol, min, max)}</div>
      ${glandCableValueBoxHTML('Cable OD', od, odTol, opts.odManual)}
    </div>`;
  } else {
    orderCode = getGlandOrderCode(type, g.size, useNPT ? 'npt' : 'metric', entryVal);
    const innerLabel = type === '453' ? 'Inner sheath' : 'Max inner sheath';
    const innerRange = type === '453' ? `${g.innerMin}–${g.innerMax} mm` : `${g.innerMax} mm`;
    const innerMin = type === '453' ? g.innerMin : null;
    dimGroups = `<div style="min-width:170px">
      ${glandDimLabelHTML('Outer sheath', `${g.outerMin}–${g.outerMax} mm`)}
      <div style="margin-top:4px">${glandDimStatusHTML(od, odTol, g.outerMin, g.outerMax)}</div>
      ${glandCableValueBoxHTML('Cable OD', od, odTol, opts.odManual)}
    </div>
    <div style="min-width:170px">
      ${glandDimLabelHTML(innerLabel, innerRange)}
      <div style="margin-top:4px">${innerOD != null ? glandDimStatusHTML(innerOD, innerODTol, innerMin, g.innerMax) : '<span class="badge mut">No inner OD for this cable</span>'}</div>
      ${glandCableValueBoxHTML('Cable inner OD', innerOD, innerODTol, opts.innerManual)}
    </div>`;
    if (type === '653' && g.coreMax != null) dimGroups += `<div style="min-width:170px">${glandDimLabelHTML('Max over cores', `${g.coreMax} mm`)}</div>`;
  }

  return `<div class="gsize${opts.isRecommended ? ' rec' : ' candidate'}">
    <div class="sizeref">${g.size}<small>${opts.sizeLabel}</small></div>
    <div class="meta">
      <span>${useNPT ? 'NPT Entry' : 'Metric Entry'} <b>${useNPT ? g.npt : g.metric}</b></span>
      ${opts.isRecommended ? `<span class="badge rec">Recommended</span>` : ''}
    </div>
    <div class="fit" style="align-items:flex-start">${dimGroups}</div>
    <div class="code">
      <div class="k">Order code</div>
      <span class="oc">${orderCode} <button class="copy" title="Copy order code" aria-label="Copy order code" onclick="copyText('${orderCode}')"><svg><use href="#i-copy"/></svg></button></span>
    </div>
  </div>`;
}
