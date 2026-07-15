// ══════════════════════════════════════════════════════════
// GLAND DATA — Hawke datasheets
// ══════════════════════════════════════════════════════════

// 501/453/UNIV — coldflow, armoured (FIRST)
const GLAND_453 = [
  { size:'Os', metric:'M16/M20', npt:'½"',         innerMin:3.5,  innerMax:8.1,  outerMin:5.5,  outerMax:12.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'O',  metric:'M16/M20', npt:'½"',         innerMin:6.5,  innerMax:11.4, outerMin:9.5,  outerMax:16.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'A',  metric:'M20',     npt:'¾" or ½"',   innerMin:8.4,  innerMax:14.3, outerMin:12.5, outerMax:20.5, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'B',  metric:'M25',     npt:'1" or ¾"',   innerMin:11.1, innerMax:19.7, outerMin:16.9, outerMax:26.0, arm1:'1.25/1.6', arm2:'0.0/0.7' },
  { size:'C',  metric:'M32',     npt:'1¼" or 1"',  innerMin:17.6, innerMax:26.5, outerMin:22.0, outerMax:33.0, arm1:'1.6/2.0',  arm2:'0.0/0.7' },
  { size:'C2', metric:'M40',     npt:'1½" or 1¼"', innerMin:23.1, innerMax:32.5, outerMin:28.0, outerMax:41.0, arm1:'1.6/2.0',  arm2:'0.0/0.7' },
  { size:'D',  metric:'M50',     npt:'2" or 1½"',  innerMin:28.9, innerMax:44.4, outerMin:36.0, outerMax:52.6, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'E',  metric:'M63',     npt:'2½" or 2"',  innerMin:39.9, innerMax:56.3, outerMin:46.0, outerMax:65.3, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'F',  metric:'M75',     npt:'3" or 2½"',  innerMin:50.5, innerMax:68.2, outerMin:57.0, outerMax:78.0, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'G',  metric:'M80',     npt:'3½"',        innerMin:67.0, innerMax:73.0, outerMin:75.0, outerMax:89.5, arm1:'2.0/3.5',  arm2:'0.0/1.0' },
  { size:'H',  metric:'M90',     npt:'3½"',        innerMin:67.0, innerMax:77.6, outerMin:75.0, outerMax:89.5, arm1:'2.0/3.5',  arm2:'0.0/1.0' },
  { size:'J',  metric:'M100',    npt:'4"',         innerMin:75.0, innerMax:91.6, outerMin:88.0, outerMax:104.5,arm1:'2.5/4.0',  arm2:'0.0/1.0' },
];

