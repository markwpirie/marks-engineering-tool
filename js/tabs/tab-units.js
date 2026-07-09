// ══════════════════════════════════════════════════════════
// TAB — UNIT CONVERTER  v3.5
// ══════════════════════════════════════════════════════════

const UNITS = {
  Temperature: {
    emoji:'🌡️',
    units: ['°C','°F','K'],
    convert: (v, from, to) => {
      let c;
      if (from==='°C') c=v;
      else if (from==='°F') c=(v-32)*5/9;
      else c=v-273.15;
      if (to==='°C') return c;
      if (to==='°F') return c*9/5+32;
      return c+273.15;
    }
  },
  Pressure:        { emoji:'🔵', units: ['Pa','kPa','MPa','bar','mbar','psi','atm','mmHg','inHg','kg/cm²'], toBase: { Pa:1, kPa:1e3, MPa:1e6, bar:1e5, mbar:100, psi:6894.757, atm:101325, mmHg:133.322, inHg:3386.39, 'kg/cm²':98066.5 } },
  Mass:            { emoji:'⚖️', units: ['kg','g','mg','lb','oz','tonne','ton (US)','slug'], toBase: { kg:1, g:0.001, mg:1e-6, lb:0.453592, oz:0.0283495, tonne:1000, 'ton (US)':907.185, slug:14.5939 } },
  Force:           { emoji:'💪', units: ['N','kN','MN','lbf','kgf','dyne'], toBase: { N:1, kN:1000, MN:1e6, lbf:4.44822, kgf:9.80665, dyne:1e-5 } },
  Power:           { emoji:'⚡', units: ['W','kW','MW','HP (metric)','HP (imperial)','BTU/h','kcal/h'], toBase: { W:1, kW:1000, MW:1e6, 'HP (metric)':735.499, 'HP (imperial)':745.7, 'BTU/h':0.29307, 'kcal/h':1.163 } },
  Speed:           { emoji:'🚀', units: ['m/s','km/h','mph','knots','ft/s'], toBase: { 'm/s':1, 'km/h':0.277778, mph:0.44704, knots:0.514444, 'ft/s':0.3048 } },
  Distance:        { emoji:'📏', units: ['mm','cm','m','km','inch','ft','yd','mile','nm','µm'], toBase: { mm:0.001, cm:0.01, m:1, km:1000, inch:0.0254, ft:0.3048, yd:0.9144, mile:1609.344, nm:1e-9, µm:1e-6 } },
  Area:            { emoji:'📐', units: ['mm²','cm²','m²','km²','inch²','ft²','acre','hectare'], toBase: { 'mm²':1e-6, 'cm²':1e-4, 'm²':1, 'km²':1e6, 'inch²':6.4516e-4, 'ft²':0.0929, acre:4046.856, hectare:1e4 } },
  Volume:          { emoji:'🪣', units: ['ml','cl','l','m³','fl oz (UK)','fl oz (US)','pint (UK)','gallon (UK)','gallon (US)','bbl (oil)'], toBase: { ml:0.001, cl:0.01, l:1, 'm³':1000, 'fl oz (UK)':0.028413, 'fl oz (US)':0.029574, 'pint (UK)':0.568261, 'gallon (UK)':4.54609, 'gallon (US)':3.78541, 'bbl (oil)':158.987 } },
  Flow:            { emoji:'🌊', units: ['m³/s','m³/h','l/s','l/min','l/h','gal/min (US)','gal/min (UK)','bbl/day'], toBase: { 'm³/s':1, 'm³/h':1/3600, 'l/s':0.001, 'l/min':1/60000, 'l/h':1/3600000, 'gal/min (US)':6.30902e-5, 'gal/min (UK)':7.57682e-5, 'bbl/day':1.84013e-6 } },
  Density:         { emoji:'🧱', units: ['kg/m³','g/cm³','g/ml','lb/ft³','lb/in³','kg/l','sg (water=1)','ppg (US)'], toBase: { 'kg/m³':1, 'g/cm³':1000, 'g/ml':1000, 'lb/ft³':16.0185, 'lb/in³':27679.9, 'kg/l':1000, 'sg (water=1)':1000, 'ppg (US)':119.826 } },
  Torque:          { emoji:'🔧', units: ['N·m','N·cm','kN·m','lbf·ft','lbf·in','kgf·m'], toBase: { 'N·m':1, 'N·cm':0.01, 'kN·m':1000, 'lbf·ft':1.35582, 'lbf·in':0.112985, 'kgf·m':9.80665 } },
  Angle:           { emoji:'📡', units: ['degrees','radians','gradians','arcminutes','arcseconds'], toBase: { degrees:1, radians:180/Math.PI, gradians:0.9, arcminutes:1/60, arcseconds:1/3600 } },
  Time:            { emoji:'⏱️', units: ['seconds','minutes','hours','days','weeks','months (avg)','years (avg)'], toBase: { seconds:1, minutes:60, hours:3600, days:86400, weeks:604800, 'months (avg)':2628000, 'years (avg)':31536000 } },
  DrillingDensity: { emoji:'🛢️', units: ['sg','ppg (US)','ppg (UK)','lb/ft³','kg/m³','kg/l'], toBase: { sg:1, 'ppg (US)':0.11983, 'ppg (UK)':0.099776, 'lb/ft³':0.016018, 'kg/m³':0.001, 'kg/l':1 } },
};

