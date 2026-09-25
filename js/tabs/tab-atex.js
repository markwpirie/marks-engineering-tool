// ══════════════════════════════════════════════════════════
// TAB — ATEX
// ══════════════════════════════════════════════════════════

function parseProtCodes(str, keys) {
  const result = [];
  let remaining = str.toLowerCase();
  while (remaining.length > 0) {
    const matched = keys.find(k => remaining.startsWith(k.toLowerCase().replace('_','')));
    if (matched) { result.push(matched); remaining = remaining.slice(matched.replace('_','').length); }
    else remaining = remaining.slice(1);
  }
  return result;
}

// Tolerant parser shared by the decoder (2.1) and the suitability check (2.6). Returns every field
// it could identify (null where it couldn't) plus a list of compatibility warnings.
function parseAtexMarking(raw) {
  // Tolerant — normalise dashes, collapse whitespace, handle missing spaces around known tokens
  const normalised = raw
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = normalised.split(/[\s,/]+/).filter(Boolean);

  const grp = tokens.find(t => t==='I' || t==='II');
  const catToken = tokens.find(t => ['1','2','3'].includes(t) || ['m1','m2'].includes(t.toLowerCase()));
  const cat = catToken ? (['1','2','3'].includes(catToken) ? catToken : catToken.toUpperCase()) : null;

  // Env — case-insensitive GD before G/D
  const envRaw = tokens.find(t => t.toUpperCase()==='GD') ||
                 tokens.find(t => t.toUpperCase()==='G' || t.toUpperCase()==='D');
  const envNorm = envRaw ? envRaw.toUpperCase() : null;

  const allProtKeys = Object.keys(ATEX_DB.prot);
  const sortedProtKeys = [...allProtKeys].sort((a,b) => b.length - a.length);

  let exIdx = tokens.findIndex(t => t.toLowerCase()==='ex');
  let prots = [];

  if (exIdx === -1) {
    const concatIdx = tokens.findIndex(t => /^ex[a-z]/i.test(t));
    if (concatIdx !== -1) {
      let remainder = tokens[concatIdx].slice(2);
      prots = parseProtCodes(remainder, sortedProtKeys);
      for (let i = concatIdx+1; i < tokens.length; i++) {
        const tk = tokens[i];
        if (/^(II[A-C]|III[A-C])$/i.test(tk)) break;
        if (/^T[1-6]$/i.test(tk)) break;
        if (/^[GDM][abc]$/.test(tk)) break; // EPL (Gb) — case-sensitive, 'db'/'mb' are protection concepts
        const m = allProtKeys.find(p => p.toLowerCase() === tk.toLowerCase());
        if (m && !prots.includes(m)) prots.push(m);
      }
      exIdx = concatIdx;
    }
  } else {
    for (let i = exIdx+1; i < tokens.length; i++) {
      const tk = tokens[i];
      if (/^(II[A-C]|III[A-C])$/i.test(tk)) break;
      if (/^T[1-6]$/i.test(tk)) break;
      if (/^[GDM][abc]$/.test(tk)) break; // EPL (Gb) — case-sensitive, 'db'/'mb' are protection concepts
      const exact = allProtKeys.find(p =>
        p.toLowerCase() === tk.toLowerCase() ||
        p.replace('_','') === tk.replace('_','').toLowerCase()
      );
      if (exact) { if (!prots.includes(exact)) prots.push(exact); }
      else {
        const parsed = parseProtCodes(tk, sortedProtKeys);
        parsed.forEach(p => { if (!prots.includes(p)) prots.push(p); });
      }
    }
  }

  // Gas group — case insensitive; also handle swapped T-rating (common mistake)
  const gasgrpRaw = tokens.find(t => /^II[ABC]$|^III[ABC]$/i.test(t));
  const gasgrpNorm = gasgrpRaw ? gasgrpRaw.toUpperCase() : null;

  // Temp — accept lowercase t1-t6 too
  const tempRaw = tokens.find(t => /^T[1-6]$/i.test(t));
  const tempNorm = tempRaw ? tempRaw.toUpperCase() : null;

  // Dust max surface temperature, e.g. "T135" or "T135°C" (as opposed to gas T1–T6 classes)
  const dustTRaw = tokens.find(t => /^T\d{2,3}(°C|C)?$/i.test(t));
  const tempC = dustTRaw ? parseInt(dustTRaw.slice(1), 10) : null;

  // EPL — sits at the end of a marking, so search from the end, and match case-sensitively first:
  // "db"/"mb" are protection concepts (Ex db, Ex mb), whereas "Db"/"Mb" are EPLs. A case-blind
  // first-match read "II 2 G Ex db IIB T4 Gb" as EPL Db. Case-insensitive is only a fallback for
  // sloppy input, and never for a token already consumed as a protection concept.
  const eplKeys = Object.keys(ATEX_DB.epl);
  const rev = [...tokens].reverse();
  let epl = rev.map(t => eplKeys.find(k => k === t)).find(Boolean) || null;
  if (!epl) {
    const protTokens = new Set(tokens.slice(exIdx + 1).filter(t => allProtKeys.some(p => p.toLowerCase() === t.toLowerCase())).map(t => t.toLowerCase()));
    epl = rev.filter(t => !protTokens.has(t.toLowerCase())).map(t => eplKeys.find(k => k.toLowerCase() === t.toLowerCase())).find(Boolean) || null;
  }

  const warnings = atexCompatWarnings({ cat, epl, prots });
  return { grp, cat, envNorm, prots, gasgrpNorm, tempNorm, tempC, epl, warnings };
}

