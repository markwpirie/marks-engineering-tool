// ══════════════════════════════════════════════════════════
// TAB — CABLE & GLAND: installation tools
//   5.5 Cable tray fill (single-layer width + cross-section fill, SVG sketch)
//   5.6 Cable pulling tension (straights, inclines, bends — both pull directions)
// Both pick cables from the same NEK 606 data as the Cable Selector (js/data-cable.js).
// ══════════════════════════════════════════════════════════

// ── Shared cable picker ────────────────────────────────────
// Option values are "RATING|APP|index" into CABLE_DATA[RATING][APP].entries.
const CI_APP_LABELS = { Power: 'Power & Control', InstrI: 'Instrument — ind. screened', InstrC: 'Instrument — coll. screened', Earth: 'Earth (UX P15)' };

function ciCableLabel(rating, app, e) {
  if (app === 'Power') return `${rating} ${e.cores}C × ${e.csa} mm² — OD ${e.od}`;
  if (app === 'Earth') return `UX P15 1 × ${e.csa} mm² — OD ${e.od}`;
  const noun = e.type === 'PR' ? 'pr' : e.type === 'TR' ? 'tr' : 'qd';
  return `${rating}(${app === 'InstrI' ? 'i' : 'c'}) ${e.elements} ${noun} × ${e.csa} mm² — OD ${e.od}`;
}

function ciCableOptionsHTML(selected) {
  let html = '';
  ['RFOU', 'BFOU'].forEach(r => ['Power', 'InstrI', 'InstrC', 'Earth'].forEach(app => {
    if (app === 'Earth' && r === 'BFOU') return; // UX P15 is one product — list it once
    const entries = CABLE_DATA[r][app]?.entries || [];
    html += `<optgroup label="${app === 'Earth' ? '' : r + ' — '}${CI_APP_LABELS[app]}">` +
      entries.map((e, i) => { const v = `${r}|${app}|${i}`; return `<option value="${v}"${v === selected ? ' selected' : ''}>${ciCableLabel(r, app, e)}</option>`; }).join('') +
      `</optgroup>`;
  }));
  return html;
}

function ciEntry(key) {
  const [r, app, i] = String(key || '').split('|');
  const e = CABLE_DATA[r]?.[app]?.entries?.[+i];
  return e ? { rating: r, app, e } : null;
}

// Total conductor copper CSA (mm²) — what a pulling eye on the conductors is limited by.
function ciCopperCSA(app, e) {
  if (app === 'Power') return parseInt(e.cores, 10) * e.csa;
  if (app === 'Earth') return e.csa;
  const per = e.type === 'PR' ? 2 : e.type === 'TR' ? 3 : 4;
  return e.elements * per * e.csa;
}

const ciBadge = (ok, yes = 'Pass', no = 'Fail') => ok
  ? `<span class="badge pass"><svg><use href="#i-check"/></svg>${yes}</span>`
  : `<span class="badge fail"><svg><use href="#i-x"/></svg>${no}</span>`;

// ══════════════════════════════════════════════════════════
// 5.5 TRAY FILL
// ══════════════════════════════════════════════════════════
// Persisted in met_trayfill (exported/imported with the rest of the user's data).
const TRAY_DEFAULT = { width: 300, depth: 50, fill: 40, spacing: 'touch', rows: [{ key: 'RFOU|Power|0', qty: 4 }] };
let trayState = null;

function trayLoad() {
  try { trayState = JSON.parse(localStorage.getItem('met_trayfill') || 'null'); } catch (e) { trayState = null; }
  if (!trayState || !Array.isArray(trayState.rows)) trayState = JSON.parse(JSON.stringify(TRAY_DEFAULT));
  // Default row: a representative 3-core 2.5 mm² power cable rather than the list's first entry
  if (trayState.rows.length === 1 && trayState.rows[0].key === 'RFOU|Power|0') {
    const i = CABLE_DATA.RFOU.Power.entries.findIndex(e => e.cores === 3 && e.csa === 2.5);
    if (i >= 0) trayState.rows[0].key = `RFOU|Power|${i}`;
  }
}
function traySave() { try { localStorage.setItem('met_trayfill', JSON.stringify(trayState)); } catch (e) {} }

