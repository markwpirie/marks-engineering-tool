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

function updateCableCores() {
  const rating = document.getElementById('c_rating').value;
  const app = document.getElementById('c_app').value;
  const sel = document.getElementById('c_cores');
  sel.innerHTML = '';

  if (app === 'Earth') {
    const csas = [6,10,16,25,35,50,70,95,120,150,185,240,300];
    csas.forEach(c => sel.add(new Option(c + ' mm²', c)));
    document.getElementById('c_csa').innerHTML = '<option>—</option>';
    showCableResult();
    return;
  }

  const data = CABLE_DATA[rating][app];
  if (!data) return;
  const isPower = app === 'Power';

  if (isPower) {
    const cores = [...new Set(data.entries.map(e => e[0]))].sort((a,b)=>a-b);
    cores.forEach(c => sel.add(new Option(c + ' core(s)', c)));
  } else {
    const combos = [...new Set(data.entries.map(e => `${e[0]}-${e[1]}`))];
    combos.forEach(c => {
      const [type,count] = c.split('-');
      sel.add(new Option(`${count} ${type==='PR'?'Pair':'Triple'}(s)`, c));
    });
  }
  if (sel.options.length > 0) sel.value = sel.options[0].value;
  updateCableCSA();
}

function updateCableCSA() {
  const rating = document.getElementById('c_rating').value;
  const app = document.getElementById('c_app').value;
  const coresVal = document.getElementById('c_cores').value;
  const csaSel = document.getElementById('c_csa');
  csaSel.innerHTML = '';

  if (app === 'Earth') {
    csaSel.add(new Option(coresVal + ' mm²', coresVal));
    showCableResult(); return;
  }

  const data = CABLE_DATA[rating][app];
  if (!data) return;
  const isPower = app === 'Power';

  if (isPower) {
    const cores = parseInt(coresVal);
    data.entries.filter(e=>e[0]===cores).forEach(e => csaSel.add(new Option(e[1]+' mm²', e[1])));
  } else {
    const [type,count] = coresVal.split('-');
    data.entries.filter(e=>e[0]===type&&e[1]===parseInt(count)).forEach(e => csaSel.add(new Option(e[2]+' mm²', e[2])));
  }
  if (csaSel.options.length > 0) csaSel.value = csaSel.options[0].value;
  showCableResult();
}

function showCableResult() {
  const rating = document.getElementById('c_rating').value;
  const app = document.getElementById('c_app').value;
  const coresVal = document.getElementById('c_cores').value;
  const csa = parseFloat(document.getElementById('c_csa').value);
  const data = app==='Earth' ? CABLE_DATA.BFOU.Earth : CABLE_DATA[rating][app];
  if (!data) return;

  let entry, OD, innerOD, weight, current;
  const isPower = app==='Power';

  if (app==='Earth') {
    entry = CABLE_DATA.BFOU.Earth.entries.find(e=>e[1]===csa);
    if (!entry) return;
    OD=entry[2]; weight=entry[3]; current=null; innerOD=null;
  } else if (isPower) {
    const cores=parseInt(coresVal);
    entry=data.entries.find(e=>e[0]===cores&&e[1]===csa);
    if (!entry) return;
    OD=entry[2]; weight=entry[3]; current=entry[4]; innerOD=entry[5];
  } else {
    const [type,count]=coresVal.split('-');
    entry=data.entries.find(e=>e[0]===type&&e[1]===parseInt(count)&&e[2]===csa);
    if (!entry) return;
    OD=entry[3]; weight=entry[4]; current=null; innerOD=entry[5];
  }

  const minBend=(OD*8).toFixed(0);
  let html=`<div class="gland-info-grid">
    <div class="gland-info-item"><div class="key">Cable Type</div><div class="val" style="font-size:0.8rem">${data.label}</div></div>
    <div class="gland-info-item"><div class="key">Overall OD</div><div class="val" style="color:var(--accent);font-size:1.1rem">${OD} mm</div></div>
    ${innerOD ? `<div class="gland-info-item"><div class="key">OD over inner insulation</div><div class="val" style="color:var(--accent4)">${innerOD} mm</div></div>` : ''}
    <div class="gland-info-item"><div class="key">Weight</div><div class="val">${weight} kg/km</div></div>
    ${current?`<div class="gland-info-item"><div class="key">Current @45°C</div><div class="val">${current} A</div></div>`:''}
    <div class="gland-info-item"><div class="key">Voltage Rating</div><div class="val">${data.voltage}</div></div>
    <div class="gland-info-item"><div class="key">Min. Bend Radius</div><div class="val">${minBend} mm (8×OD)</div></div>
    <div class="gland-info-item" style="grid-column:1/-1"><div class="key">Colour Code</div><div class="val" style="font-size:0.8rem">${data.colourCode}</div></div>
  </div>`;

  document.getElementById('cableResult').innerHTML = html;
  const tcSec = document.getElementById('tempCorrSection');
  tcSec.style.display = (isPower && current) ? 'block' : 'none';
  if (isPower && current) { window._baseCurrent=current; applyTempCorr(); }

  showGlandRec(OD);
}