function atexCompatWarnings({ cat, epl, prots }) {
  const warnings = [];
  if (cat==='1' && epl && !['Ga','Da','Ma'].includes(epl)) warnings.push('Category 1 should pair with EPL Ga, Da, or Ma');
  if (cat==='2' && epl && !['Gb','Db','Mb'].includes(epl)) warnings.push('Category 2 should pair with EPL Gb, Db, or Mb');
  if (cat==='3' && epl && !['Gc','Dc'].includes(epl)) warnings.push('Category 3 should pair with EPL Gc or Dc');
  if (cat==='M1' && epl && epl!=='Ma') warnings.push('Category M1 (Group I mining) should pair with EPL Ma');
  if (cat==='M2' && epl && !['Ma','Mb'].includes(epl)) warnings.push('Category M2 (Group I mining) should pair with EPL Ma or Mb');
  if (prots.includes('ia') && cat && cat!=='1') warnings.push('Ex ia is normally Category 1 (EPL Ga)');
  if (prots.includes('ib') && cat && cat!=='2') warnings.push('Ex ib is normally Category 2 (EPL Gb)');
  if (prots.includes('nA') && cat && cat!=='3') warnings.push('Ex nA is normally Category 3 (EPL Gc)');
  if (prots.includes('ma') && cat && cat!=='1') warnings.push('Ex ma is normally Category 1');
  if (prots.includes('h')) warnings.push({ text: 'Ex h (special protection) requires site-specific review per IEC 60079-33', info: true });
  if (prots.includes('nL')) warnings.push('Ex nL is withdrawn from current IEC 60079-15 — verify whether this marking is legacy or should be Ex ic');

  return warnings;
}