function initTrayFill() {
  trayLoad();
  ['width', 'depth', 'fill'].forEach(k => { const el = document.getElementById('tray_' + k); if (el) el.value = trayState[k]; });
  const sp = document.getElementById('tray_spacing'); if (sp) sp.value = trayState.spacing;
  renderTrayRows();
  calcTray();
}

function trayInput(k) {
  const el = document.getElementById('tray_' + k);
  trayState[k] = k === 'spacing' ? el.value : parseFloat(el.value);
  traySave(); calcTray();
}

function renderTrayRows() {
  const el = document.getElementById('trayRows');
  if (!el) return;
  el.innerHTML = trayState.rows.map((r, i) => `<div class="tray-row">
    <select aria-label="Cable ${i + 1}" onchange="trayState.rows[${i}].key=this.value;traySave();calcTray()">${ciCableOptionsHTML(r.key)}</select>
    <input type="number" aria-label="Quantity" min="1" step="1" value="${r.qty}" oninput="trayState.rows[${i}].qty=Math.max(0,parseInt(this.value,10)||0);traySave();calcTray()">
    <button class="btn" title="Remove" aria-label="Remove cable ${i + 1}" onclick="trayRemove(${i})"><svg style="width:13px;height:13px"><use href="#i-x"/></svg></button>
  </div>`).join('');
}

function trayAdd() {
  const last = trayState.rows[trayState.rows.length - 1];
  trayState.rows.push({ key: last ? last.key : TRAY_DEFAULT.rows[0].key, qty: 1 });
  traySave(); renderTrayRows(); calcTray();
}
function trayRemove(i) { trayState.rows.splice(i, 1); traySave(); renderTrayRows(); calcTray(); }

function calcTray() {
  const out = document.getElementById('trayResult');
  if (!out) return;
  const W = trayState.width, D = trayState.depth, lim = trayState.fill;
  const cables = [];
  trayState.rows.forEach(r => { const c = ciEntry(r.key); if (c) for (let q = 0; q < r.qty; q++) cables.push(c); });
  if (!cables.length || !(W > 0)) { out.innerHTML = '<p class="muted small">Add at least one cable and a tray width.</p>'; return; }

  const n = cables.length;
  const area = cables.reduce((a, c) => a + Math.PI / 4 * c.e.od ** 2, 0);
  const fillPct = D > 0 ? area / (W * D) * 100 : null;
  const spaced = trayState.spacing === 'spaced';
  // Spaced = one cable diameter clear between neighbours (larger of the two ODs)
  const sorted = cables.slice().sort((a, b) => b.e.od - a.e.od);
  let widthNeeded = sorted.reduce((a, c) => a + c.e.od, 0);
  if (spaced) for (let i = 1; i < sorted.length; i++) widthNeeded += Math.max(sorted[i - 1].e.od, sorted[i].e.od);
  const weight = cables.reduce((a, c) => a + c.e.weight, 0) / 1000; // kg/m
  const powerCount = cables.filter(c => c.app === 'Power').length;
  const maxOD = Math.max(...cables.map(c => c.e.od));
  const widthOk = widthNeeded <= W;
  const fillOk = fillPct == null || fillPct <= lim;

  out.innerHTML = `<div class="spec">
      <div><div class="k">Cables</div><div class="v">${n} <small>(${powerCount} power)</small></div></div>
      <div><div class="k">Single-layer width needed</div><div class="v">${widthNeeded.toFixed(0)} <small>mm of ${W}</small> ${ciBadge(widthOk, 'Fits', 'Too wide')}</div>
        <div class="hint">${widthOk ? `${(W - widthNeeded).toFixed(0)} mm spare (${((W - widthNeeded) / W * 100).toFixed(0)}%)` : `${(widthNeeded - W).toFixed(0)} mm over — wider tray or second tier`}${spaced ? ' · spaced 1 × D' : ' · touching'}</div></div>
      <div><div class="k">Cross-section fill</div><div class="v">${fillPct != null ? fillPct.toFixed(1) + '%' : '—'} <small>limit ${lim}%</small> ${fillPct != null ? ciBadge(fillOk, 'OK', 'Over') : ''}</div>
        <div class="hint">Σ cable area ${(area / 100).toFixed(1)} cm² in ${W} × ${D} mm</div></div>
      <div><div class="k">Cable weight on tray</div><div class="v">${weight.toFixed(2)} <small>kg/m</small></div><div class="hint">≈ ${(weight * 9.81).toFixed(0)} N/m — check against the tray's safe working load for the support span</div></div>
      <div><div class="k">Largest cable</div><div class="v">${maxOD} <small>mm OD</small></div><div class="hint">Tray rung/bend radius ≥ ${(maxOD * 8).toFixed(0)} mm (8 × OD install)</div></div>
    </div>
    ${powerCount > 6 && !spaced ? `<div class="notice mt-12"><svg><use href="#i-warn"/></svg><span>${powerCount} power cables bunched touching — IEC 60092-352 Table B.4 calls for a 0.85 grouping factor when more than six cables run at full load together. Apply it in the Wonder Tool, or space them 1 × D.</span></div>` : ''}
    ${trayCrossSectionSVG(sorted, W, D, spaced)}`;
}

