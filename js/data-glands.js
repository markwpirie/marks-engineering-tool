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
// nominal (book) OD may still be too small for a cable that comes out at the top of its
// tolerance band — this flags that "book value only" case rather than silently hiding it.
function fitStatus(od, odTol, min, max) {
  const tol = odTol || 0;
  const fitsNominal = od >= min && od <= max;
  const fitsFullTol = fitsNominal && (od - tol) >= min && (od + tol) <= max;
  return { fitsNominal, fitsFullTol, tol };
}

// 453/653 glands clamp the cable's OUTER diameter at the armour/braid entry AND separately
// need their inner sheath bore (453: full min/max range; 653: max-only "Max Inner Sheath")
// to accept the cable's under-sheath diameter — a candidate size only really fits if BOTH
// checks pass, mirroring the DATA tab's dual-lookup gland formulas. innerMin is optional
// since 653 doesn't publish a lower bound for its inner-sheath bore.
function fitStatusDual(od, odTol, outerMin, outerMax, innerOD, innerODTol, innerMin, innerMax) {
  const outer = fitStatus(od, odTol, outerMin, outerMax);
  if (innerOD == null || innerMax == null) return outer;
  const iTol = innerODTol || 0;
  const iMin = innerMin != null ? innerMin : -Infinity;
  const innerFitsNominal = innerOD >= iMin && innerOD <= innerMax;
  const innerFitsFullTol = innerFitsNominal && (innerOD - iTol) >= iMin && (innerOD + iTol) <= innerMax;
  return {
    fitsNominal: outer.fitsNominal && innerFitsNominal,
    fitsFullTol: outer.fitsFullTol && innerFitsFullTol,
    tol: outer.tol,
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
function glandFitBadgesHTML(fit) {
  const nomBadge = `<span class="badge pass"><svg><use href="#i-check"/></svg>Fits book value</span>`;
  if (!fit.tol) return nomBadge + ` <span class="badge mut">No tolerance data</span>`;
  const tolBadge = fit.fitsFullTol
    ? `<span class="badge pass"><svg><use href="#i-check"/></svg>Fits full tolerance (±${fit.tol}mm)</span>`
    : `<span class="badge warn"><svg><use href="#i-warn"/></svg>Book value only — undersized at max tolerance (+${fit.tol}mm)</span>`;
  return nomBadge + ' ' + tolBadge;
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
      ? `<span>Inner sheath <b>${g.innerMin}–${g.innerMax} mm</b></span>`
      : `<span>Max inner sheath <b>${g.innerMax} mm</b></span><span>Max over cores <b>${g.coreMax} mm</b></span>`;
    const isRec = g === recommended;
    return `<div class="gsize${isRec ? ' rec' : ''}">
      <div class="sizeref">${g.size}<small>Size ref</small></div>
      <div class="meta">
        <span>${useNPT?'NPT Entry':'Metric Entry'} <b>${useNPT?g.npt:g.metric}</b></span>
        ${rangeSpan}
        <span>Outer sheath <b>${g.outerMin}–${g.outerMax} mm</b></span>
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
        <span>Std seal OD <b>${g.stdMin}–${g.stdMax} mm</b></span>
        ${g.altMin!=null?`<span>Alt seal OD <b>${g.altMin}–${g.altMax} mm</b></span>`:''}
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