function decodeATEX() {
  const raw = document.getElementById('atexInput').value.trim();
  if (!raw) return;
  const { grp, cat, envNorm, prots, gasgrpNorm, tempNorm, tempC, epl, warnings } = parseAtexMarking(raw);

  const rows = [
    ['Equipment Group', grp, grp ? ATEX_DB.group[grp] : null],
    ['Category', cat, cat ? ATEX_DB.cat[cat] : null],
    ['Environment', envNorm, envNorm ? ATEX_DB.env[envNorm] : null],
    ['Protection Concept(s)', prots.length ? prots.join(' + ') : null, prots.map(p => ATEX_DB.prot[p] || '(unknown)').join('<br>')],
    ['Gas/Dust Group', gasgrpNorm, gasgrpNorm ? ATEX_DB.gasgrp[gasgrpNorm] : null],
    ['Temperature Class', tempNorm || (tempC != null ? `T${tempC}°C` : null), tempNorm ? ATEX_DB.temp[tempNorm] : tempC != null ? `Max surface temperature ${tempC}°C (dust)` : null],
    ['EPL', epl, epl ? ATEX_DB.epl[epl] : null],
  ];

  let html = '<div class="mt-12">';
  html += '<table><thead><tr><th>Field</th><th>Value</th><th>Meaning</th></tr></thead><tbody>';
  rows.forEach(([name, val, desc]) => {
    const color = val ? 'var(--accent)' : 'var(--danger)';
    html += `<tr><td class="atex-field-name">${name}</td><td style="font-family:var(--mono);color:${color}">${val || '—'}</td><td class="muted">${desc || '<span style="color:var(--danger)">Not identified</span>'}</td></tr>`;
  });
  html += '</tbody></table>';
  html += atexWarningsHtml(warnings);
  html += '</div>';
  document.getElementById('atexDecodeResult').innerHTML = html;
}

// Renders a list of compatibility warnings as .notice blocks. Each entry is either a plain
// string (cautionary — amber) or { text, info: true } (advisory — accent-tinted).
function atexWarningsHtml(warnings) {
  if (!warnings.length) return '';
  const rows = warnings.map(w => {
    const info = typeof w === 'object' && w.info;
    const text = typeof w === 'object' ? w.text : w;
    return `<div class="notice${info ? ' info' : ''}" style="margin-top:0"><svg><use href="#i-warn"/></svg><span>${text}</span></div>`;
  }).join('');
  return `<div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">${rows}</div>`;
}

// ENCODER — supports up to 4 protection concepts
const encState = { group:null, cat:null, env:[], prot:[], gasgrp:null, temp:null, epl:null };
const ENC_MAX_PROT = 4;

