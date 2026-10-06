// ══════════════════════════════════════════════════════════
// GLAND DATA — Hawke datasheets
// ══════════════════════════════════════════════════════════

// 501/453/UNIV — coldflow, armoured (FIRST)
const GLAND_453 = [
  { size:'Os', metric:'M20',     npt:'½"',         innerMin:3.5,  innerMax:8.1,  outerMin:5.5,  outerMax:12.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'O',  metric:'M20',     npt:'½"',         innerMin:6.5,  innerMax:11.4, outerMin:9.5,  outerMax:16.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
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
// (the tighter bare-core-bundle bore inside the barrier compound). No datasheet publishes the
// laid-up core diameter, so this is only checked advisorily against estimateCoreBundleOD()
// (data-cable.js) — it never affects which size is recommended.
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


// ── Text summaries (Wonder Tool PDF + copy-summary) ─────────────────────────
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

const GLAND_NPT_ATEX_NOTICE = `<div class="notice mb-14"><svg><use href="#i-warn"/></svg><span>NPT entries in ATEX zones require certified adapters — check MOC implications</span></div>`;

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

// Best-fit gland from each of the three families for a given cable OD — used where a single
// summary line/row per family is wanted (Wonder Tool's result summary and PDF) rather than
// the full recommender view. Returns { '453': {match, orderCode}, '653': {...}, '421': {...} }.
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

// ── Adjacent-size lookup ────────────────────────────────────────────────────
// Supports the recommender's "show size below/above" toggles and its zero-match case, e.g. a
// barrier gland size that fits the outer sheath but not the inner sheath — nothing in the family
// fits, but the near-miss is still useful to see instead of a bare "no size covers this".

// Describes one dimension's fit against a single min/max bound, covering BOTH an outright nominal
// (book-value) miss and a tolerance-band-only miss — unlike fitStatus()'s lowFail/highFail, which
// are only meaningful once fitsNominal is already true. Returns null when the dimension fits its
// full tolerance band (nothing to report).
function glandDimFailReason(label, val, tol, min, max) {
  if (val == null || max == null) return null;
  const iMin = min != null ? min : -Infinity;
  if (val > max) return { level: 'fail', text: `${label} ${val}mm exceeds this size's max of ${max}mm` };
  if (val < iMin) return { level: 'fail', text: `${label} ${val}mm is below this size's min of ${iMin}mm` };
  const t = tol || 0;
  if ((val + t) > max) return { level: 'warn', text: `${label} fits book value, but +${t}mm tolerance would exceed max ${max}mm` };
  if ((val - t) < iMin) return { level: 'warn', text: `${label} fits book value, but -${t}mm tolerance would fall below min ${iMin}mm` };
  return null;
}

// [min, max] of the "primary" sizing dimension for a raw gland entry — the outer sheath bore for
// 453/653 (both clamp the cable's outer diameter first), or whichever 421 seal range (std/alt)
// actually contains `od`, falling back to std. Used both to find the "anchor" size when nothing
// fits, and to describe a 421 candidate's own fit.
function glandPrimaryRange(type, g, od) {
  if (type === '421') {
    const inStd = od >= g.stdMin && od <= g.stdMax;
    if (inStd || g.altMin == null) return [g.stdMin, g.stdMax];
    const inAlt = od >= g.altMin && od <= g.altMax;
    return inAlt ? [g.altMin, g.altMax] : [g.stdMin, g.stdMax];
  }
  return [g.outerMin, g.outerMax];
}

// Finds the size immediately below and above a pick, by array position — `list` is one of
// GLAND_453/GLAND_653/GLAND_421 (already stored smallest-to-largest). When `recommended` is given
// (something fit), below/above are simply its neighbours in that order. When nothing fit, finds the
// "anchor" — the size whose primary dimension nominally contains `od` even though some OTHER
// dimension made it fail — and returns that anchor plus its neighbours, so a zero-match result can
// still show the closest candidates instead of just "no size covers this".
function glandAdjacentSizes(type, list, recommended, od) {
  if (!list.length) return { below: null, above: null, anchor: null };
  if (recommended) {
    const idx = list.findIndex(g => g.size === recommended.size);
    return {
      below: idx > 0 ? list[idx - 1] : null,
      above: idx > -1 && idx < list.length - 1 ? list[idx + 1] : null,
      anchor: null,
    };
  }
  const idx = list.findIndex(g => {
    const [min, max] = glandPrimaryRange(type, g, od);
    return od >= min && od <= max;
  });
  if (idx === -1) {
    const [firstMin] = glandPrimaryRange(type, list[0], od);
    return od < firstMin
      ? { below: null, above: list[0], anchor: null }
      : { below: list[list.length - 1], above: null, anchor: null };
  }
  return {
    below: idx > 0 ? list[idx - 1] : null,
    above: idx < list.length - 1 ? list[idx + 1] : null,
    anchor: list[idx],
  };
}

// ── Gland recommender view (Cable & Gland tab + Wonder Tool) ────────────────
// The single shared render path, so the two can't drift apart (they previously had separate
// implementations, which is how the Wonder Tool shipped an ICG/653 bug the Cable & Gland tab
// never had). Per family it shows ONE recommended size, with collapsed "size below/above"
// disclosures either side; each checked dimension gets its own badge, the reason it isn't a
// clean fit, and the cable's own figure boxed next to it so nothing needs scrolling back up.
//
// opts: {
//   useNPT        — NPT entry codes instead of metric
//   odManual      — OD is a physically measured value (0 tolerance, labelled as measured)
//   innerManual   — same for the inner-sheath OD
//   codeTransform — optional order-code post-processor (Wonder Tool's Hawke NP -> NPT)
//   coreBundle    — { od } estimated diameter over the laid-up cores (see estimateCoreBundleOD in
//                   data-cable.js) — checked against the ICG/653 "Max over cores" bore, advisory
//                   only: it never changes which size is recommended, since it isn't book data.
// }
const GLAND_FAMILY_INFO = [
  { type: '453', list: () => GLAND_453, img: 'jpg/501-453.jpg', alt: 'Hawke 501/453/UNIV cable gland cross-section',
    pdf: 'pdfs/Hawke 501-453-UNIV Datasheet new.pdf',
    title: 'Hawke 501/453/UNIV — Coldflow, Armoured/Braided',
    blurb: 'Dual certified Exe/Exd. Passive diaphragm seal for cold flow cables. Reversible armour clamp for SWA, wire braid, steel tape. IP66/67/68/69.' },
  { type: '653', list: () => GLAND_653, img: 'jpg/icg653.jpg', alt: 'Hawke ICG/653/UNIV barrier gland cross-section',
    pdf: 'pdfs/Hawke icg653univ.pdf',
    title: 'Hawke ICG/653/UNIV — Barrier',
    blurb: 'Dual certified Exe/Exd. Seals around individual cores. Cold flow, hygroscopic fillers, fibre optic cables. ExPress resin standard (30 min cure). QSP available (suffix Q).' },
  { type: '421', list: () => GLAND_421, img: 'jpg/501-421.jpg', alt: 'Hawke 501/421 cable gland cross-section',
    pdf: 'pdfs/Hawke 501-421 Datasheet new.pdf',
    title: 'Hawke 501/421/UNIV — Compression, Non-Armoured',
    blurb: 'Dual certified Exe/Exd. For non-armoured elastomer and plastic insulated cables. Braid cables: braid passes into enclosure and terminates inside.' },
];

function renderGlandRecommender(OD, odTol, innerOD, innerODTol, opts) {
  opts = opts || {};
  return GLAND_FAMILY_INFO.map(f => `<div class="family">
    <a href="${encodeURI(f.pdf)}" target="_blank" rel="noopener" title="Open ${f.title} datasheet (PDF)"><img src="${f.img}" alt="${f.alt}"></a>
    <div><h3>${f.title}</h3><p>${f.blurb}</p></div>
  </div>` + renderGlandFamilySection(f.type, f.list(), OD, odTol, innerOD, innerODTol, opts)).join('');
}

// The cable figures that justified the recommendation, copied down next to it.
function renderGlandRecSummary(OD, odTol, innerOD, innerODTol, opts) {
  opts = opts || {};
  const measured = `<div class="measured-note">Measured value — 0 mm tolerance</div>`;
  const core = opts.coreBundle;
  return `<div class="spec mb-14">
    <div><div class="k">Overall OD</div><div class="v hi">${OD}${odTol && !opts.odManual ? ' ± ' + odTol : ''} <small>mm</small></div>${opts.odManual ? measured : ''}</div>
    ${innerOD ? `<div><div class="k">OD over inner insulation</div><div class="v">${innerOD}${innerODTol && !opts.innerManual ? ' ± ' + innerODTol : ''} <small>mm</small></div>${opts.innerManual ? measured : ''}</div>` : ''}
    ${core ? `<div><div class="k">Over laid-up cores <span class="badge mut">Estimated</span></div><div class="v">≈ ${core.od} <small>mm</small></div><div class="measured-note muted">${core.basis}</div></div>` : ''}
  </div>`;
}

function renderGlandFamilySection(type, list, OD, odTol, innerOD, innerODTol, opts) {
  const matches = type === '421'
    ? findFitting421(OD, odTol)
    : findFittingGlands(list, OD, odTol, innerOD, innerODTol);
  const recommended = pickRecommendedGland(matches);
  const adj = glandAdjacentSizes(type, list, recommended, OD);
  const row = (g, isRecommended, sizeLabel) => renderGlandRow(type, g, OD, odTol, innerOD, innerODTol, Object.assign({}, opts, { isRecommended, sizeLabel }));
  const npt = opts.useNPT ? GLAND_NPT_ATEX_NOTICE : '';

  if (recommended) {
    const below = adj.below ? glandDisclosure(`One size down — ${adj.below.size}`, row(adj.below, false, 'One size down')) : '';
    const above = adj.above ? glandDisclosure(`One size up — ${adj.above.size}`, row(adj.above, false, 'One size up')) : '';
    return below + row(recommended, true, 'Size ref') + above + npt;
  }

  const noneMsg = `<p class="muted">No size in this family covers the given cable OD${type === '421' ? ' (std or alternative seal)' : ''}.</p>`;
  if (!adj.below && !adj.anchor && !adj.above) return noneMsg;

  return noneMsg + `<div class="mt-10">
    <p class="muted small mb-6">Closest candidates — none satisfy every dimension, shown for reference:</p>
    ${adj.below ? row(adj.below, false, 'One size down') : ''}
    ${adj.anchor ? row(adj.anchor, false, 'Closest size') : ''}
    ${adj.above ? row(adj.above, false, 'One size up') : ''}
  </div>` + npt;
}

// Native <details> disclosure — accessible and keyboard-operable with no per-instance JS/IDs.
function glandDisclosure(summary, panelHTML) {
  return `<details class="disclose"><summary>${summary}</summary>${panelHTML}</details>`;
}

// "<label> <b>value</b>" — the gland's own bore figure for one dimension.
function glandDimLabelHTML(label, valueText) {
  return `<div class="gdim-label">${label} <b>${valueText}</b></div>`;
}

// One dimension's own verdict badge + (if not a clean fit) the reason, scoped to that dimension so
// it can sit directly under its value. A tolerance-edge result is ONE amber badge — pairing a green
// "fits" with an amber "edge" read as a pass at a glance.
function glandDimStatusHTML(val, tol, min, max, isManual) {
  if (val == null) return '';
  const reason = glandDimFailReason('', val, tol, min, max);
  let badge;
  if (!reason) {
    const label = isManual ? 'Fits measured value' : tol ? 'Fits full tolerance' : 'Fits book value';
    badge = `<span class="badge pass"><svg><use href="#i-check"/></svg>${label}</span>`;
    if (!tol && !isManual) badge += ` <span class="badge mut">No tolerance data</span>`;
  } else if (reason.level === 'warn') {
    badge = `<span class="badge warn"><svg><use href="#i-warn"/></svg>Book fit only</span>`;
  } else {
    badge = `<span class="badge fail"><svg><use href="#i-x"/></svg>Does not fit</span>`;
  }
  const detail = reason ? `<div class="gdim-reason ${reason.level}">${reason.text.trim()}</div>` : '';
  return badge + detail;
}

// The cable's own value for one dimension, boxed so it reads as "what's being checked".
function glandCableValueBoxHTML(label, val, tol, isManual, prefix) {
  if (val == null) return '';
  const tolText = isManual ? '' : (tol ? ` ± ${tol}` : '');
  return `<div class="gcable-val">${label} <b>${prefix || ''}${val}${tolText} mm</b>${isManual ? ' (measured)' : ''}</div>`;
}

// Advisory check of the estimated core-bundle diameter against the barrier gland's "Max over
// cores" bore. Never a hard fail — it's a geometric estimate, not a datasheet figure.
function glandCoreBundleStatusHTML(bundle, coreMax) {
  if (!bundle) return `<span class="badge mut">Not estimated for this cable</span>`;
  const ok = bundle.od <= coreMax;
  return (ok
    ? `<span class="badge pass"><svg><use href="#i-check"/></svg>Est. fits</span>`
    : `<span class="badge warn"><svg><use href="#i-warn"/></svg>Est. exceeds — verify</span>`)
    + ` <span class="badge mut">Estimated</span>`
    + (ok ? '' : `<div class="gdim-reason warn">Estimated ${bundle.od}mm over cores exceeds this size's ${coreMax}mm — check against the manufacturer's core dimensions</div>`);
}

function renderGlandRow(type, g, od, odTol, innerOD, innerODTol, opts) {
  const useNPT = !!opts.useNPT;
  const transform = opts.codeTransform || (c => c);
  const entryVal = useNPT ? g.npt.split(' ')[0] : g.metric;
  let orderCode, dimGroups;

  if (type === '421') {
    const [min, max] = glandPrimaryRange('421', g, od);
    const isAlt = g.altMin != null && min === g.altMin;
    orderCode = transform(getGlandOrderCode('421', g.size, useNPT ? 'npt' : 'metric', entryVal) + (isAlt ? 'S' : ''));
    dimGroups = `<div class="gfit-group">
      ${glandDimLabelHTML(isAlt ? 'Alt seal OD (S)' : 'Std seal OD', `${min}–${max} mm`)}
      <div class="mt-4">${glandDimStatusHTML(od, odTol, min, max, opts.odManual)}</div>
      ${glandCableValueBoxHTML('Cable OD', od, odTol, opts.odManual)}
    </div>`;
  } else {
    orderCode = transform(getGlandOrderCode(type, g.size, useNPT ? 'npt' : 'metric', entryVal));
    const innerLabel = type === '453' ? 'Inner sheath' : 'Max inner sheath';
    const innerRange = type === '453' ? `${g.innerMin}–${g.innerMax} mm` : `${g.innerMax} mm`;
    const innerMin = type === '453' ? g.innerMin : null;
    dimGroups = `<div class="gfit-group">
      ${glandDimLabelHTML('Outer sheath', `${g.outerMin}–${g.outerMax} mm`)}
      <div class="mt-4">${glandDimStatusHTML(od, odTol, g.outerMin, g.outerMax, opts.odManual)}</div>
      ${glandCableValueBoxHTML('Cable OD', od, odTol, opts.odManual)}
    </div>
    <div class="gfit-group">
      ${glandDimLabelHTML(innerLabel, innerRange)}
      <div class="mt-4">${innerOD != null ? glandDimStatusHTML(innerOD, innerODTol, innerMin, g.innerMax, opts.innerManual) : '<span class="badge mut">No inner OD for this cable</span>'}</div>
      ${glandCableValueBoxHTML('Cable inner OD', innerOD, innerODTol, opts.innerManual)}
    </div>`;
    if (type === '653' && g.coreMax != null) {
      dimGroups += `<div class="gfit-group">
        ${glandDimLabelHTML('Max over cores', `${g.coreMax} mm`)}
        <div class="mt-4">${glandCoreBundleStatusHTML(opts.coreBundle, g.coreMax)}</div>
        ${opts.coreBundle ? glandCableValueBoxHTML('Est. over cores', opts.coreBundle.od, null, false, '≈ ') : ''}
      </div>`;
    }
  }

  return `<div class="gsize${opts.isRecommended ? ' rec' : ' candidate'}">
    <div class="sizeref">${g.size}<small>${opts.sizeLabel}</small></div>
    <div class="meta">
      <span>${useNPT ? 'NPT Entry' : 'Metric Entry'} <b>${useNPT ? g.npt : g.metric}</b></span>
      ${opts.isRecommended ? `<span class="badge rec">Recommended</span>` : ''}
    </div>
    <div class="fit fit-top">${dimGroups}</div>
    <div class="code">
      <div class="k">Order code</div>
      <span class="oc">${orderCode} <button class="copy" title="Copy order code" aria-label="Copy order code" data-copy="${escapeHtml(orderCode)}" onclick="copyText(this.dataset.copy)"><svg><use href="#i-copy"/></svg></button></span>
    </div>
  </div>`;
}