// Tray cross-section: cables laid largest-first in a single layer; anything that doesn't fit the
// width wraps onto a second layer drawn in the fail colour, so an overfilled tray is obvious.
function trayCrossSectionSVG(cables, W, D, spaced) {
  const pad = 14, scale = Math.min(620 / W, 3);
  const w = W * scale, rail = Math.max(D, cables[0].e.od * 1.2) * scale;
  let x = 0, y = 0, rowH = 0, row = 0;
  const circles = [];
  cables.forEach((c, i) => {
    const d = c.e.od;
    const gap = spaced && x > 0 ? Math.max(d, cables[i - 1].e.od) : 0;
    if (x > 0 && x + gap + d > W) { row++; y += rowH; x = 0; rowH = 0; }
    const cx = x + (x > 0 ? gap : 0) + d / 2;
    circles.push(`<circle cx="${(pad + cx * scale).toFixed(1)}" cy="${(pad + rail - (y + d / 2) * scale).toFixed(1)}" r="${(d / 2 * scale).toFixed(1)}" class="${row ? 'tray-over' : c.app === 'Power' ? 'tray-pwr' : 'tray-inst'}"><title>${ciCableLabel(c.rating, c.app, c.e)}</title></circle>`);
    x = cx + d / 2; rowH = Math.max(rowH, d);
  });
  const h = pad * 2 + rail + 18;
  return `<svg class="tray-svg" viewBox="0 0 ${w + pad * 2} ${h}" role="img" aria-label="Tray cross-section sketch">
    <path d="M${pad} ${pad} V${pad + rail} H${pad + w} V${pad}" class="tray-rail"/>
    ${circles.join('')}
    <text x="${pad}" y="${h - 3}" class="tray-lbl">${W} mm tray${D ? ` · ${D} mm usable depth` : ''} · largest first${row ? ' · red = does not fit single layer' : ''}</text>
  </svg>
  <div class="hint">Fill limits are company/project specific (40% is a common default for ladder and perforated tray). NEK 606 ODs are nominal — allow for tolerance on tight trays.</div>`;
}

// ══════════════════════════════════════════════════════════
// 5.6 PULLING TENSION
// ══════════════════════════════════════════════════════════
// Straight: T₂ = T₁ + w·L·(sinθ + μ·cosθ)   (θ = incline, +up)
// Bend:     T₂ = T₁ · e^(μ·α)               (capstan; α in radians)
// Sidewall pressure at a bend = T₂ / R.
// Pulling-eye limit = 50 N/mm² × total conductor CSA (Draka installation recommendations).
let pullRoute = [
  { t: 'straight', len: 30, inc: 0 },
  { t: 'bend', ang: 90, rad: 0.6 },
  { t: 'straight', len: 60, inc: 0 },
];