// ICG/653/UNIV — barrier gland (SECOND)
// innerMax = "Max Inner Sheath 'E'" (bore that accepts the cable's under-sheath diameter,
// i.e. checked against a cable's Inner Covering Diameter). coreMax = "Max Over Cores 'D'"
// (the tighter bare-core-bundle bore inside the barrier compound — no cable data tracks this
// dimension, so it isn't checked, only carried for display).
const GLAND_653 = [
  { size:'Os', metric:'M20',  npt:'½"',         innerMax:10.0, coreMax:8.9,  outerMin:5.5,  outerMax:12.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'O',  metric:'M20',  npt:'½"',         innerMax:10.0, coreMax:8.9,  outerMin:9.5,  outerMax:16.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'A',  metric:'M20',  npt:'¾" or ½"',   innerMax:12.5, coreMax:11.0, outerMin:12.5, outerMax:20.5, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'B',  metric:'M25',  npt:'1" or ¾"',   innerMax:18.4, coreMax:16.2, outerMin:16.9, outerMax:26.0, arm1:'1.25/1.6', arm2:'0.0/0.7' },
  { size:'C',  metric:'M32',  npt:'1¼" or 1"',  innerMax:24.7, coreMax:21.9, outerMin:22.0, outerMax:33.0, arm1:'1.6/2.0',  arm2:'0.0/0.7' },
  { size:'C2', metric:'M40',  npt:'1½" or 1¼"', innerMax:29.7, coreMax:26.3, outerMin:28.0, outerMax:41.0, arm1:'1.6/2.0',  arm2:'0.0/0.7' },
  { size:'D',  metric:'M50',  npt:'2" or 1½"',  innerMax:41.7, coreMax:37.1, outerMin:36.0, outerMax:52.6, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'E',  metric:'M63',  npt:'2½" or 2"',  innerMax:53.5, coreMax:47.8, outerMin:46.0, outerMax:65.3, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'F',  metric:'M75',  npt:'3" or 2½"',  innerMax:66.2, coreMax:59.0, outerMin:57.0, outerMax:78.0, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
];

// 501/421 — compression, non-armoured (LAST)
const GLAND_421 = [
  { size:'2K', metric:'M16',  npt:'-',          stdMin:3.0,  stdMax:8.0,  altMin:null, altMax:null },
  { size:'Os', metric:'M20',  npt:'½"',         stdMin:3.0,  stdMax:8.0,  altMin:null, altMax:null },
  { size:'O',  metric:'M20',  npt:'½"',         stdMin:7.5,  stdMax:11.9, altMin:null, altMax:null },
  { size:'A',  metric:'M20',  npt:'¾" or ½"',   stdMin:11.0, stdMax:14.3, altMin:8.5,  altMax:13.5 },
  { size:'B',  metric:'M25',  npt:'1" or ¾"',   stdMin:13.0, stdMax:20.2, altMin:9.5,  altMax:15.4 },
  { size:'C',  metric:'M32',  npt:'1¼" or 1"',  stdMin:19.0, stdMax:26.5, altMin:15.5, altMax:21.2 },
  { size:'C2', metric:'M40',  npt:'1½" or 1¼"', stdMin:25.0, stdMax:32.5, altMin:22.0, altMax:28.0 },
  { size:'D',  metric:'M50',  npt:'2" or 1½"',  stdMin:31.5, stdMax:44.4, altMin:27.5, altMax:34.8 },
  { size:'E',  metric:'M63',  npt:'2½" or 2"',  stdMin:42.5, stdMax:56.3, altMin:39.0, altMax:46.5 },
  { size:'F',  metric:'M75',  npt:'3" or 2½"',  stdMin:54.5, stdMax:68.2, altMin:48.5, altMax:58.3 },
  { size:'G',  metric:'M80',  npt:'3½"',        stdMin:67.0, stdMax:73.0, altMin:null, altMax:null },
  { size:'H',  metric:'M90',  npt:'3½"',        stdMin:67.0, stdMax:77.6, altMin:null, altMax:null },
  { size:'J',  metric:'M100', npt:'4"',         stdMin:75.0, stdMax:91.6, altMin:null, altMax:null },
];

// ── Fit checking (book value vs book value + datasheet tolerance) ──────────
// A cable's actual OD can land anywhere in [od-odTol, od+odTol]. A gland that fits the
// nominal (book) OD may still fail at one edge of that band — either because the top of
// the band exceeds the gland's max bore (cable too big at +tol) or because the bottom of
// the band falls below the gland's min bore (cable too small / under-clamped at -tol).
// lowFail/highFail record which edge caused a "book value only" result so the UI can say
// which one, rather than a single generic "undersized" message that doesn't say which way.
function fitStatus(od, odTol, min, max) {
  const tol = odTol || 0;
  const fitsNominal = od >= min && od <= max;
  const lowFail = fitsNominal && (od - tol) < min;
  const highFail = fitsNominal && (od + tol) > max;
  const fitsFullTol = fitsNominal && !lowFail && !highFail;
  return { fitsNominal, fitsFullTol, tol, lowFail, highFail };
}

// 453/653 glands clamp the cable's OUTER diameter at the armour/braid entry AND separately
// need their inner sheath bore (453: full min/max range; 653: max-only "Max Inner Sheath")
// to accept the cable's under-sheath diameter — a candidate size only really fits if BOTH
// checks pass, mirroring the DATA tab's dual-lookup gland formulas. innerMin is optional
// since 653 doesn't publish a lower bound for its inner-sheath bore. outerFit/innerFit are
// kept on the result (alongside the combined fitsNominal/fitsFullTol/tol) so the UI can
// point at whichever specific dimension caused a "book value only" result.
function fitStatusDual(od, odTol, outerMin, outerMax, innerOD, innerODTol, innerMin, innerMax) {
  const outer = fitStatus(od, odTol, outerMin, outerMax);
  if (innerOD == null || innerMax == null) {
    return Object.assign({}, outer, { outerFit: outer, innerFit: null });
  }
  const iMin = innerMin != null ? innerMin : -Infinity;
  const inner = fitStatus(innerOD, innerODTol, iMin, innerMax);
  return {
    fitsNominal: outer.fitsNominal && inner.fitsNominal,
    fitsFullTol: outer.fitsFullTol && inner.fitsFullTol,
    tol: outer.tol,
    outerFit: outer,
    innerFit: inner,
  };
}

// Returns every gland in `list` (453/653-style, keyed on outerMin/outerMax) whose nominal-OD
// range covers `od` AND whose inner sheath bore covers `innerOD` (when supplied), each
// annotated with fitStatus and sorted smallest-first.
function findFittingGlands(list, od, odTol, innerOD, innerODTol) {
  return list
    .map(g => Object.assign({}, g, fitStatusDual(od, odTol, g.outerMin, g.outerMax, innerOD, innerODTol, g.innerMin, g.innerMax)))
    .filter(g => g.fitsNominal)
    .sort((a, b) => a.outerMin - b.outerMin);
}

// 501/421 has a std seal range and an optional alternative (S-suffix) seal range per size —
// each size can appear via either seal, never both, so this returns one entry per matching size.
function findFitting421(od, odTol) {
  const out = [];
  GLAND_421.forEach(g => {
    const std = fitStatus(od, odTol, g.stdMin, g.stdMax);
    if (std.fitsNominal) { out.push(Object.assign({}, g, std, { seal: 'std' })); return; }
    if (g.altMin != null) {
      const alt = fitStatus(od, odTol, g.altMin, g.altMax);
      if (alt.fitsNominal) out.push(Object.assign({}, g, alt, { seal: 'alt' }));
    }
  });
  return out.sort((a, b) => (a.seal === 'std' ? a.stdMin : a.altMin) - (b.seal === 'std' ? b.stdMin : b.altMin));
}

// Picks the best candidate from a size-ascending fit list: prefers the smallest size that
// fits the FULL tolerance band; falls back to the smallest book-value-only fit if none do.
function pickRecommendedGland(matches) {
  if (!matches.length) return null;
  const fullFit = matches.filter(m => m.fitsFullTol);
  return fullFit.length ? fullFit[0] : matches[0];
}

// ── Shared HTML rendering (used by tab-cable.js and tab-wonder.js) ─────────
// Describes which specific dimension(s) failed the full-tolerance check and in which
// direction: "exceeds max" (cable at +tol is bigger than the gland's bore) or "below min"
// (cable at -tol is smaller than the gland's bore — risk of an under-clamped/loose fit).
// Dual fits (453/653) name the dimension (outer/inner sheath); single fits (421) don't need
// to since there's only one OD check.
function glandFitFailures(fit) {
  const describe = dim => dim.highFail ? `exceeds max at +${dim.tol}mm` : `below min at -${dim.tol}mm`;
  if (fit.outerFit !== undefined) {
    const fails = [];
    if (fit.outerFit && !fit.outerFit.fitsFullTol) fails.push(`outer sheath ${describe(fit.outerFit)}`);
    if (fit.innerFit && !fit.innerFit.fitsFullTol) fails.push(`inner sheath ${describe(fit.innerFit)}`);
    return fails;
  }
  return [describe(fit)];
}

function glandFitSummaryText(fit) {
  if (!fit.tol) return 'Fits book value (no tolerance data)';
  if (fit.fitsFullTol) return `Fits full tolerance band (±${fit.tol}mm)`;
  return `Book value only — ${glandFitFailures(fit).join('; ')}`;
}

function glandFitBadgesHTML(fit) {
  const nomBadge = `<span class="badge pass"><svg><use href="#i-check"/></svg>Fits book value</span>`;
  if (!fit.tol) return nomBadge + ` <span class="badge mut">No tolerance data</span>`;
  if (fit.fitsFullTol) {
    return nomBadge + ` <span class="badge pass"><svg><use href="#i-check"/></svg>Fits full tolerance (±${fit.tol}mm)</span>`;
  }
  const detail = glandFitFailures(fit).join('; ');
  return nomBadge + ` <span class="badge warn"><svg><use href="#i-warn"/></svg>Book value only — ${detail}</span>`;
}

// Wraps a dimension's raw text (e.g. "23.1–32.5 mm") in a warning colour when that specific
// dimension is the one that failed the full-tolerance check, plus an inline "+Xmm exceeds
// max" / "-Xmm below min" tag — so the failing figure is visually obvious without doing the
// mm arithmetic by hand. `dim` is an outerFit/innerFit sub-object, or undefined/null if this
// dimension wasn't checked or isn't relevant to the candidate being rendered.
function glandDimValueHTML(text, dim) {
  if (!dim || !dim.fitsNominal || dim.fitsFullTol) return `<b>${text}</b>`;
  const tag = dim.highFail ? `+${dim.tol}mm exceeds max` : `-${dim.tol}mm below min`;
  return `<b style="color:var(--warn)">${text}</b> <span style="color:var(--warn);font-size:0.72rem;font-weight:600">(${tag})</span>`;
}

function glandNptExample(size, prefix, npt) {
  return `${prefix}/${size}/${npt.split(' ')[0].replace('"','').replace('/','')+'NP'}`;
}

const GLAND_NPT_ATEX_NOTICE = `<div class="notice" style="margin-bottom:14px"><svg><use href="#i-warn"/></svg><span>NPT entries in ATEX zones require certified adapters — check MOC implications</span></div>`;

// Renders the list-of-matching-sizes body for the 453 (armoured) or 653 (barrier) families.
// `type` is '453' or '653'; `matches` comes from findFittingGlands(GLAND_453|GLAND_653, od, odTol).
// `codeTransform` optionally post-processes the generated order code (e.g. Wonder Tool's NP→NPT).
function renderGlandSizeList(type, matches, useNPT, codeTransform) {
  codeTransform = codeTransform || (c => c);
  if (!matches.length) return `<p style="color:var(--text2)">No size in this family covers the given cable OD.</p>`;
  const prefix = type === '453' ? '501/453/UNIV' : 'ICG/653/UNIV';
  const recommended = pickRecommendedGland(matches);
  const rows = matches.map((g) => {
    const entry = useNPT ? g.npt.split(' ')[0] : g.metric;
    const orderCode = codeTransform(getGlandOrderCode(type, g.size, useNPT ? 'npt' : 'metric', entry));
    const metEx = `${prefix}/${g.size}/${type === '453' ? g.metric.replace('/','-') : g.metric}`;
    const nptEx = glandNptExample(g.size, prefix, g.npt);
    const rangeSpan = type === '453'
      ? `<span>Inner sheath ${glandDimValueHTML(`${g.innerMin}–${g.innerMax} mm`, g.innerFit)}</span>`
      : `<span>Max inner sheath ${glandDimValueHTML(`${g.innerMax} mm`, g.innerFit)}</span><span>Max over cores <b>${g.coreMax} mm</b></span>`;
    const isRec = g === recommended;
    return `<div class="gsize${isRec ? ' rec' : ''}">
      <div class="sizeref">${g.size}<small>Size ref</small></div>
      <div class="meta">
        <span>${useNPT?'NPT Entry':'Metric Entry'} <b>${useNPT?g.npt:g.metric}</b></span>
        ${rangeSpan}
        <span>Outer sheath ${glandDimValueHTML(`${g.outerMin}–${g.outerMax} mm`, g.outerFit)}</span>
      </div>
      <div class="fit">
        ${isRec ? `<span class="badge rec">Recommended</span>` : ''}
        ${glandFitBadgesHTML(g)}
      </div>
      <div class="code">
        <div class="k">Order code</div>
        <span class="oc">${orderCode} <button class="copy" title="Copy order code" aria-label="Copy order code" onclick="copyText('${orderCode}')"><svg><use href="#i-copy"/></svg></button></span>
      </div>
    </div>
    <div style="margin:4px 0 10px;font-size:0.72rem;color:var(--text3)">Metric ex: <span class="mono" style="font-family:var(--mono)">${metEx}</span> &nbsp;|&nbsp; NPT ex: <span class="mono" style="font-family:var(--mono)">${nptEx}</span></div>`;
  }).join('');
  return rows + (useNPT ? GLAND_NPT_ATEX_NOTICE : '');
}

// Renders the list-of-matching-sizes body for the 421 (compression) family.
// `matches` comes from findFitting421(od, odTol). `codeTransform` — see renderGlandSizeList().
function renderGland421SizeList(matches, useNPT, codeTransform) {
  codeTransform = codeTransform || (c => c);
  if (!matches.length) return `<p style="color:var(--text2)">No size in this family covers the given cable OD (std or alternative seal).</p>`;
  const prefix = '501/421/UNIV';
  const recommended = pickRecommendedGland(matches);
  const rows = matches.map((g) => {
    const isAlt = g.seal === 'alt';
    const entry = useNPT ? g.npt.split(' ')[0] : g.metric;
    const orderCode = codeTransform(getGlandOrderCode('421', g.size, useNPT ? 'npt' : 'metric', entry) + (isAlt ? 'S' : ''));
    const metEx = `${prefix}/${g.size}/${g.metric}`;
    const nptEx = glandNptExample(g.size, prefix, g.npt);
    const isRec = g === recommended;
    return `<div class="gsize${isRec ? ' rec' : ''}">
      <div class="sizeref">${g.size}<small>Size ref</small></div>
      <div class="meta">
        <span>${useNPT?'NPT Entry':'Metric Entry'} <b>${useNPT?g.npt:g.metric}</b></span>
        <span>Std seal OD ${glandDimValueHTML(`${g.stdMin}–${g.stdMax} mm`, isAlt ? null : g)}</span>
        ${g.altMin!=null?`<span>Alt seal OD ${glandDimValueHTML(`${g.altMin}–${g.altMax} mm`, isAlt ? g : null)}</span>`:''}
      </div>
      <div class="fit">
        ${isRec ? `<span class="badge rec">Recommended</span>` : ''}
        <span class="badge mut">${isAlt?'Alternative Seal (S)':'Standard Seal'}</span>
        ${glandFitBadgesHTML(g)}
      </div>
      <div class="code">
        <div class="k">Order code</div>
        <span class="oc">${orderCode} <button class="copy" title="Copy order code" aria-label="Copy order code" onclick="copyText('${orderCode}')"><svg><use href="#i-copy"/></svg></button></span>
      </div>
    </div>
    <div style="margin:4px 0 10px;font-size:0.72rem;color:var(--text3)">Metric ex: <span class="mono" style="font-family:var(--mono)">${metEx}</span> &nbsp;|&nbsp; NPT ex: <span class="mono" style="font-family:var(--mono)">${nptEx}</span></div>`;
  }).join('');
  return rows + (useNPT ? GLAND_NPT_ATEX_NOTICE : '');
}

// Full Hawke order code format: 501/453/UNIV/SIZE/ENTRY
function getGlandOrderCode(type, size, entryType, entryVal) {
  if (type === '453') {
    // 501/453/UNIV/A/M20 or 501/453/UNIV/A/3-4NP
    const entry = entryType === 'npt' ? entryVal.replace('"','').replace('/','') + 'NP' : entryVal.replace('/','-');
    return `501/453/UNIV/${size}/${entry}`;
  } else if (type === '653') {
    const entry = entryType === 'npt' ? entryVal.replace('"','').replace('/','') + 'NP' : entryVal;
    return `ICG/653/UNIV/${size}/${entry}`;
  } else if (type === '421') {
    const entry = entryType === 'npt' ? entryVal.split(' ')[0].replace('"','').replace('/','') + 'NP' : entryVal;
    return `501/421/UNIV/${size}/${entry}`;
  }
  return '';
}

// Renders all three Hawke gland families (braided/armoured 453, barrier 653, compression 421)
// for a given cable OD — the single shared render path for both the Cable & Gland tab's
// full-list view and the Wonder Tool, so the two can no longer drift apart (they previously
// had separate implementations, which is how the Wonder Tool shipped an ICG/653 bug that the
// Cable & Gland tab never had). `codeTransform` optionally post-processes order codes (e.g.
// Wonder Tool's Hawke "NP" suffix -> "NPT").
function renderAllGlandFamilies(OD, odTol, innerOD, innerODTol, useNPT, codeTransform) {
  let html = `<div class="family">
    <img src="jpg/501-453.jpg" alt="Hawke 501/453/UNIV cable gland cross-section">
    <div>
      <h3>Hawke 501/453/UNIV — Coldflow, Armoured/Braided</h3>
      <p>Dual certified Exe/Exd. Passive diaphragm seal for cold flow cables. Reversible armour clamp for SWA, wire braid, steel tape. IP66/67/68/69.</p>
    </div>
  </div>`;
  html += renderGlandSizeList('453', findFittingGlands(GLAND_453, OD, odTol, innerOD, innerODTol), useNPT, codeTransform);

  html += `<div class="family">
    <img src="jpg/icg653.jpg" alt="Hawke ICG/653/UNIV barrier gland cross-section">
    <div>
      <h3>Hawke ICG/653/UNIV — Barrier</h3>
      <p>Dual certified Exe/Exd. Seals around individual cores. Cold flow, hygroscopic fillers, fibre optic cables. ExPress resin standard (30 min cure). QSP available (suffix Q).</p>
    </div>
  </div>`;
  html += renderGlandSizeList('653', findFittingGlands(GLAND_653, OD, odTol, innerOD, innerODTol), useNPT, codeTransform);

  html += `<div class="family">
    <img src="jpg/501-421.jpg" alt="Hawke 501/421 cable gland cross-section">
    <div>
      <h3>Hawke 501/421/UNIV — Compression, Non-Armoured</h3>
      <p>Dual certified Exe/Exd. For non-armoured elastomer and plastic insulated cables. Braid cables: braid passes into enclosure and terminates inside.</p>
    </div>
  </div>`;
  html += renderGland421SizeList(findFitting421(OD, odTol), useNPT, codeTransform);

  return html;
}

// Best-fit gland from each of the three families for a given cable OD — used where a single
// summary line/row per family is wanted (Wonder Tool's result summary and PDF) rather than
// the full per-size list. Returns { '453': {match, orderCode}, '653': {...}, '421': {...} }.
function bestGlandPerFamily(OD, odTol, innerOD, innerODTol) {
  const build = (type, matches, getOrderCode) => {
    const match = pickRecommendedGland(matches);
    if (!match) return { type, match: null, orderCode: null };
    return { type, match, orderCode: getOrderCode(match) };
  };
  return {
    '453': build('453', findFittingGlands(GLAND_453, OD, odTol, innerOD, innerODTol),
      m => getGlandOrderCode('453', m.size, 'metric', m.metric)),
    '653': build('653', findFittingGlands(GLAND_653, OD, odTol, innerOD, innerODTol),
      m => getGlandOrderCode('653', m.size, 'metric', m.metric)),
    '421': build('421', findFitting421(OD, odTol),
      m => getGlandOrderCode('421', m.size, 'metric', m.metric) + (m.seal === 'alt' ? 'S' : '')),
  };
}

function glandFamilyName(type) {
  return type === '453' ? 'Hawke Braided Gland (501/453/UNIV)'
       : type === '653' ? 'Hawke Barrier Gland (ICG/653/UNIV)'
       : 'Hawke Compression Gland (501/421/UNIV)';
}