let unitActiveCat = 'Temperature';
let unitActiveFrom = null;
let unitActiveTo = null;

function initUnitConverter() {
  // Build category buttons
  const catEl = document.getElementById('unitCatBtns');
  if (!catEl) return;
  catEl.innerHTML = Object.entries(UNITS).map(([key, def]) =>
    `<button class="btn${key===unitActiveCat?' active':''}" onclick="unitSelectCat('${key}')">${def.emoji} ${key}</button>`
  ).join('');
  unitSelectCat(unitActiveCat, true);
}

function unitSelectCat(cat, init) {
  const prev = unitActiveCat;
  unitActiveCat = cat;
  // Update category buttons
  document.querySelectorAll('#unitCatBtns .btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim().endsWith(cat) || b.onclick?.toString().includes(`'${cat}'`));
  });
  // Reset from/to to first two units of new category
  const u = UNITS[cat];
  if (!u) return;
  unitActiveFrom = u.units[0];
  unitActiveTo = u.units.length > 1 ? u.units[1] : u.units[0];
  renderUnitBtns();
  doConvert();
}

function renderUnitBtns() {
  const u = UNITS[unitActiveCat];
  if (!u) return;
  const fromEl = document.getElementById('unitFromBtns');
  const toEl   = document.getElementById('unitToBtns');
  if (!fromEl || !toEl) return;
  fromEl.innerHTML = u.units.map(unit =>
    `<button class="btn${unit===unitActiveFrom?' active':''}" onclick="unitSetFrom('${unit.replace(/'/g,"\\'")}')">${unit}</button>`
  ).join('');
  toEl.innerHTML = u.units.map(unit =>
    `<button class="btn${unit===unitActiveTo?' active':''}" onclick="unitSetTo('${unit.replace(/'/g,"\\'")}')">${unit}</button>`
  ).join('');
}

function unitSetFrom(unit) {
  unitActiveFrom = unit;
  renderUnitBtns();
  doConvert();
}
function unitSetTo(unit) {
  unitActiveTo = unit;
  renderUnitBtns();
  doConvert();
}
function swapUnits() {
  const tmp = unitActiveFrom;
  unitActiveFrom = unitActiveTo;
  unitActiveTo = tmp;
  renderUnitBtns();
  doConvert();
}

