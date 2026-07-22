// ══════════════════════════════════════════════════════════
// TAB — CABLE & GLAND
// ══════════════════════════════════════════════════════════

let currentGlandTab = 'metric';

function switchGlandTab(tab) {
  currentGlandTab = tab;
  document.getElementById('gland-metric-btn').classList.toggle('active', tab==='metric');
  document.getElementById('gland-npt-btn').classList.toggle('active', tab==='npt');
  showCableResult();
}

function updateCableApp() { updateCableCores(); }

// Cores select values are always strings (HTML option values). Power/Earth 'cores' can be a
// plain number (e.g. "3") or a Draka 'NG' earth-variant code (e.g. "3G") — never coerce the
// latter with parseInt, it must match the string exactly.
function parseCoresVal(v) { return /G$/i.test(v) ? v : parseInt(v, 10); }

function sortCores(a, b) {
  const na = parseInt(a, 10), nb = parseInt(b, 10);
  if (na !== nb) return na - nb;
  // same leading number: plain core count before its 'G' earth variant
  return String(a).length - String(b).length;
}

function updateCableCores() {
  const rating = document.getElementById('c_rating').value;
  const app = document.getElementById('c_app').value;
  const sel = document.getElementById('c_cores');
  const prevVal = sel.value;
  sel.innerHTML = '';

  if (app === 'Earth') {
    const csas = [...new Set(CABLE_DATA[rating].Earth.entries.map(e => e.csa))].sort((a,b)=>a-b);
    csas.forEach(c => sel.add(new Option(c + ' mm²', c)));
    restoreSelectValue(sel, prevVal);
    updateCableCSA();
    return;
  }

  const data = CABLE_DATA[rating][app];
  if (!data) return;
  const isPower = app === 'Power';

  if (isPower) {
    const cores = [...new Set(data.entries.map(e => e.cores))].sort(sortCores);
    cores.forEach(c => {
      const label = /G$/i.test(c) ? `${c} (earth core)` : `${c} ${c===1?'core':'cores'}`;
      sel.add(new Option(label, c));
    });
  } else {
    const combos = [...new Set(data.entries.map(e => `${e.type}-${e.elements}`))];
    combos.sort((a,b) => parseInt(a.split('-')[1],10) - parseInt(b.split('-')[1],10));
    combos.forEach(c => {
      const [type,count] = c.split('-');
      const plural = count!=='1';
      const noun = type==='PR'?'Pair':type==='TR'?'Triple':'Quad';
      sel.add(new Option(`${count} ${noun}${plural?'s':''}`, c));
    });
  }
  restoreSelectValue(sel, prevVal);
  updateCableCSA();
}

function updateCableCSA() {
  const rating = document.getElementById('c_rating').value;
  const app = document.getElementById('c_app').value;
  const coresVal = document.getElementById('c_cores').value;
  const csaSel = document.getElementById('c_csa');
  const prevVal = csaSel.value;
  csaSel.innerHTML = '';

  if (app === 'Earth') {
    const csa = parseFloat(coresVal);
    csaSel.add(new Option(csa + ' mm²', csa));
    showCableResult(); return;
  }

  const data = CABLE_DATA[rating][app];
  if (!data) return;
  const isPower = app === 'Power';

  if (isPower) {
    const cores = parseCoresVal(coresVal);
    data.entries.filter(e=>e.cores===cores).forEach(e => csaSel.add(new Option(e.csa+' mm²', e.csa)));
  } else {
    const [type,count] = coresVal.split('-');
    data.entries.filter(e=>e.type===type&&e.elements===parseInt(count,10)).forEach(e => csaSel.add(new Option(e.csa+' mm²', e.csa)));
  }
  restoreSelectValue(csaSel, prevVal);
  showCableResult();
}