function safeId(key, val) { return 'enc_'+key+'_'+val.replace(/\//g,'_').replace(/\s/g,'_'); }

function mkEncBtns(containerId, items, key) {
  const el = document.getElementById(containerId);
  const multi = key === 'prot' || key === 'env';
  el.innerHTML = items.map(([val,label,desc]) =>
    `<button class="btn" id="${safeId(key,val)}" onclick="encSelect('${key}','${val.replace(/'/g,"\\'")}',${multi})" title="${desc||''}">${val}${label?'<span style=\'color:var(--text2);font-size:0.72rem\'>  '+label+'</span>':''}</button>`
  ).join('');
}

function encSelect(key, val, multi) {
  if (multi) {
    const arr = encState[key];
    const i = arr.indexOf(val);
    if (i >= 0) { arr.splice(i,1); document.getElementById(safeId(key,val)).classList.remove('active'); }
    else {
      if (key === 'prot' && arr.length >= ENC_MAX_PROT) { toast('Max 4 protection concepts'); return; }
      arr.push(val);
      document.getElementById(safeId(key,val)).classList.add('active');
    }
  } else {
    const prev = encState[key];
    if (prev) { const old = document.getElementById(safeId(key,prev)); if (old) old.classList.remove('active'); }
    encState[key] = val;
    document.getElementById(safeId(key,val)).classList.add('active');
  }
  buildATEX();
}

function buildATEX() {
  const { group, cat, env, prot, gasgrp, temp, epl } = encState;
  let parts = [];
  if (group) parts.push(group);
  if (cat) parts.push(cat);
  if (env.length) parts.push(env.join(''));
  if (prot.length) parts.push('Ex ' + prot.join(' '));
  if (gasgrp) parts.push(gasgrp);
  if (temp) parts.push(temp);
  if (epl) parts.push(epl);
  const marking = parts.join(' ');
  const warnings = [];
  if (cat==='1' && epl && !['Ga','Da','Ma'].includes(epl)) warnings.push('Category 1 should pair with EPL Ga, Da, or Ma');
  if (cat==='2' && epl && !['Gb','Db','Mb'].includes(epl)) warnings.push('Category 2 should pair with EPL Gb, Db');
  if (cat==='3' && epl && !['Gc','Dc'].includes(epl)) warnings.push('Category 3 should pair with EPL Gc or Dc');
  if (cat==='M1' && epl && epl!=='Ma') warnings.push('Category M1 should pair with EPL Ma');
  if (cat==='M2' && epl && !['Ma','Mb'].includes(epl)) warnings.push('Category M2 should pair with EPL Ma or Mb');
  if (prot.includes('ia') && cat && cat!=='1') warnings.push('Ex ia is normally Category 1');
  if (prot.includes('nA') && cat && cat!=='3') warnings.push('Ex nA is normally Category 3');
  if (prot.includes('nL')) warnings.push('Ex nL is withdrawn from current IEC 60079-15 — consider Ex ic instead');
  if (marking.trim()) document.getElementById('encodeResult').innerHTML = makeCopyBox(marking, 'ATEX Marking:');
  document.getElementById('encodeWarnings').innerHTML = atexWarningsHtml(warnings);
}

function initEncoder() {
  mkEncBtns('enc-group', [['I','Mining','Group I: Mining'],['II','Surface','Group II: Surface']], 'group');
  mkEncBtns('enc-cat', [
    ['1','Zone 0/20','Category 1 — highest protection (Group II)'],
    ['2','Zone 1/21','Category 2 — high protection (Group II)'],
    ['3','Zone 2/22','Category 3 — normal protection (Group II)'],
    ['M1','Zone M1','Category M1 — Group I mining, remains energised in explosive atmosphere'],
    ['M2','Zone M2','Category M2 — Group I mining, de-energised if explosive atmosphere present']
  ], 'cat');
  mkEncBtns('enc-env', [['G','Gas/Vapour','Gas or vapour environment'],['D','Dust','Dust environment']], 'env');
  mkEncBtns('enc-prot', [
    ['d','Flameproof','Ex d: flameproof enclosure — contains internal explosion'],
    ['e','Increased Safety','Ex e: increased safety — extra ignition prevention'],
    ['ia','IS (ia)','Ex ia: intrinsic safety — safe with 2 faults (Zone 0)'],
    ['ib','IS (ib)','Ex ib: intrinsic safety — safe with 1 fault (Zone 1)'],
    ['ic','IS (ic)','Ex ic: intrinsic safety — safe under normal conditions (Zone 2)'],
    ['px','Press. (px)','Ex px: pressurisation — reduces Zone 1 to non-hazardous'],
    ['py','Press. (py)','Ex py: pressurisation — maintains Zone 1'],
    ['pz','Press. (pz)','Ex pz: pressurisation — reduces Zone 2 to non-hazardous'],
    ['ma','Encap. (ma)','Ex ma: encapsulation — Category 1 / Zone 0'],
    ['mb','Encap. (mb)','Ex mb: encapsulation — Category 2 / Zone 1'],
    ['mc','Encap. (mc)','Ex mc: encapsulation — Zone 2'],
    ['nA','Non-sparking','Ex nA: non-sparking — Zone 2 only'],
    ['nR','Rest. breath.','Ex nR: restricted breathing enclosure'],
    ['nC','Sealed device','Ex nC: sealed or hermetically sealed device'],
    ['t','Dust encl. (t)','Ex t: dust protection by enclosure (replaces Ex tD)'],
    ['o','Oil immersion','Ex o: oil immersion — submerged in insulating oil'],
    ['q','Powder fill','Ex q: powder/quartz sand filling'],
    ['h','Special (h)','Ex h: special protection per IEC 60079-33'],
  ], 'prot');
  mkEncBtns('enc-gasgrp', [
    ['IIA','Propane','Group IIA: propane, acetone (~180μJ MIE)'],
    ['IIB','Ethylene','Group IIB: ethylene, hydrogen sulphide (~60μJ MIE)'],
    ['IIC','H₂/Acetylene','Group IIC: hydrogen, acetylene (~17μJ MIE) — most severe'],
    ['IIIA','Fibres','Group IIIA: combustible flyings (e.g. textile fluff)'],
    ['IIIB','NC Dust','Group IIIB: non-conductive dust (e.g. flour, coal)'],
    ['IIIC','Cond. Dust','Group IIIC: conductive dust (e.g. aluminium, magnesium)']
  ], 'gasgrp');
  mkEncBtns('enc-temp', [['T1','450°C'],['T2','300°C'],['T3','200°C'],['T4','135°C'],['T5','100°C'],['T6','85°C']], 'temp');
  mkEncBtns('enc-epl', [
    ['Ga','Zone 0','EPL Ga: Gas atmosphere — Zone 0 capable (very high protection)'],
    ['Gb','Zone 1','EPL Gb: Gas atmosphere — Zone 1 capable (high protection)'],
    ['Gc','Zone 2','EPL Gc: Gas atmosphere — Zone 2 capable (enhanced protection)'],
    ['Da','Zone 20','EPL Da: Dust atmosphere — Zone 20 capable'],
    ['Db','Zone 21','EPL Db: Dust atmosphere — Zone 21 capable'],
    ['Dc','Zone 22','EPL Dc: Dust atmosphere — Zone 22 capable'],
    ['Ma','M1','EPL Ma: Mining — Zone M1 (remains energised in explosive atmos.)'],
    ['Mb','M2','EPL Mb: Mining — Zone M2 (de-energised before explosive atmos.)'],
  ], 'epl');
}

function renderZoneMatrix() {
  let html = '<table><thead><tr><th>Zone</th><th>Type</th><th>EPL</th><th>Allowed Categories</th><th>Description</th></tr></thead><tbody>';
  ZONE_MATRIX.forEach(row => {
    html += `<tr>
      <td><span class="tag tag-blue" style="font-family:var(--head);font-size:0.85rem">${row.zone}</span></td>
      <td>${row.type}</td>
      <td><span class="tag tag-orange">${row.epl}</span></td>
      <td>${row.cats.map(c => `<span class="tag tag-green">Cat ${c}</span>`).join(' ')}</td>
      <td class="muted">${row.desc}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('zoneMatrix').innerHTML = html;
}

// ── IP Rating (moved from General Calcs to ATEX tab) ─────
const IP_FIRST_DESC = [
  'No protection against solid objects',
  'Protected against solid objects >50mm — e.g. back of hand',
  'Protected against solid objects >12.5mm — e.g. fingers',
  'Protected against solid objects >2.5mm — e.g. tools, thick wires',
  'Protected against solid objects >1mm — e.g. thin wires, screws',
  'Dust protected — limited ingress, no harmful deposit',
  'Dust tight — complete prevention of dust ingress'
];
const IP_SECOND_DESC = [
  'No protection against water',
  'Protection against vertically dripping water',
  'Protection against dripping water up to 15° from vertical',
  'Protection against spraying water up to 60° from vertical',
  'Protection against water splashing from any direction',
  'Protection against water jets from any direction',
  'Protection against powerful water jets / heavy seas',
  'Protection against temporary immersion up to 1m for 30 min',
  'Protection against continuous immersion (manufacturer specified depth)',
  'Protection against powerful high-temperature jets (IEC 60529 Amd 2)'
];

function setIPAtex(d1, d2) {
  document.getElementById('atex_ip1').value = d1;
  document.getElementById('atex_ip2').value = d2;
  calcIPAtex();
}

function calcIPAtex() {
  const d1 = parseInt(document.getElementById('atex_ip1')?.value);
  const d2 = parseInt(document.getElementById('atex_ip2')?.value);
  const r = document.getElementById('atexIPResult'); if (!r) return;
  // Left card: IP highlighted on first digit; Right card: IP highlighted on second digit
  const ipBig = `font-family:var(--head);font-size:2.6rem;font-weight:800;line-height:1`;
  const plain = `color:var(--text)`;
  const hi    = `color:var(--accent)`;
  r.innerHTML = `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div class="ip-desc-box">
      <div style="${ipBig}"><span style="${plain}">IP</span><span style="${hi}">${d1}</span><span style="${plain}">${d2}</span></div>
      <div style="font-size:0.82rem;color:var(--accent);margin:8px 0 6px;font-weight:600">1st Digit ${d1} — Solid Particle Ingress</div>
      <div class="ip-detail">${IP_FIRST_DESC[d1]||'—'}</div>
    </div>
    <div class="ip-desc-box">
      <div style="${ipBig}"><span style="${plain}">IP</span><span style="${plain}">${d1}</span><span style="${hi}">${d2}</span></div>
      <div style="font-size:0.82rem;color:var(--accent);margin:8px 0 6px;font-weight:600">2nd Digit ${d2} — Water Ingress</div>
      <div class="ip-detail">${IP_SECOND_DESC[d2]||'—'}</div>
    </div>
  </div>
  <div style="margin-top:12px;text-align:center">
    <span style="font-family:var(--head);font-size:1.4rem;font-weight:700;color:var(--accent)">IP${d1}${d2}</span>
    <button class="copy-btn" style="position:relative;top:0;right:0;margin-left:10px" onclick="copyText('IP${d1}${d2}')">Copy</button>
  </div>`;
}

// ── 2.6 Suitability check — equipment marking vs area classification ─────
// One verdict per criterion (EPL/zone, environment, gas/dust group, temperature), each with the
// reason, so a failure says exactly which part of the marking doesn't suit the area.
const ZONE_REQ = {
  '0':  { env: 'G', epls: ['Ga'] },            '1':  { env: 'G', epls: ['Ga','Gb'] },        '2':  { env: 'G', epls: ['Ga','Gb','Gc'] },
  '20': { env: 'D', epls: ['Da'] },            '21': { env: 'D', epls: ['Da','Db'] },        '22': { env: 'D', epls: ['Da','Db','Dc'] },
};
const GAS_RANK = { IIA: 1, IIB: 2, IIC: 3 }, DUST_RANK = { IIIA: 1, IIIB: 2, IIIC: 3 };

function atexSuitUseDecoder() {
  const v = document.getElementById('atexInput')?.value || '';
  document.getElementById('suitMarking').value = v;
  atexSuitCheck();
}

function atexSuitZoneChange() {
  const dust = ['20','21','22'].includes(document.getElementById('suitZone').value);
  document.getElementById('suitGasBox').classList.toggle('hidden', dust);
  document.getElementById('suitDustBox').classList.toggle('hidden', !dust);
  atexSuitCheck();
}

function atexSuitCheck() {
  const out = document.getElementById('suitResult');
  const raw = document.getElementById('suitMarking')?.value.trim();
  if (!out) return;
  if (!raw) { out.innerHTML = '<p class="muted small">Paste an equipment marking (or pull it from the decoder) to check it against the area.</p>'; return; }
  const zone = document.getElementById('suitZone').value;
  const req = ZONE_REQ[zone];
  const dust = req.env === 'D';
  const m = parseAtexMarking(raw);

  // Equipment EPL: explicit, else implied by ATEX category + environment letter
  const envLetter = m.envNorm === 'GD' ? req.env : m.envNorm;
  const impliedEpl = !m.epl && m.cat && envLetter ? envLetter + ({ '1': 'a', '2': 'b', '3': 'c' })[m.cat] : null;
  const epl = m.epl || impliedEpl;
  const rows = [];

  // 1. Environment
  const eqEnv = m.envNorm || (epl ? epl[0] : null) || (m.gasgrpNorm ? (m.gasgrpNorm.startsWith('III') ? 'D' : 'G') : null);
  rows.push(eqEnv == null
    ? ['Environment', null, 'Marking has no G/D letter, EPL or group to tell gas from dust']
    : [`Environment — ${dust ? 'dust' : 'gas'} area`, eqEnv.includes(req.env), eqEnv.includes(req.env) ? `Equipment is marked for ${eqEnv === 'GD' ? 'gas and dust' : eqEnv === 'G' ? 'gas' : 'dust'}` : `Equipment is marked for ${eqEnv === 'G' ? 'gas' : 'dust'} only`]);

  // 2. EPL vs zone
  rows.push(epl == null
    ? [`EPL — Zone ${zone}`, null, 'No EPL or category found in the marking']
    : [`EPL — Zone ${zone}`, req.epls.includes(epl), `${epl}${impliedEpl ? ' (implied by Category ' + m.cat + ')' : ''} — Zone ${zone} needs ${req.epls.join(' / ')}`]);

  // 3. Group
  if (!dust) {
    const need = document.getElementById('suitGasGrp').value;
    const g = m.gasgrpNorm;
    if (g && GAS_RANK[g]) rows.push(['Gas group', GAS_RANK[g] >= GAS_RANK[need], `Equipment ${g} ${GAS_RANK[g] >= GAS_RANK[need] ? 'covers' : 'does not cover'} ${need}${GAS_RANK[g] > GAS_RANK[need] ? ' (higher group is suitable for lower)' : ''}`]);
    else if (m.grp === 'II' && !g) rows.push(['Gas group', true, 'Group II with no subdivision — suitable for IIA/IIB/IIC (typical of Ex e, Ex m, Ex p); confirm on the certificate']);
    else rows.push(['Gas group', false, g ? `${g} is a dust/mining group, not a gas group` : 'No gas group found in the marking']);
  } else {
    const need = document.getElementById('suitDustGrp').value;
    const g = m.gasgrpNorm;
    if (g && DUST_RANK[g]) rows.push(['Dust group', DUST_RANK[g] >= DUST_RANK[need], `Equipment ${g} ${DUST_RANK[g] >= DUST_RANK[need] ? 'covers' : 'does not cover'} ${need}`]);
    else rows.push(['Dust group', false, g ? `${g} is a gas group, not a dust group` : 'No dust group (IIIA/B/C) found in the marking']);
  }

  // 4. Temperature
  if (!dust) {
    const need = document.getElementById('suitTClass').value; // 'T3'
    const t = m.tempNorm;
    rows.push(t
      ? ['Temperature class', +t[1] >= +need[1], `${t} (max ${ATEX_DB.temp[t].match(/\d+°C/)[0]}) ${+t[1] >= +need[1] ? 'is at or below' : 'exceeds'} the ${need} limit (${ATEX_DB.temp[need].match(/\d+°C/)[0]}) for this gas`]
      : ['Temperature class', null, 'No T-class (T1–T6) found in the marking']);
  } else {
    const max = parseFloat(document.getElementById('suitDustT').value);
    rows.push(m.tempC == null
      ? ['Max surface temperature', null, 'No T°C rating (e.g. T135°C) found in the marking']
      : isNaN(max) ? ['Max surface temperature', null, `Equipment T${m.tempC}°C — enter the area's permitted maximum to check`]
      : ['Max surface temperature', m.tempC <= max, `Equipment T${m.tempC}°C ${m.tempC <= max ? '≤' : '>'} area maximum ${max}°C`]);
  }

  const badge = ok => ok === null ? `<span class="badge mut">Can't check</span>` : ok ? `<span class="badge pass"><svg><use href="#i-check"/></svg>Suitable</span>` : `<span class="badge fail"><svg><use href="#i-x"/></svg>Not suitable</span>`;
  const anyFail = rows.some(r => r[1] === false), anyUnknown = rows.some(r => r[1] === null);
  const verdict = anyFail ? `<span class="badge fail verdict"><svg><use href="#i-x"/></svg>NOT SUITABLE FOR THIS AREA</span>`
    : anyUnknown ? `<span class="badge warn verdict"><svg><use href="#i-warn"/></svg>INCOMPLETE — CHECK THE CERTIFICATE</span>`
    : `<span class="badge pass verdict"><svg><use href="#i-check"/></svg>SUITABLE ON MARKING</span>`;
  out.innerHTML = `<table class="mt-8"><thead><tr><th>Criterion</th><th>Verdict</th><th>Reason</th></tr></thead><tbody>
    ${rows.map(([k, ok, why]) => `<tr><td class="atex-field-name">${k}</td><td>${badge(ok)}</td><td class="muted">${why}</td></tr>`).join('')}
  </tbody></table>
  <div class="mt-12">${verdict}</div>
  <div class="notice mt-12"><svg><use href="#i-warn"/></svg><span>Marking-level check only. Also confirm ambient range (Ta), any "X" special conditions of use on the certificate, and installation requirements per IEC 60079-14.</span></div>`;
}