function initPulling() {
  const sel = document.getElementById('pull_cable');
  if (sel) {
    const i = CABLE_DATA.RFOU.Power.entries.findIndex(e => e.cores === 3 && e.csa === 35);
    sel.innerHTML = ciCableOptionsHTML(`RFOU|Power|${Math.max(0, i)}`);
  }
  renderPullRoute();
  calcPulling();
}

function renderPullRoute() {
  const el = document.getElementById('pullRoute');
  if (!el) return;
  el.innerHTML = pullRoute.map((s, i) => `<div class="pull-row">
    <span class="pull-n">${i + 1}</span>
    <select aria-label="Section ${i + 1} type" onchange="pullSetType(${i}, this.value)">
      <option value="straight"${s.t === 'straight' ? ' selected' : ''}>Straight</option>
      <option value="bend"${s.t === 'bend' ? ' selected' : ''}>Bend</option>
    </select>
    ${s.t === 'straight'
      ? `<label class="pull-f">Length <span class="u">(m)</span><input type="number" min="0" step="1" value="${s.len}" oninput="pullRoute[${i}].len=parseFloat(this.value)||0;calcPulling()"></label>
         <label class="pull-f">Incline <span class="u">(° up +)</span><input type="number" min="-90" max="90" step="1" value="${s.inc}" oninput="pullRoute[${i}].inc=parseFloat(this.value)||0;calcPulling()"></label>`
      : `<label class="pull-f">Angle <span class="u">(°)</span><input type="number" min="0" max="180" step="5" value="${s.ang}" oninput="pullRoute[${i}].ang=parseFloat(this.value)||0;calcPulling()"></label>
         <label class="pull-f">Radius <span class="u">(m)</span><input type="number" min="0.05" step="0.05" value="${s.rad}" oninput="pullRoute[${i}].rad=parseFloat(this.value)||0;calcPulling()"></label>`}
    <button class="btn" title="Remove section" aria-label="Remove section ${i + 1}" onclick="pullRoute.splice(${i},1);renderPullRoute();calcPulling()"><svg style="width:13px;height:13px"><use href="#i-x"/></svg></button>
  </div>`).join('');
}

function pullSetType(i, t) {
  pullRoute[i] = t === 'bend' ? { t, ang: 90, rad: 0.6 } : { t, len: 20, inc: 0 };
  renderPullRoute(); calcPulling();
}
function pullAdd(t) { pullRoute.push(t === 'bend' ? { t, ang: 90, rad: 0.6 } : { t, len: 20, inc: 0 }); renderPullRoute(); calcPulling(); }

// Runs the route in the given order; returns per-section results and the final tension (N).
function pullRun(route, w, mu, t0) {
  let T = t0;
  return route.map(s => {
    if (s.t === 'straight') {
      const th = (s.inc || 0) * Math.PI / 180;
      T = Math.max(0, T + w * s.len * (Math.sin(th) + mu * Math.cos(th)));
      return { s, T };
    }
    const a = (s.ang || 0) * Math.PI / 180;
    T = T * Math.exp(mu * a);
    return { s, T, swp: s.rad > 0 ? T / s.rad : Infinity };
  });
}

