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

function decodeATEX() {
  const raw = document.getElementById('atexInput').value.trim();
  if (!raw) return;

  // Tolerant — normalise dashes, collapse whitespace, handle missing spaces around known tokens
  const normalised = raw
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = normalised.split(/[\s,/]+/).filter(Boolean);

  const warnings = [];

  const grp = tokens.find(t => t==='I' || t==='II');
  const cat = tokens.find(t => ['1','2','3'].includes(t));

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
        if (/^[GDM][abc]$/i.test(tk) && tk.length===2) break;
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
      if (/^[GDM][abc]$/i.test(tk) && tk.length===2) break;
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

  // EPL
  let epl = null;
  for (const t of tokens) {
    const m = Object.keys(ATEX_DB.epl).find(k => k.toLowerCase() === t.toLowerCase());
    if (m) { epl = m; break; }
  }

  if (cat==='1' && epl && !['Ga','Da','Ma'].includes(epl)) warnings.push('⚠️ Category 1 should pair with EPL Ga, Da, or Ma');
  if (cat==='2' && epl && !['Gb','Db','Mb'].includes(epl)) warnings.push('⚠️ Category 2 should pair with EPL Gb, Db, or Mb');
  if (cat==='3' && epl && !['Gc','Dc'].includes(epl)) warnings.push('⚠️ Category 3 should pair with EPL Gc or Dc');
  if (prots.includes('ia') && cat && cat!=='1') warnings.push('⚠️ Ex ia is normally Category 1 (EPL Ga)');
  if (prots.includes('ib') && cat && cat!=='2') warnings.push('⚠️ Ex ib is normally Category 2 (EPL Gb)');
  if (prots.includes('nA') && cat && cat!=='3') warnings.push('⚠️ Ex nA is normally Category 3 (EPL Gc)');
  if (prots.includes('ma') && cat && cat!=='1') warnings.push('⚠️ Ex ma is normally Category 1');
  if (prots.includes('h')) warnings.push('ℹ️ Ex h (special protection) requires site-specific review per IEC 60079-33');

  const rows = [
    ['Equipment Group', grp, grp ? ATEX_DB.group[grp] : null],
    ['Category', cat, cat ? ATEX_DB.cat[cat] : null],
    ['Environment', envNorm, envNorm ? ATEX_DB.env[envNorm] : null],
    ['Protection Concept(s)', prots.length ? prots.join(' + ') : null, prots.map(p => ATEX_DB.prot[p] || '(unknown)').join('<br>')],
    ['Gas/Dust Group', gasgrpNorm, gasgrpNorm ? ATEX_DB.gasgrp[gasgrpNorm] : null],
    ['Temperature Class', tempNorm, tempNorm ? ATEX_DB.temp[tempNorm] : null],
    ['EPL', epl, epl ? ATEX_DB.epl[epl] : null],
  ];

  let html = '<div style="margin-top:12px">';
  html += '<table><thead><tr><th>Field</th><th>Value</th><th>Meaning</th></tr></thead><tbody>';
  rows.forEach(([name, val, desc]) => {
    const color = val ? 'var(--accent)' : 'var(--danger)';
    html += `<tr><td class="atex-field-name">${name}</td><td style="font-family:var(--mono);color:${color}">${val || '—'}</td><td style="color:var(--text2)">${desc || '<span style="color:var(--danger)">Not identified</span>'}</td></tr>`;
  });
  html += '</tbody></table>';
  if (warnings.length) {
    html += '<div style="margin-top:12px">';
    warnings.forEach(w => { html += `<div style="color:var(--warn);font-size:0.82rem;padding:4px 0">${w}</div>`; });
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('atexDecodeResult').innerHTML = html;
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
  if (cat==='1' && epl && !['Ga','Da','Ma'].includes(epl)) warnings.push('⚠️ Category 1 should pair with EPL Ga, Da, or Ma');
  if (cat==='2' && epl && !['Gb','Db','Mb'].includes(epl)) warnings.push('⚠️ Category 2 should pair with EPL Gb, Db');
  if (cat==='3' && epl && !['Gc','Dc'].includes(epl)) warnings.push('⚠️ Category 3 should pair with EPL Gc or Dc');
  if (prot.includes('ia') && cat && cat!=='1') warnings.push('⚠️ Ex ia is normally Category 1');
  if (prot.includes('nA') && cat && cat!=='3') warnings.push('⚠️ Ex nA is normally Category 3');
  if (marking.trim()) document.getElementById('encodeResult').innerHTML = makeCopyBox(marking, 'ATEX Marking:');
  document.getElementById('encodeWarnings').innerHTML = warnings.map(w => `<div style="color:var(--warn);font-size:0.8rem;padding:2px 0">${w}</div>`).join('');
}

function initEncoder() {
  mkEncBtns('enc-group', [['I','Mining','Group I: Mining'],['II','Surface','Group II: Surface']], 'group');
  mkEncBtns('enc-cat', [
    ['1','Zone 0/20','Category 1 — highest protection'],
    ['2','Zone 1/21','Category 2 — high protection'],
    ['3','Zone 2/22','Category 3 — normal protection']
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
      <td style="color:var(--text2)">${row.desc}</td>
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