function doConvert() {
  const cat = unitActiveCat;
  const from = unitActiveFrom;
  const to   = unitActiveTo;
  const v = parseFloat(document.getElementById('unitVal')?.value);
  const resultEl = document.getElementById('unitResult');
  const allEl    = document.getElementById('unitAllResults');
  if (isNaN(v)) { if(resultEl) resultEl.textContent = '—'; return; }
  const u = UNITS[cat];
  if (!u) return;
  let result;
  if (u.convert) { result = u.convert(v, from, to); }
  else { const base = v * u.toBase[from]; result = base / u.toBase[to]; }
  const display = Math.abs(result) < 1e-10 ? '0' : (Math.abs(result) >= 1e12 || (Math.abs(result) < 1e-6 && result !== 0) ? result.toExponential(6) : parseFloat(result.toPrecision(8)));
  if (resultEl) resultEl.innerHTML = `<span style="font-size:1.1rem">${v} ${from} = <strong style="color:var(--accent)">${display} ${to}</strong></span><button class="copy-btn" onclick="copyText('${display}')">Copy</button>`;

  if (!allEl) return;
  let all = `<div style="margin-top:8px"><h4>All ${cat} conversions:</h4>`;
  if (u.convert) {
    u.units.forEach(ut => { const r=u.convert(v,from,ut); const d=parseFloat(r.toPrecision(6)); all+=`<div class="prefix-row"><span class="prefix-sym" style="width:90px;font-size:0.8rem">${ut}</span><span class="prefix-val">${d}</span><button class="copy-btn" style="position:relative;top:0;right:0;font-size:0.65rem" onclick="copyText('${d}')">⎘</button></div>`; });
  } else {
    const base = v * u.toBase[from];
    u.units.forEach(ut => { const r=base/u.toBase[ut]; const d=parseFloat(r.toPrecision(6)); all+=`<div class="prefix-row"><span class="prefix-sym" style="width:90px;font-size:0.8rem">${ut}</span><span class="prefix-val">${d}</span><button class="copy-btn" style="position:relative;top:0;right:0;font-size:0.65rem" onclick="copyText('${d}')">⎘</button></div>`; });
  }
  all += '</div>';
  allEl.innerHTML = all;
}

// ── SI Prefix Converter ───────────────────────────────────
const SI_PREFIXES = [
  { sym:'p', name:'pico',  val:1e-12 }, { sym:'n', name:'nano',  val:1e-9  },
  { sym:'µ', name:'micro', val:1e-6  }, { sym:'m', name:'milli', val:1e-3  },
  { sym:'',  name:'base',  val:1     }, { sym:'k', name:'kilo',  val:1e3   },
  { sym:'M', name:'mega',  val:1e6   }, { sym:'G', name:'giga',  val:1e9   },
  { sym:'T', name:'tera',  val:1e12  }
];
let siActiveMult = 1; // default: base unit

function initSIPrefixBtns() {
  const el = document.getElementById('siPrefixBtns');
  if (!el) return;
  el.innerHTML = SI_PREFIXES.map(p =>
    `<button class="btn${p.val===siActiveMult?' active':''}" onclick="siSetPrefix(${p.val})">${p.sym||'—'} <span style="color:var(--text2);font-size:0.72rem">${p.name}</span></button>`
  ).join('');
}

function siSetPrefix(mult) {
  siActiveMult = mult;
  // Update button highlights
  const btns = document.querySelectorAll('#siPrefixBtns .btn');
  btns.forEach((b, i) => b.classList.toggle('active', SI_PREFIXES[i].val === mult));
  calcSI();
}

function calcSI() {
  const v = parseFloat(document.getElementById('si_val')?.value);
  if (isNaN(v)) return;
  const base = v * siActiveMult;
  let html = '';
  SI_PREFIXES.forEach(p => {
    const res = base / p.val;
    const disp = Math.abs(res) < 1e-15 ? '0' : (Math.abs(res) >= 1e15 || Math.abs(res) < 1e-9 ? res.toExponential(4) : parseFloat(res.toPrecision(6)));
    html += `<div class="prefix-row"><span class="prefix-sym">${p.sym||'—'}</span><span class="prefix-name">${p.name}</span><span class="prefix-val">${disp}<button class="copy-btn" style="position:relative;top:0;right:0;margin-left:6px;font-size:0.65rem" onclick="copyText('${disp}')">⎘</button></span></div>`;
  });
  const r = document.getElementById('siResult');
  if (r) r.innerHTML = html;
}

// AWG reference (kept for cable tab, not shown in units tab anymore)
function renderAWGTable() {
  const tbl = document.getElementById('awgTable');
  if (!tbl) return;
  let html = `<table><thead><tr><th>AWG</th><th>CSA (mm²)</th><th>≈IEC equiv.</th><th>Notes</th></tr></thead><tbody>`;
  AWG_CSA.forEach(r => {
    html += `<tr><td><span class="tag tag-blue">AWG ${r.awg}</span></td><td style="font-family:var(--mono)">${r.csa} mm²</td><td>${r.note.includes('mm²') ? '<span class="tag tag-green">'+r.note.match(/[\d.]+mm²/)?.[0]+'</span>' : '—'}</td><td style="color:var(--text2)">${r.note}</td></tr>`;
  });
  html += '</tbody></table>';
  tbl.innerHTML = html;
  tbl.style.display = 'block';
}