function applyTempCorr() {
  const factor = parseFloat(document.getElementById('ambTemp').value);
  const base = window._baseCurrent;
  if (!base) return;
  const corrected = (base*factor).toFixed(1);
  document.getElementById('tempCorrResult').innerHTML = `<div class="result-box">Corrected: <strong style="color:var(--accent);font-size:1.1rem">${corrected} A</strong> (base ${base}A × ${factor})</div>`;
}

function showGlandRec(OD) {
  const useNPT = currentGlandTab==='npt';
  let html='';

  // ── 501/453/UNIV first ──
  const g453=GLAND_453.find(g=>OD>=g.outerMin&&OD<=g.outerMax);
  if (g453) {
    const entry=useNPT?g453.npt.split(' ')[0]:g453.metric;
    const orderCode=getGlandOrderCode('453',g453.size,useNPT?'npt':'metric',entry);
    const nptEx=`501/453/UNIV/${g453.size}/${g453.npt.split(' ')[0].replace('"','').replace('/','')+'NP'}`;
    const metEx=`501/453/UNIV/${g453.size}/${g453.metric.replace('/','-')}`;
    html+=`<div class="gland-card">
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:10px">
        <img src="${'jpg/501-453.jpg'}" alt="Hawke 501/453/UNIV" style="width:180px;border-radius:6px;border:1px solid var(--border);flex-shrink:0">
        <div style="flex:1">
          <div class="gland-card-header" style="margin-bottom:6px">Hawke 501/453/UNIV — Coldflow, Armoured/Braided <span class="tag tag-blue">ARMOURED</span></div>
          <p style="font-size:0.78rem;color:var(--text2)">Dual certified Exe/Exd. Passive diaphragm seal for cold flow cables. Reversible armour clamp for SWA, wire braid, steel tape. IP66/67/68/69.</p>
        </div>
      </div>
      <div class="gland-info-grid">
        <div class="gland-info-item"><div class="key">Size Ref</div><div class="val">${g453.size}</div></div>
        <div class="gland-info-item"><div class="key">${useNPT?'NPT Entry':'Metric Entry'}</div><div class="val">${useNPT?g453.npt:g453.metric}</div></div>
        <div class="gland-info-item"><div class="key">Inner Sheath Range</div><div class="val">${g453.innerMin}–${g453.innerMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Outer Sheath Range</div><div class="val">${g453.outerMin}–${g453.outerMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Armour Wire Ø</div><div class="val">${g453.arm1} mm</div></div>
        <div class="gland-info-item"><div class="key">Cable OD ${OD}mm</div><div class="val"><span class="tag tag-green">FITS</span></div></div>
        <div class="gland-info-item"><div class="key">Example Order Code</div><div class="val" style="font-family:var(--mono);font-size:0.8rem">${orderCode} <button class="copy-btn" style="position:relative;top:0;right:0" onclick="copyText('${orderCode}')">⎘</button></div></div>
      </div>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text2)">
        Metric ex: <code>${metEx}</code> &nbsp;|&nbsp; NPT ex: <code>${nptEx}</code>
      </div>
      ${useNPT?'<div style="margin-top:8px;font-size:0.75rem;color:var(--warn)">⚠️ NPT entries in ATEX zones require certified adapters — check MOC implications</div>':''}
    </div>`;
  } else {
    html+=`<div class="gland-card"><div class="gland-card-header">Hawke 501/453/UNIV — Coldflow, Armoured <span class="tag tag-red">NO MATCH</span></div><p style="color:var(--text2)">Cable OD ${OD}mm is outside the 501/453 outer sheath range.</p></div>`;
  }

  // ── ICG/653/UNIV second ──
  const g653=GLAND_653.find(g=>OD>=g.outerMin&&OD<=g.outerMax);
  if (g653) {
    const entry=useNPT?g653.npt.split(' ')[0]:g653.metric;
    const orderCode=getGlandOrderCode('653',g653.size,useNPT?'npt':'metric',entry);
    const nptEx=`ICG/653/UNIV/${g653.size}/${g653.npt.split(' ')[0].replace('"','').replace('/','')+'NP'}`;
    const metEx=`ICG/653/UNIV/${g653.size}/${g653.metric}`;
    html+=`<div class="gland-card">
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:10px">
        <img src="${'jpg/icg653.jpg'}" alt="Hawke ICG/653/UNIV" style="width:180px;border-radius:6px;border:1px solid var(--border);flex-shrink:0">
        <div style="flex:1">
          <div class="gland-card-header" style="margin-bottom:6px">Hawke ICG/653/UNIV — Barrier Gland <span class="tag tag-orange">BARRIER</span></div>
          <p style="font-size:0.78rem;color:var(--text2)">Dual certified Exe/Exd. Seals around individual cores. Cold flow, hygroscopic fillers, fibre optic cables. ExPress resin standard (30 min cure). QSP available (suffix Q).</p>
        </div>
      </div>
      <div class="gland-info-grid">
        <div class="gland-info-item"><div class="key">Size Ref</div><div class="val">${g653.size}</div></div>
        <div class="gland-info-item"><div class="key">${useNPT?'NPT Entry':'Metric Entry'}</div><div class="val">${useNPT?g653.npt:g653.metric}</div></div>
        <div class="gland-info-item"><div class="key">Max Inner Sheath</div><div class="val">${g653.innerMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Max Over Core Ø</div><div class="val">${g653.coreMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Outer Sheath Range</div><div class="val">${g653.outerMin}–${g653.outerMax} mm</div></div>
        <div class="gland-info-item"><div class="key">Cable OD ${OD}mm</div><div class="val"><span class="tag tag-green">FITS</span></div></div>
        <div class="gland-info-item"><div class="key">Example Order Code</div><div class="val" style="font-family:var(--mono);font-size:0.8rem">${orderCode} <button class="copy-btn" style="position:relative;top:0;right:0" onclick="copyText('${orderCode}')">⎘</button></div></div>
      </div>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text2)">
        Metric ex: <code>${metEx}</code> &nbsp;|&nbsp; NPT ex: <code>${nptEx}</code>
      </div>
      ${useNPT?'<div style="margin-top:6px;font-size:0.75rem;color:var(--warn)">⚠️ NPT entries in ATEX zones require certified adapters — check MOC implications</div>':''}
    </div>`;
  } else {
    html+=`<div class="gland-card"><div class="gland-card-header">Hawke ICG/653/UNIV — Barrier Gland <span class="tag tag-red">NO MATCH</span></div><p style="color:var(--text2)">Cable OD ${OD}mm is outside the ICG/653 outer sheath range.</p></div>`;
  }

  // ── 501/421 last ──
  const g421=GLAND_421.find(g=>OD>=g.stdMin&&OD<=g.stdMax);
  const g421alt=g421?null:GLAND_421.find(g=>g.altMin&&OD>=g.altMin&&OD<=g.altMax);
  const gland421=g421||g421alt;
  if (gland421) {
    const isSeal=g421?'Standard Seal':'Alternative Seal (S)';
    const sealColor=g421?'tag-green':'tag-yellow';
    const entry=useNPT?gland421.npt.split(' ')[0]:gland421.metric;
    const orderCode=getGlandOrderCode('421',gland421.size,useNPT?'npt':'metric',entry)+(g421alt?'S':'');
    const nptEx=`501/421/UNIV/${gland421.size}/${gland421.npt.split(' ')[0].replace('"','').replace('/','')+'NP'}`;
    const metEx=`501/421/UNIV/${gland421.size}/${gland421.metric}`;
    html+=`<div class="gland-card">
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:10px">
        <img src="${'jpg/501-421.jpg'}" alt="Hawke 501/421" style="width:180px;border-radius:6px;border:1px solid var(--border);flex-shrink:0">
        <div style="flex:1">
          <div class="gland-card-header" style="margin-bottom:6px">Hawke 501/421/UNIV — Compression, Non-Armoured <span class="tag ${sealColor}">${isSeal}</span></div>
          <p style="font-size:0.78rem;color:var(--text2)">Dual certified Exe/Exd. For non-armoured elastomer and plastic insulated cables. Braid cables: braid passes into enclosure and terminates inside.</p>
        </div>
      </div>
      <div class="gland-info-grid">
        <div class="gland-info-item"><div class="key">Size Ref</div><div class="val">${gland421.size}</div></div>
        <div class="gland-info-item"><div class="key">${useNPT?'NPT Entry':'Metric Entry'}</div><div class="val">${useNPT?gland421.npt:gland421.metric}</div></div>
        <div class="gland-info-item"><div class="key">Std Seal OD Range</div><div class="val">${gland421.stdMin}–${gland421.stdMax} mm</div></div>
        ${gland421.altMin?`<div class="gland-info-item"><div class="key">Alt Seal OD Range</div><div class="val">${gland421.altMin}–${gland421.altMax} mm</div></div>`:''}
        <div class="gland-info-item"><div class="key">Cable OD ${OD}mm</div><div class="val"><span class="tag ${g421?'tag-green':g421alt?'tag-yellow':'tag-red'}">${g421?'STD FIT':g421alt?'ALT FIT':'NO FIT'}</span></div></div>
        <div class="gland-info-item"><div class="key">Example Order Code</div><div class="val" style="font-family:var(--mono);font-size:0.8rem">${orderCode} <button class="copy-btn" style="position:relative;top:0;right:0" onclick="copyText('${orderCode}')">⎘</button></div></div>
      </div>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text2)">
        Metric ex: <code>${metEx}</code> &nbsp;|&nbsp; NPT ex: <code>${nptEx}</code>
      </div>
      ${useNPT?'<div style="margin-top:8px;font-size:0.75rem;color:var(--warn)">⚠️ NPT entries in ATEX zones require certified adapters — check MOC implications</div>':''}
    </div>`;
  } else {
    html+=`<div class="gland-card"><div class="gland-card-header">Hawke 501/421/UNIV — Compression, Non-Armoured <span class="tag tag-red">NO MATCH</span></div><p style="color:var(--text2)">Cable OD ${OD}mm is outside the 501/421 selection range.</p></div>`;
  }

  document.getElementById('glandResults').innerHTML=html;
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