function showCableResult() {
  const rating = document.getElementById('c_rating').value;
  const app = document.getElementById('c_app').value;
  const coresVal = document.getElementById('c_cores').value;
  const csa = parseFloat(document.getElementById('c_csa').value);
  // UX P15 earth conductor is a standalone Draka product, independent of RFOU/BFOU fire rating —
  // read it from the selected rating's own Earth entry (both point at the same dataset).
  const data = CABLE_DATA[rating][app];
  if (!data) return;

  let entry, OD, innerOD, weight, current;
  const isPower = app==='Power';
  const isEarth = app==='Earth';

  if (isEarth) {
    entry = data.entries.find(e=>e.csa===csa);
    if (!entry) return;
    OD=entry.od; weight=entry.weight; current=entry.current; innerOD=null;
  } else if (isPower) {
    const cores=parseCoresVal(coresVal);
    entry=data.entries.find(e=>e.cores===cores&&e.csa===csa);
    if (!entry) return;
    OD=entry.od; weight=entry.weight; current=entry.current; innerOD=entry.innerOD;
  } else {
    const [type,count]=coresVal.split('-');
    entry=data.entries.find(e=>e.type===type&&e.elements===parseInt(count,10)&&e.csa===csa);
    if (!entry) return;
    OD=entry.od; weight=entry.weight; current=null; innerOD=entry.innerOD;
  }

  const minBend=(OD*8).toFixed(0);
  const fixedBend=(OD*6).toFixed(0);
  let extras = '';
  if (isPower || isEarth) {
    if (entry.insDiam!=null) extras += `<div><div class="k">Conductor OD Over Insulation</div><div class="v">${entry.insDiam}${entry.insDiamTol?' ± '+entry.insDiamTol:''} <small>mm</small></div></div>`;
    if (entry.condDiam!=null) extras += `<div><div class="k">Conductor OD</div><div class="v">${entry.condDiam} <small>mm</small></div></div>`;
    if (entry.r20!=null) extras += `<div><div class="k">Conductor R (20°C / 90°C)</div><div class="v">${entry.r20} / ${entry.r90} <small>Ω/km</small></div></div>`;
    if (entry.x50!=null) extras += `<div><div class="k">Reactance (50Hz / 60Hz)</div><div class="v">${entry.x50} / ${entry.x60} <small>Ω/km</small></div></div>`;
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

  let html=`<div class="spec">
    <div class="full"><div class="k">Cable Type</div><div class="v plain">${data.label}</div></div>
    <div><div class="k">Overall OD</div><div class="v hi">${OD}${entry.odTol?' ± '+entry.odTol:''} <small>mm</small></div></div>
    ${innerOD ? `<div><div class="k">OD over inner insulation</div><div class="v">${innerOD}${entry.innerODTol?' ± '+entry.innerODTol:''} <small>mm</small></div></div>` : ''}
    <div><div class="k">Min. Bend Radius</div><div class="v">${minBend} <small>mm install</small> / ${fixedBend} <small>mm fixed</small></div></div>
    ${current?`<div><div class="k">Current @45°C</div><div class="v hi">${current} <small>A</small></div></div>`:''}
    <div><div class="k">Voltage Rating</div><div class="v">${data.voltage}</div></div>
    ${extras}
    <div class="full"><div class="k">Colour Code</div><div class="v plain">${data.colourCode}</div></div>
  </div>
  ${entry.unverified ? `<div class="notice"><svg><use href="#i-warn"/></svg><span>Unverified — not present in the Draka NEK 606 datasheet; retained from the previous dataset. Confirm with manufacturer before use.</span></div>` : ''}`;

  document.getElementById('cableResult').innerHTML = html;
  const tcSec = document.getElementById('tempCorrSection');
  const hasNumericCurrent = (isPower || isEarth) && typeof current === 'number';
  tcSec.style.display = hasNumericCurrent ? 'block' : 'none';
  if (hasNumericCurrent) { window._baseCurrent=current; applyTempCorr(); }

  showGlandRec(OD, entry.odTol, innerOD, entry.innerODTol);
}

function applyTempCorr() {
  const factor = parseFloat(document.getElementById('ambTemp').value);
  const base = window._baseCurrent;
  if (base==null || typeof base !== 'number') return;
  const corrected = (base*factor).toFixed(1);
  document.getElementById('tempCorrResult').innerHTML = `<div class="result-box">Corrected: <strong style="color:var(--accent);font-size:1.1rem">${corrected} A</strong> (base ${base}A × ${factor})</div>`;
}

function showGlandRec(OD, odTol, innerOD, innerODTol) {
  const useNPT = currentGlandTab==='npt';
  document.getElementById('glandResults').innerHTML = renderAllGlandFamilies(OD, odTol, innerOD, innerODTol, useNPT);
}

function renderAWGSection() {
  let html=`<table><thead><tr><th>AWG</th><th>CSA (mm²)</th><th>≈IEC Equiv</th><th>Notes</th></tr></thead><tbody>`;
  AWG_CSA.forEach(r=>{
    const iec=r.note.match(/[\d.]+mm²/)?.[0];
    html+=`<tr>
      <td><span class="tag tag-blue">AWG ${r.awg}</span></td>
      <td style="font-family:var(--mono)">${r.csa} mm²</td>
      <td>${iec?`<span class="tag tag-green">${iec}</span>`:'—'}</td>
      <td style="color:var(--text2)">${r.note}</td>
    </tr>`;
  });
  html+='</tbody></table>';
  document.getElementById('awgCsaTable').innerHTML=html;
}