function calcPulling() {
  const out = document.getElementById('pullResult');
  if (!out) return;
  const c = ciEntry(document.getElementById('pull_cable')?.value);
  if (!c) { out.innerHTML = ''; return; }
  const n = Math.max(1, parseInt(document.getElementById('pull_n')?.value, 10) || 1);
  const mu = parseFloat(document.getElementById('pull_mu')?.value) || 0.35;
  const t0 = (parseFloat(document.getElementById('pull_t0')?.value) || 0) * 1000;
  const manualKn = parseFloat(document.getElementById('pull_limit')?.value);
  const w = c.e.weight / 1000 * 9.81 * n; // N/m
  const cu = ciCopperCSA(c.app, c.e) * n;
  const eyeLimit = 50 * cu; // N
  const limit = !isNaN(manualKn) && manualKn > 0 ? manualKn * 1000 : eyeLimit;
  const minBend = c.e.od * 8 / 1000; // m

  if (!pullRoute.length) { out.innerHTML = '<p class="muted small">Add at least one route section.</p>'; return; }
  const fwd = pullRun(pullRoute, w, mu, t0);
  const rev = pullRun(pullRoute.slice().reverse().map(s => s.t === 'straight' ? Object.assign({}, s, { inc: -(s.inc || 0) }) : s), w, mu, t0);
  const Tf = fwd[fwd.length - 1].T, Tr = rev[rev.length - 1].T;
  const best = Tf <= Tr ? 'forward' : 'reverse';
  const kN = x => (x / 1000).toFixed(2);

  const rows = fwd.map((r, i) => {
    const s = r.s;
    const bendOk = s.t !== 'bend' || s.rad >= minBend;
    return `<tr><td>${i + 1}</td><td>${s.t === 'straight' ? `Straight ${s.len} m${s.inc ? `, ${s.inc > 0 ? '+' : ''}${s.inc}°` : ''}` : `Bend ${s.ang}° @ R ${s.rad} m`}</td>
      <td class="mono">${kN(r.T)} kN</td>
      <td class="mono">${r.swp != null ? (isFinite(r.swp) ? (r.swp / 1000).toFixed(2) + ' kN/m' : '—') : ''}</td>
      <td>${s.t === 'bend' ? ciBadge(bendOk, 'R ≥ 8×OD', `R < ${minBend.toFixed(2)} m`) : ''}</td></tr>`;
  }).join('');
  const tensionOk = Math.max(Tf, Tr) <= limit, bestOk = Math.min(Tf, Tr) <= limit;
  const bendsOk = pullRoute.every(s => s.t !== 'bend' || s.rad >= minBend);

  out.innerHTML = `<div class="spec">
      <div><div class="k">Cable weight pulled</div><div class="v">${(w / 9.81).toFixed(2)} <small>kg/m</small></div><div class="hint">${n} × ${c.e.weight} kg/km · μ = ${mu}</div></div>
      <div><div class="k">Pull forward (1 → ${pullRoute.length})</div><div class="v${best === 'forward' ? ' hi' : ''}">${kN(Tf)} <small>kN</small></div></div>
      <div><div class="k">Pull reverse (${pullRoute.length} → 1)</div><div class="v${best === 'reverse' ? ' hi' : ''}">${kN(Tr)} <small>kN</small></div></div>
      <div><div class="k">Permitted tension</div><div class="v">${kN(limit)} <small>kN</small></div><div class="hint">${!isNaN(manualKn) && manualKn > 0 ? 'Manual limit' : `Pulling eye: 50 N/mm² × ${cu.toFixed(1)} mm² Cu`}</div></div>
    </div>
    <div class="row-gap mt-12">
      ${ciBadge(bestOk, `Pull ${best} — ${(Math.min(Tf, Tr) / limit * 100).toFixed(0)}% of limit`, `Exceeds limit in both directions`)}
      ${!tensionOk && bestOk ? `<span class="badge warn"><svg><use href="#i-warn"/></svg>Other direction exceeds the limit</span>` : ''}
      ${bendsOk ? '' : `<span class="badge fail"><svg><use href="#i-x"/></svg>Bend radius below 8 × OD (${minBend.toFixed(2)} m)</span>`}
    </div>
    <div class="tblwrap mt-12"><table><thead><tr><th>#</th><th>Section (forward)</th><th>Tension after</th><th>Sidewall pressure</th><th>Bend radius</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="hint mt-8">Capstan method, cable pulled as one bundle. Sidewall pressure limits aren't published in the NEK 606 datasheets — check with the manufacturer for tight bends under high tension. Stocking-grip pulls are usually limited well below the pulling-eye figure: enter a manual limit if using one.</div>`;
}
