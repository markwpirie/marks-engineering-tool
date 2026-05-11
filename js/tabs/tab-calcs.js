// ══════════════════════════════════════════════════════════
// TAB — ENGINEERING CALCULATORS  v3.3
// ══════════════════════════════════════════════════════════

// ── Category / Calc registry ──────────────────────────────
const CALC_REGISTRY = {
  electrical: { label: '⚡ Electrical', calcs: ['amps','motor_fla','motor_table','motor_start','ohm','kw_kva_kvar','pfc','transformer','voltdrop','fuse','zs','ir','battery','dB','lux','three_phase'] },
  hvac:       { label: '🌡️ HVAC',       calcs: ['heat_load','ach','duct','chilled_water','pressure_conv'] },
  mechanical: { label: '⚙️ Mechanical', calcs: ['torque','pump','pipe_velocity','pipe_pressure','thermal_exp'] },
  offshore:   { label: '🌊 Offshore',   calcs: ['hydrostatic','boyles','vacuum','ventilation'] },
  general:    { label: '🔢 General',    calcs: ['pct_error','date_calc','vol_shapes','bmi'] }
};
const CALC_META = {
  amps:{label:'⚡ Amps Calculator',instant:true},ohm:{label:'⚡ Ohm\'s Law',instant:true},
  voltdrop:{label:'📉 Cable Volt Drop',instant:true},power_triangle:{label:'📐 kW/kVA/kVAR Triangle',instant:true},
  kw_kva_kvar:{label:'📐 kW/kVA/kVAR Triangle',instant:true},
  motor_fla:{label:'🔄 Motor FLA Estimator',instant:true},motor_table:{label:'📋 Motor Data Table',instant:true},motor_start:{label:'🚀 Motor Starting Current',instant:false},
  pfc:{label:'🔋 Power Factor Correction',instant:true},transformer:{label:'🔌 Transformer Sizing',instant:true},
  fuse:{label:'🛡️ Fuse / Breaker Sizing',instant:true},zs:{label:'🔁 Earth Fault Loop (Zs)',instant:false},
  ir:{label:'📊 Insulation Resistance',instant:false},battery:{label:'🔋 Battery / UPS Sizing',instant:false},
  dB:{label:'📣 dB Converter',instant:true},lux:{label:'💡 Lux / Lighting',instant:true},
  heat_load:{label:'🌡️ Heat Load',instant:false},ach:{label:'💨 Air Change Rate (ACH)',instant:true},
  duct:{label:'🟦 Duct Sizing',instant:true},chilled_water:{label:'❄️ Chilled Water Flow',instant:true},
  pressure_conv:{label:'🧭 Pressure Converter',instant:true},torque:{label:'⚙️ Torque / Shaft Power',instant:true},
  pump:{label:'🚿 Pump Power',instant:true},pipe_velocity:{label:'🌊 Pipe Flow Velocity',instant:true},
  pipe_pressure:{label:'📉 Pipe Pressure Drop',instant:false},thermal_exp:{label:'🌡️ Thermal Expansion',instant:true},
  hydrostatic:{label:'🌊 Hydrostatic Pressure',instant:true},boyles:{label:'💨 Boyle\'s Law',instant:true},
  vacuum:{label:'🔵 Vacuum Converter',instant:true},ventilation:{label:'💨 Ventilation Rate',instant:true},
  pct_error:{label:'% Error / Tolerance',instant:true},three_phase:{label:'🔺 3-Phase Power',instant:true},
  date_calc:{label:'📅 Day/Date Calculator',instant:true},vol_shapes:{label:'📦 Volume Calculator',instant:true},bmi:{label:'🧍 BMI Calculator',instant:true}
};
const CALC_DESC = {
  amps:'Solve for current (Amps) from kW, kVA or kVAR at any voltage. Supports DC, single-phase and three-phase. Three-phase assumes balanced load. Power factor required for kW→A conversion.',
  ohm:'Enter any two of Voltage, Current, Resistance, or Power — the other two are calculated. Based on Ohm\'s Law (V=IR). DC or single-phase AC.',
  voltdrop:'Calculates voltage drop using conductor resistivity. Flagged against IEC 60364: ≤3% lighting, ≤5% motors. Enter one-way cable length; formula accounts for return path.',
  power_triangle:'Solve the kW / kVA / kVAR relationship. Enter any two to find the third plus power factor angle. Essential for PFC and generator sizing.',
  motor_fla:'Estimates full-load current for a 3-phase motor. Select 50 Hz (IEC standard kW ratings), 60 Hz (NEMA HP ratings), or 50 Hz motor running on 60 Hz supply. The 60 Hz mode applies a correction factor (default 1.15×) — running a 50 Hz motor at 60 Hz increases speed by ~20% and raises FLA. Always verify on nameplate and check manufacturer approval before doing so.',
  motor_table:'Generated reference table of IEC standard motor ratings at the selected voltage, frequency, and efficiency class. Shows FLC, starting current by method, fuse size, indicative cable CSA, and synchronous speed by pole count (toggle). Values derived from IEC 60034-30-1 typical data — always verify against motor nameplate.',
  motor_start:'Estimates inrush current for different starting methods: DOL (6–8× FLA), Star-Delta (~33% of DOL), Soft Starter (~3× FLA), VFD (~1.5× FLA), Autotransformer (custom tap).',
  pfc:'Calculates kVAR of capacitor bank required to correct power factor. Utilities typically require PF ≥ 0.95. Result is reactive power to add, not physical capacitor size.',
  transformer:'Sizes a transformer in kVA from connected load, applying demand factor and safety margin. Rule of thumb: size to 80% capacity for headroom.',
  fuse:'Suggests fuse or breaker rating from full-load current per IEC 60947 / BS 88. Note: fuse must also protect the selected cable CSA.',
  zs:'Checks earth fault loop impedance Zs against IEC 60364 / BS 7671 limits for disconnection time. Enter Ze (supply impedance) plus cable resistances.',
  ir:'Calculates Polarisation Index (PI = R10min ÷ R1min) and DAR (R60s ÷ R30s). PI ≥ 2.0 good, ≥ 4.0 excellent. DAR ≥ 1.25 acceptable.',
  battery:'Sizes a battery bank (Ah) for UPS / DC systems from load and required backup time. Applies Peukert correction and end-of-discharge. Add 20% design margin.',
  dB:'Converts between dB and power/voltage ratios. Power: dB = 10×log(P2/P1). Voltage: dB = 20×log(V2/V1). Common references: 0dBm = 1mW into 50Ω.',
  lux:'Estimates average illuminance using the Lumen Method. Offshore typical targets: workshops 300 lux, walkways 50 lux, control rooms 500 lux. UF assumed 0.65.',
  heat_load:'Calculates HVAC load from fabric losses, occupancy, lighting, and equipment. Result in kW and BTU/hr. Simplified — use CIBSE/ASHRAE for detailed design.',
  ach:'Calculates air changes per hour or required airflow. Offshore rules of thumb: accommodation 6–8 ACH, battery rooms 12 ACH minimum, hazardous area purge up to 60 ACH.',
  duct:'Calculates duct size from airflow and target velocity, or vice versa. Typical supply velocity: 5–8 m/s. Higher velocity = more noise and pressure drop.',
  chilled_water:'Calculates chilled water flow rate from cooling load. Q = ṁ × Cp × ΔT. Typical ΔT = 6°C (supply 6°C, return 12°C). Cp water = 4.187 kJ/kg·K.',
  pressure_conv:'Converts between bar, psi, Pa, kPa, MPa, mmHg (Torr), atm, and inH₂O. Useful for HVAC, hydraulics, and process instrumentation.',
  torque:'T = P × 9550 / RPM (kW and N·m). Shaft power from torque and RPM, or torque from power and speed. Essential for motor/gearbox/coupling selection.',
  pump:'Calculates hydraulic and shaft power from flow, head, density, and efficiency. P_hydraulic = ρ × g × Q × H. Shaft power = hydraulic ÷ pump efficiency.',
  pipe_velocity:'V = Q / A. Typical limits: water 1–3 m/s, seawater 1–2 m/s, compressed air 10–20 m/s. Exceeding limits causes erosion and noise.',
  pipe_pressure:'Pressure drop via Darcy-Weisbach equation. f ≈ 0.02 for turbulent flow in steel pipe. Add 10–20% for fittings and bends.',
  thermal_exp:'ΔL = α × L × ΔT. Key coefficients: steel 12 μm/m·°C, copper 17, HDPE 150, XLPE 200. Critical for offshore piping expansion loop design.',
  hydrostatic:'P = ρ × g × h. Seawater ≈ 1 bar per 10m depth. Density 1025 kg/m³. Essential for subsea equipment pressure ratings.',
  boyles:'P₁V₁ = P₂V₂ at constant temperature. Useful for compressed air bottle sizing, pneumatic system design, and gas volume calculations.',
  vacuum:'Converts mbar, Torr, % vacuum, Pa, and inHg. Includes vacuum quality guide: rough / medium / high / ultra-high. 1 atm = 1013.25 mbar = 760 Torr.',
  ventilation:'Q(m³/hr) = Volume × ACH. Also outputs m³/s and CFM. Offshore minimum: 0.5 m³/s per kW heat load in electrical rooms.',
  pct_error:'% Error = |Measured − Actual| / Actual × 100. Checks against a tolerance band. Useful for instrument calibration and sensor verification.',
  three_phase:'P = √3 × VL × IL × cosφ. Assumes balanced load — for unbalanced systems calculate each phase separately.',
  date_calc:'Calculate difference between two dates, or add/subtract days/weeks/months. Includes inclusive day count and Saturday/Sunday tally. Useful for rotation planning, lieu days, cert expiry, and project milestones.',
  vol_shapes:'Calculate volume of common geometric shapes: cube/cuboid, cylinder, cone, sphere, rectangular prism. Enter dimensions in mm, cm, or m.',
  bmi:'Body Mass Index calculator. BMI = weight(kg) / height(m)². WHO classification: <18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, ≥30 obese.',
  kw_kva_kvar:'Solve the kW / kVA / kVAR relationship. Enter any two to find the third plus power factor angle. Essential for PFC and generator sizing.'
};

// ── State ─────────────────────────────────────────────────
let activeCategory = 'electrical';
let activeCalc     = 'amps';

// ── Init ──────────────────────────────────────────────────
function initCalcs() {
  renderCalcNav();
  renderCalcList();
  renderCalcPanel();
}

// ── Navigation ────────────────────────────────────────────
function renderCalcNav() {
  const nav = document.getElementById('calcCatNav');
  if (!nav) return;
  nav.innerHTML = Object.entries(CALC_REGISTRY).map(([key, cat]) =>
    `<button class="btn ${key===activeCategory?'active':''}" onclick="selectCalcCat('${key}')">${cat.label}</button>`
  ).join('');
}

function renderCalcList() {
  const list = document.getElementById('calcList');
  if (!list) return;
  list.innerHTML = CALC_REGISTRY[activeCategory].calcs.map(id =>
    `<div class="calc-list-item ${id===activeCalc?'active':''}" onclick="selectCalc('${id}')">${CALC_META[id].label}</div>`
  ).join('');
}

function renderCalcPanel() {
  const desc = document.getElementById('calcDesc');
  const panel = document.getElementById('calcPanel');
  if (!desc || !panel) return;
  desc.textContent = CALC_DESC[activeCalc] || '';
  if (activeCalc === 'motor_fla') { flaHz = 50; flaIE = 'IE3'; }
  panel.innerHTML = buildCalcHTML(activeCalc);
  restoreCalcState(activeCalc);
  runInstantCalc(activeCalc);
}

function runInstantCalc(id) {
  const map = {
    amps:calcAmps, ohm:calcOhm, voltdrop:calcVD, power_triangle:calcPowerTriangle,
    motor_fla:flaApplyLookup, motor_table:renderMotorTable, pfc:calcPFC, transformer:calcTransformer, fuse:calcFuse,
    dB:calcDB, lux:calcLux, ach:calcACH, duct:calcDuct, chilled_water:calcChilledWater,
    pressure_conv:calcPressureConv, torque:calcTorque, pump:calcPump,
    pipe_velocity:calcPipeVelocity, thermal_exp:calcThermalExp, hydrostatic:calcHydrostatic,
    boyles:calcBoyles, vacuum:calcVacuum, ventilation:calcVentilation,
    pct_error:calcPctError, three_phase:calcThreePhase, date_calc:initCalendar,
    vol_shapes:calcVolShapes, bmi:calcBMI, kw_kva_kvar:calcPowerTriangle
  };
  if (map[id]) map[id]();
}

function selectCalcCat(key) {
  saveCalcState();
  activeCategory = key;
  activeCalc = CALC_REGISTRY[key].calcs[0];
  renderCalcNav(); renderCalcList(); renderCalcPanel();
}

function selectCalc(id) {
  saveCalcState();
  activeCalc = id;
  renderCalcList(); renderCalcPanel();
}

// ── Per-calc state memory ─────────────────────────────────
const CALC_STATE_KEY = 'met_calc_state';

function saveCalcState() {
  const panel = document.getElementById('calcPanel');
  if (!panel || !activeCalc) return;
  const state = JSON.parse(localStorage.getItem(CALC_STATE_KEY) || '{}');
  const inputs = {};
  panel.querySelectorAll('input,select').forEach(el => {
    if (el.id) inputs[el.id] = el.type==='checkbox' ? el.checked : el.value;
  });
  state[activeCalc] = inputs;
  localStorage.setItem(CALC_STATE_KEY, JSON.stringify(state));
}

function restoreCalcState(id) {
  const state = JSON.parse(localStorage.getItem(CALC_STATE_KEY) || '{}');
  if (!state[id]) return;
  const inputs = state[id];
  Object.entries(inputs).forEach(([eid, val]) => {
    const el = document.getElementById(eid);
    if (!el) return;
    if (el.type==='checkbox') el.checked = val;
    else el.value = val;
    // Trigger display of manual fields
    if (el.tagName==='SELECT' && el.onchange) try{ el.onchange(); }catch(e){}
  });
}

function clearAllCalcState() {
  localStorage.removeItem(CALC_STATE_KEY);
}

// ── Helpers ───────────────────────────────────────────────
const fmt = (x, dp=4) => isNaN(x)||!isFinite(x) ? '—' : parseFloat(x.toPrecision(dp)).toString();
const fmtN = (x, dp=2) => isNaN(x)||!isFinite(x) ? '—' : x.toFixed(dp);

function resultGrid(items) {
  return `<div class="calc-result-grid">${items.map(([k,v,unit='',color=''])=>
    `<div class="npt-info-item"><div class="key">${k}</div><div class="val"${color?` style="color:${color}"`:''}>${v}${unit?` <span style="font-size:0.8em;opacity:0.7">${unit}</span>`:''}</div></div>`
  ).join('')}</div>`;
}

function formulaNote(f) {
  return `<div class="calc-formula">📐 ${f}</div>`;
}

function warnBand(val, lo, hi) {
  return val > hi ? 'var(--danger)' : val > lo ? 'var(--warn)' : 'var(--success)';
}

const VOLT_OPTS = [['110','110 V'],['230','230 V'],['400','400 V'],['415','415 V'],['440','440 V'],
  ['460','460 V'],['480','480 V'],['600','600 V'],['690','690 V'],['3300','3.3 kV'],['6600','6.6 kV'],['11000','11 kV'],['0','Manual…']];

function voltSelect(id, onchange, selected=400) {
  const opts = VOLT_OPTS.map(([v,l])=>`<option value="${v}"${parseInt(v)===selected?' selected':''}>${l}</option>`).join('');
  return `<select id="${id}" onchange="showManualVolt('${id}');${onchange}">${opts}</select>
  <input type="number" id="${id}_manual" placeholder="Manual (V)" style="margin-top:6px;display:none" oninput="${onchange}">`;
}

function getVolt(id) {
  const sel = document.getElementById(id);
  if (!sel) return NaN;
  const v = parseFloat(sel.value);
  return v === 0 ? parseFloat(document.getElementById(id+'_manual')?.value||'NaN') : v;
}

function showManualVolt(id) {
  const sel = document.getElementById(id);
  const man = document.getElementById(id+'_manual');
  if (sel && man) man.style.display = parseFloat(sel.value)===0 ? 'block' : 'none';
}

// ── HTML builders ─────────────────────────────────────────
function buildCalcHTML(id) {
  const map = {
    amps:htmlAmps, ohm:htmlOhm, voltdrop:htmlVoltDrop, power_triangle:htmlPowerTriangle,
    motor_fla:htmlMotorFLA, motor_table:htmlMotorTable, motor_start:htmlMotorStart, pfc:htmlPFC, transformer:htmlTransformer,
    fuse:htmlFuse, zs:htmlZs, ir:htmlIR, battery:htmlBattery, dB:htmlDB, lux:htmlLux,
    heat_load:htmlHeatLoad, ach:htmlACH, duct:htmlDuct, chilled_water:htmlChilledWater,
    pressure_conv:htmlPressureConv, torque:htmlTorque, pump:htmlPump,
    pipe_velocity:htmlPipeVelocity, pipe_pressure:htmlPipePressure, thermal_exp:htmlThermalExp,
    hydrostatic:htmlHydrostatic, boyles:htmlBoyles, vacuum:htmlVacuum, ventilation:htmlVentilation,
    pct_error:htmlPctError, three_phase:htmlThreePhase, date_calc:htmlDateCalc,
    vol_shapes:htmlVolShapes, bmi:htmlBMI, kw_kva_kvar:htmlPowerTriangle
  };
  return map[id] ? map[id]() : '<p>Calculator not found.</p>';
}

// ══════════════════════════════════════════════════════════
// ELECTRICAL
// ══════════════════════════════════════════════════════════

function htmlAmps() {
  return `<div class="field"><label>Input Type</label>
    <select id="amps_mode" onchange="calcAmps()">
      <option value="kw_1ph">kW — Single Phase</option><option value="kw_3ph">kW — Three Phase</option>
      <option value="kva_1ph">kVA — Single Phase</option><option value="kva_3ph">kVA — Three Phase</option>
      <option value="kvar_1ph">kVAR — Single Phase</option><option value="kvar_3ph">kVAR — Three Phase</option>
      <option value="kw_dc">kW — DC</option>
    </select></div>
  <div class="field"><label>Voltage</label>${voltSelect('amps_volt','calcAmps()',400)}</div>
  <div class="field" id="amps_pf_row"><label>Power Factor</label>
    <input type="number" id="amps_pf" value="0.85" min="0.01" max="1" step="0.01" oninput="calcAmps()"></div>
  <div class="field"><label>Power (kW / kVA / kVAR)</label>
    <input type="number" id="amps_pwr" value="10" oninput="calcAmps()"></div>
  <div id="ampsResult"></div>
  ${formulaNote('I = P×1000/(V×PF) [1φ] | I = P×1000/(√3×V×PF) [3φ] | I = S×1000/V [1φ kVA] | I = S×1000/(√3×V) [3φ kVA]')}`;
}

function calcAmps() {
  const mode=document.getElementById('amps_mode')?.value;
  const volt=getVolt('amps_volt');
  const pwr=parseFloat(document.getElementById('amps_pwr')?.value);
  const pf=parseFloat(document.getElementById('amps_pf')?.value||1);
  const pfRow=document.getElementById('amps_pf_row');
  const needsPF=mode&&mode.startsWith('kw');
  if(pfRow) pfRow.style.display=needsPF?'block':'none';
  const r=document.getElementById('ampsResult'); if(!r) return;
  if(isNaN(volt)||volt<=0||isNaN(pwr)||pwr<=0){r.innerHTML='<span style="color:var(--text2)">Enter voltage and power</span>';return;}
  const pw=pwr*1000;
  let amps,kva,kw,kvar,label;
  if(mode==='kw_dc'){amps=pw/volt;kw=pwr;label='DC';}
  else if(mode==='kw_1ph'){amps=pw/(volt*pf);kw=pwr;kva=kw/pf;kvar=Math.sqrt(Math.max(0,kva**2-kw**2));label='Single Phase';}
  else if(mode==='kw_3ph'){amps=pw/(Math.sqrt(3)*volt*pf);kw=pwr;kva=kw/pf;kvar=Math.sqrt(Math.max(0,kva**2-kw**2));label='Three Phase';}
  else if(mode==='kva_1ph'){amps=pw/volt;kva=pwr;kw=kva*pf;kvar=Math.sqrt(Math.max(0,kva**2-kw**2));label='Single Phase';}
  else if(mode==='kva_3ph'){amps=pw/(Math.sqrt(3)*volt);kva=pwr;kw=kva*pf;kvar=Math.sqrt(Math.max(0,kva**2-kw**2));label='Three Phase';}
  else if(mode==='kvar_1ph'){kvar=pwr;kva=kvar/Math.sqrt(Math.max(0.0001,1-pf**2));kw=kva*pf;amps=kva*1000/volt;label='Single Phase';}
  else{kvar=pwr;kva=kvar/Math.sqrt(Math.max(0.0001,1-pf**2));kw=kva*pf;amps=kva*1000/(Math.sqrt(3)*volt);label='Three Phase';}
  const rows=[['Current',fmtN(amps,2),'A','var(--accent)'],['Voltage',volt<1000?volt+'V':(volt/1000)+'kV',''],['System',label,'']];
  if(kw!==undefined) rows.push(['Active Power',fmtN(kw,3),'kW']);
  if(kva!==undefined) rows.push(['Apparent Power',fmtN(kva,3),'kVA']);
  if(kvar!==undefined&&kvar>0.001) rows.push(['Reactive Power',fmtN(kvar,3),'kVAR']);
  if(needsPF) rows.push(['Power Factor',pf,'']);
  r.innerHTML=resultGrid(rows);
}

function htmlOhm() {
  return `<label style="display:block;margin-bottom:10px;color:var(--text2)">Enter any 2 values — leave others blank</label>
  <div class="field"><label>Voltage V (volts)</label><input type="number" id="ohm_V" placeholder="" oninput="calcOhm()"></div>
  <div class="field"><label>Current I (amps)</label><input type="number" id="ohm_I" placeholder="" oninput="calcOhm()"></div>
  <div class="field"><label>Resistance R (ohms)</label><input type="number" id="ohm_R" placeholder="" oninput="calcOhm()"></div>
  <div class="field"><label>Power P (watts)</label><input type="number" id="ohm_P" placeholder="" oninput="calcOhm()"></div>
  <div id="ohmResult"></div>
  ${formulaNote('V = IR | P = VI = I²R = V²/R')}`;
}

function calcOhm() {
  const V=parseFloat(document.getElementById('ohm_V')?.value),I=parseFloat(document.getElementById('ohm_I')?.value);
  const R=parseFloat(document.getElementById('ohm_R')?.value),P=parseFloat(document.getElementById('ohm_P')?.value);
  const r=document.getElementById('ohmResult'); if(!r) return;
  if([!isNaN(V),!isNaN(I),!isNaN(R),!isNaN(P)].filter(Boolean).length<2){r.innerHTML='<span style="color:var(--text2)">Enter any 2 values</span>';return;}
  let res={};
  if(!isNaN(V)&&!isNaN(I)) res={V,I,R:V/I,P:V*I};
  else if(!isNaN(V)&&!isNaN(R)) res={V,R,I:V/R,P:V*V/R};
  else if(!isNaN(V)&&!isNaN(P)) res={V,P,I:P/V,R:V*V/P};
  else if(!isNaN(I)&&!isNaN(R)) res={I,R,V:I*R,P:I*I*R};
  else if(!isNaN(I)&&!isNaN(P)) res={I,P,V:P/I,R:P/(I*I)};
  else res={R,P,V:Math.sqrt(P*R),I:Math.sqrt(P/R)};
  r.innerHTML=resultGrid([['Voltage',fmt(res.V),'V'],['Current',fmt(res.I),'A'],['Resistance',fmt(res.R),'Ω'],['Power',fmt(res.P),'W']]);
}

const RESISTIVITY={
  1.5:{cu:12.13,al:19.87},2.5:{cu:7.41,al:12.10},4:{cu:4.61,al:7.54},6:{cu:3.08,al:5.02},
  10:{cu:1.83,al:2.99},16:{cu:1.15,al:1.87},25:{cu:0.727,al:1.20},35:{cu:0.524,al:0.868},
  50:{cu:0.387,al:0.641},70:{cu:0.268,al:0.443},95:{cu:0.193,al:0.320},120:{cu:0.153,al:0.253},
  150:{cu:0.124,al:0.206},185:{cu:0.0991,al:0.164},240:{cu:0.0754,al:0.125},300:{cu:0.0601,al:0.100}
};

function htmlVoltDrop() {
  return `<div class="field"><label>Phase</label>
    <div class="flex-wrap">
      <button class="btn active" id="vd-1ph" onclick="setVDPhase(1)">Single Phase</button>
      <button class="btn" id="vd-3ph" onclick="setVDPhase(3)">Three Phase</button>
    </div></div>
  <div class="field"><label>Voltage Level</label>
    <select id="vd_volt" onchange="calcVD()">
      <option value="110">110V</option><option value="230">230V</option><option value="400" selected>400V</option>
      <option value="415">415V</option><option value="440">440V</option><option value="460">460V</option>
      <option value="480">480V</option><option value="600">600V</option><option value="690">690V</option>
      <option value="6600">6.6kV</option><option value="11000">11kV</option>
    </select></div>
  <div class="field"><label>Conductor CSA (mm²)</label>
    <select id="vd_csa" onchange="calcVD()">
      <option>1.5</option><option>2.5</option><option>4</option><option>6</option><option>10</option>
      <option>16</option><option selected>25</option><option>35</option><option>50</option><option>70</option>
      <option>95</option><option>120</option><option>150</option><option>185</option><option>240</option><option>300</option>
    </select></div>
  <div class="field"><label>Conductor Material</label>
    <select id="vd_material" onchange="calcVD()"><option value="cu">Copper</option><option value="al">Aluminium</option></select></div>
  <div class="field"><label>Current (A)</label><input type="number" id="vd_current" value="20" oninput="calcVD()"></div>
  <div class="field"><label>One-way cable length (m)</label><input type="number" id="vd_length" value="50" oninput="calcVD()"></div>
  <div id="vdResult"></div>
  ${formulaNote('VD = Factor × ρ × I × L | Factor: 2 (1-phase), √3 (3-phase)')}`;
}

let vdPhase=1;
function setVDPhase(p){vdPhase=p;document.getElementById('vd-1ph')?.classList.toggle('active',p===1);document.getElementById('vd-3ph')?.classList.toggle('active',p===3);calcVD();}
function calcVD(){
  const vnom=parseFloat(document.getElementById('vd_volt')?.value);
  const csa=parseFloat(document.getElementById('vd_csa')?.value);
  const I=parseFloat(document.getElementById('vd_current')?.value);
  const L=parseFloat(document.getElementById('vd_length')?.value);
  const r=document.getElementById('vdResult'); if(!r) return;
  if([vnom,csa,I,L].some(isNaN)){r.innerHTML='';return;}
  const mat=document.getElementById('vd_material')?.value||'cu';
  const rho=RESISTIVITY[csa]?RESISTIVITY[csa][mat]:17.241/csa;
  const factor=vdPhase===3?Math.sqrt(3):2;
  const vdrop=factor*rho*I*L/1000;
  const pct=vdrop/vnom*100;
  r.innerHTML=resultGrid([['Voltage Drop',fmtN(vdrop,2),'V','var(--accent)'],['% of Nominal',fmtN(pct,2)+'%','',warnBand(pct,3,5)],['Receiving End',fmtN(vnom-vdrop,1),'V']])+
    `<div style="margin-top:8px;font-size:0.78rem;color:var(--text2)">IEC 60364: ≤3% lighting, ≤5% motors</div>`;
}

function htmlPowerTriangle(){
  return `<label style="display:block;margin-bottom:10px;color:var(--text2)">Enter any 2 values</label>
  <div class="field"><label>Active Power (kW)</label><input type="number" id="pt_kw" placeholder="" oninput="calcPowerTriangle()"></div>
  <div class="field"><label>Apparent Power (kVA)</label><input type="number" id="pt_kva" placeholder="" oninput="calcPowerTriangle()"></div>
  <div class="field"><label>Reactive Power (kVAR)</label><input type="number" id="pt_kvar" placeholder="" oninput="calcPowerTriangle()"></div>
  <div id="ptResult"></div>
  ${formulaNote('kVA² = kW² + kVAR² | PF = kW/kVA | φ = arccos(PF)')}`;
}

function calcPowerTriangle(){
  const kw=parseFloat(document.getElementById('pt_kw')?.value);
  const kva=parseFloat(document.getElementById('pt_kva')?.value);
  const kvar=parseFloat(document.getElementById('pt_kvar')?.value);
  const r=document.getElementById('ptResult'); if(!r) return;
  let rKW,rKVA,rKVAR,pf;
  if(!isNaN(kw)&&!isNaN(kva)){rKW=kw;rKVA=kva;rKVAR=Math.sqrt(Math.max(0,kva**2-kw**2));pf=kw/kva;}
  else if(!isNaN(kw)&&!isNaN(kvar)){rKW=kw;rKVAR=kvar;rKVA=Math.sqrt(kw**2+kvar**2);pf=kw/rKVA;}
  else if(!isNaN(kva)&&!isNaN(kvar)){rKVA=kva;rKVAR=kvar;rKW=Math.sqrt(Math.max(0,kva**2-kvar**2));pf=rKW/kva;}
  else{r.innerHTML='<span style="color:var(--text2)">Enter any 2 values</span>';return;}
  const angle=Math.acos(Math.min(1,pf))*180/Math.PI;
  r.innerHTML=resultGrid([['kW (Active)',fmtN(rKW,3),'kW'],['kVA (Apparent)',fmtN(rKVA,3),'kVA'],['kVAR (Reactive)',fmtN(rKVAR,3),'kVAR'],['Power Factor',fmtN(pf,4),''],['Angle φ',fmtN(angle,2),'°']]);
}

// IEC standard 50Hz motor kW ratings
const IEC_KW = [0.09,0.12,0.18,0.25,0.37,0.55,0.75,1.1,1.5,2.2,3,4,5.5,7.5,11,15,18.5,22,30,37,45,55,75,90,110,132,160,200,250,315,355,400,450,500,560,630,710,800,900,1000];
// NEMA standard 60Hz HP ratings
const NEMA_HP = [0.5,0.75,1,1.5,2,3,5,7.5,10,15,20,25,30,40,50,60,75,100,125,150,200,250,300,350,400,450,500];

// Typical IE class PF and efficiency by kW — [IE2_eff, IE3_eff, IE4_eff, pf]
// PF is broadly class-independent (geometry/poles dominate), so one PF column.
// Source: IEC 60034-30-1, typical published values for 4-pole motors at full load.
const IEC_MOTOR_DATA = {
  0.09:  [0.68, 0.72, 0.75, 0.66],
  0.12:  [0.70, 0.74, 0.77, 0.68],
  0.18:  [0.73, 0.77, 0.79, 0.70],
  0.25:  [0.75, 0.79, 0.81, 0.72],
  0.37:  [0.77, 0.80, 0.82, 0.74],
  0.55:  [0.79, 0.82, 0.84, 0.76],
  0.75:  [0.81, 0.83, 0.85, 0.78],
  1.1:   [0.83, 0.85, 0.87, 0.80],
  1.5:   [0.84, 0.86, 0.88, 0.81],
  2.2:   [0.85, 0.87, 0.89, 0.82],
  3:     [0.86, 0.88, 0.90, 0.83],
  4:     [0.87, 0.89, 0.91, 0.84],
  5.5:   [0.88, 0.90, 0.91, 0.85],
  7.5:   [0.89, 0.91, 0.92, 0.86],
  11:    [0.90, 0.92, 0.93, 0.86],
  15:    [0.91, 0.92, 0.93, 0.87],
  18.5:  [0.91, 0.93, 0.94, 0.87],
  22:    [0.92, 0.93, 0.94, 0.88],
  30:    [0.92, 0.94, 0.95, 0.88],
  37:    [0.93, 0.94, 0.95, 0.88],
  45:    [0.93, 0.95, 0.95, 0.89],
  55:    [0.93, 0.95, 0.96, 0.89],
  75:    [0.94, 0.95, 0.96, 0.89],
  90:    [0.94, 0.96, 0.96, 0.90],
  110:   [0.94, 0.96, 0.96, 0.90],
  132:   [0.95, 0.96, 0.97, 0.90],
  160:   [0.95, 0.96, 0.97, 0.91],
  200:   [0.95, 0.96, 0.97, 0.91],
  250:   [0.95, 0.96, 0.97, 0.91],
  315:   [0.95, 0.97, 0.97, 0.91],
  355:   [0.95, 0.97, 0.97, 0.91],
  400:   [0.95, 0.97, 0.97, 0.92],
  450:   [0.96, 0.97, 0.97, 0.92],
  500:   [0.96, 0.97, 0.97, 0.92],
};

// Find nearest kW entry in lookup (for manual entries)
function flaLookup(kw, ieClass) {
  const keys = Object.keys(IEC_MOTOR_DATA).map(Number).sort((a,b)=>a-b);
  let nearest = keys[0];
  let minDiff = Infinity;
  for (const k of keys) { const d=Math.abs(k-kw); if(d<minDiff){minDiff=d;nearest=k;} }
  const row = IEC_MOTOR_DATA[nearest];
  if (!row) return {eff:0.92, pf:0.85};
  const effIdx = ieClass==='IE2'?0 : ieClass==='IE4'?2 : 1; // default IE3
  return { eff: row[effIdx], pf: row[3] };
}

function htmlMotorFLA(){
  const iecOpts  = IEC_KW.map(k=>`<option value="${k}"${k===22?' selected':''}>${k} kW</option>`).join('');
  const nemaOpts = NEMA_HP.map(h=>`<option value="${h}">${h} HP</option>`).join('');
  return `
  <div class="field"><label>Supply Frequency</label>
    <div class="flex-wrap">
      <button class="btn active" id="fla_hz50" onclick="flaSetHz(50)">50 Hz (IEC)</button>
      <button class="btn" id="fla_hz60" onclick="flaSetHz(60)">60 Hz (NEMA)</button>
      <button class="btn" id="fla_hz5060" onclick="flaSetHz('5060')">50 Hz motor on 60 Hz supply</button>
    </div>
  </div>

  <div class="field" id="fla_iec_row"><label>Motor Power — IEC standard rating</label>
    <select id="fla_kw_iec" onchange="flaPickIEC()">${iecOpts}<option value="0">Manual…</option></select>
    <input type="number" id="fla_kw_iec_manual" placeholder="Manual kW" style="margin-top:6px;display:none" oninput="flaPickIEC()">
  </div>

  <div class="field" id="fla_nema_row" style="display:none"><label>Motor Power — NEMA standard rating</label>
    <select id="fla_hp_nema" onchange="calcMotorFLA()">${nemaOpts}<option value="0">Manual…</option></select>
    <input type="number" id="fla_hp_nema_manual" placeholder="Manual HP" style="margin-top:6px;display:none" oninput="calcMotorFLA()">
  </div>

  <div class="field" id="fla_ie_row"><label>Efficiency Class</label>
    <div class="flex-wrap">
      <button class="btn" id="fla_ie2" onclick="flaSetIE('IE2')">IE2</button>
      <button class="btn active" id="fla_ie3" onclick="flaSetIE('IE3')">IE3</button>
      <button class="btn" id="fla_ie4" onclick="flaSetIE('IE4')">IE4</button>
    </div>
    <div style="margin-top:5px;font-size:0.76rem;color:var(--text2)">PF and η auto-filled from IEC 60034-30-1 typical values. Override below if nameplate data available.</div>
  </div>

  <div class="field"><label>Voltage (Line-to-Line)</label>${voltSelect('fla_volt','calcMotorFLA()',400)}
    <div id="fla_volt_hint" style="display:none;margin-top:6px;font-size:0.78rem;color:var(--accent2)">💡 Typical 50 Hz: 380 V, 400 V, 415 V, 440 V</div>
  </div>

  <div class="field"><label>Power Factor <span id="fla_pf_src" style="font-size:0.75rem;color:var(--accent2);font-weight:400"></span></label>
    <input type="number" id="fla_pf" value="0.88" step="0.01" min="0.5" max="1" oninput="calcMotorFLA()">
  </div>
  <div class="field"><label>Efficiency η <span id="fla_eff_src" style="font-size:0.75rem;color:var(--accent2);font-weight:400"></span></label>
    <input type="number" id="fla_eff" value="0.93" step="0.01" min="0.5" max="1" oninput="calcMotorFLA()">
  </div>

  <div class="field" id="fla_60hz_factor_row" style="display:none">
    <label>60 Hz FLA correction factor <span style="color:var(--text2);font-weight:400">(applied to nameplate FLA)</span></label>
    <input type="number" id="fla_60hz_factor" value="1.15" step="0.01" min="1" max="2" oninput="calcMotorFLA()">
    <div style="margin-top:6px;padding:8px 10px;background:var(--warn-bg,#3a2e00);border-left:3px solid var(--warn);border-radius:4px;font-size:0.77rem;color:var(--warn);line-height:1.6">
      ⚠️ Running a 50 Hz motor on 60 Hz increases synchronous speed by 20%. Check manufacturer approval, bearing speed limits, and cooling fan performance before energising. Factor 1.15 is a conservative estimate — always verify on nameplate or with manufacturer.
    </div>
  </div>

  <div id="flaResult"></div>
  ${formulaNote('I = P×1000 / (√3 × V × PF × η) | 3-phase. Always verify on nameplate.')}`;
}

let flaHz = 50;
let flaIE = 'IE3';

function flaSetIE(ie) {
  flaIE = ie;
  // IDs in HTML are fla_ie2, fla_ie3, fla_ie4 (not fla_ieie2 etc.)
  ['IE2','IE3','IE4'].forEach(c => {
    const el = document.getElementById('fla_ie' + c.slice(2)); // 'IE2' => '2'
    if (el) el.classList.toggle('active', c===ie);
  });
  flaApplyLookup();
}

function flaSetHz(hz) {
  flaHz = hz;
  document.getElementById('fla_hz50')?.classList.toggle('active', hz===50);
  document.getElementById('fla_hz60')?.classList.toggle('active', hz===60);
  document.getElementById('fla_hz5060')?.classList.toggle('active', hz==='5060');
  const iecRow  = document.getElementById('fla_iec_row');
  const nemaRow = document.getElementById('fla_nema_row');
  const ieRow   = document.getElementById('fla_ie_row');
  const factRow = document.getElementById('fla_60hz_factor_row');
  if(iecRow)  iecRow.style.display  = (hz===60) ? 'none' : 'block';
  if(nemaRow) nemaRow.style.display = (hz===60) ? 'block' : 'none';
  if(ieRow)   ieRow.style.display   = (hz===60) ? 'none' : 'block'; // IE class only relevant for IEC
  if(factRow) factRow.style.display = (hz==='5060') ? 'block' : 'none';

  // Auto-switch voltage and show hint
  const voltSel = document.getElementById('fla_volt');
  const hintEl  = document.getElementById('fla_volt_hint');
  if (hz === 50) {
    if (voltSel && ['460','480'].includes(voltSel.value)) voltSel.value = '400';
    if (hintEl) { hintEl.textContent = '💡 Typical 50 Hz: 380 V, 400 V, 415 V, 440 V'; hintEl.style.display = 'block'; }
  } else if (hz === 60) {
    if (voltSel && ['400','415'].includes(voltSel.value)) voltSel.value = '460';
    if (hintEl) { hintEl.textContent = '💡 Typical 60 Hz: 440 V, 460 V, 480 V'; hintEl.style.display = 'block'; }
  } else {
    if (voltSel && ['400','415'].includes(voltSel.value)) voltSel.value = '460';
    if (hintEl) { hintEl.textContent = '💡 Enter the 60 Hz supply voltage — typical 440 V, 460 V, 480 V'; hintEl.style.display = 'block'; }
  }
  flaApplyLookup();
}

function flaPickIEC() {
  const sel = document.getElementById('fla_kw_iec');
  const man = document.getElementById('fla_kw_iec_manual');
  if(sel && man) man.style.display = parseFloat(sel.value)===0 ? 'block' : 'none';
  flaApplyLookup();
}

function flaPickNEMA() {
  const sel = document.getElementById('fla_hp_nema');
  const man = document.getElementById('fla_hp_nema_manual');
  if(sel && man) man.style.display = parseFloat(sel.value)===0 ? 'block' : 'none';
  calcMotorFLA();
}

// Auto-fill PF and η from IEC lookup, then recalc
function flaApplyLookup() {
  if (flaHz === 60) { calcMotorFLA(); return; } // No IEC lookup for NEMA
  const kwSel = parseFloat(document.getElementById('fla_kw_iec')?.value);
  const kwMan = parseFloat(document.getElementById('fla_kw_iec_manual')?.value);
  const kw = kwSel === 0 ? kwMan : kwSel;
  if (isNaN(kw) || kw <= 0) { calcMotorFLA(); return; }

  const { eff, pf } = flaLookup(kw, flaIE);
  const pfEl  = document.getElementById('fla_pf');
  const effEl = document.getElementById('fla_eff');
  const pfSrc = document.getElementById('fla_pf_src');
  const effSrc= document.getElementById('fla_eff_src');

  if (pfEl)  pfEl.value  = pf.toFixed(2);
  if (effEl) effEl.value = eff.toFixed(2);

  const src = `— ${flaIE} typical (IEC 60034-30-1)`;
  if (pfSrc)  pfSrc.textContent  = src;
  if (effSrc) effSrc.textContent = src;

  calcMotorFLA();
}

function calcMotorFLA(){
  const volt = getVolt('fla_volt');
  const pf   = parseFloat(document.getElementById('fla_pf')?.value||0.85);
  const eff  = parseFloat(document.getElementById('fla_eff')?.value||0.92);
  const r    = document.getElementById('flaResult'); if(!r) return;
  if(isNaN(volt)||volt<=0){r.innerHTML='';return;}

  let kw, modeLabel;

  if(flaHz===60) {
    const hpSel = parseFloat(document.getElementById('fla_hp_nema')?.value);
    const hp = hpSel===0 ? parseFloat(document.getElementById('fla_hp_nema_manual')?.value) : hpSel;
    if(isNaN(hp)||hp<=0){r.innerHTML='';return;}
    kw = hp * 0.7457;
    modeLabel = `${hp} HP (NEMA 60 Hz)`;
  } else {
    const kwSel = parseFloat(document.getElementById('fla_kw_iec')?.value);
    kw = kwSel===0 ? parseFloat(document.getElementById('fla_kw_iec_manual')?.value) : kwSel;
    if(isNaN(kw)||kw<=0){r.innerHTML='';return;}
    modeLabel = flaHz===50 ? `${kw} kW (IEC 50 Hz)` : `${kw} kW (50 Hz motor on 60 Hz supply)`;
  }

  const fla50 = (kw*1000)/(Math.sqrt(3)*volt*pf*eff);
  const rows = [];

  if(flaHz==='5060') {
    const factor = parseFloat(document.getElementById('fla_60hz_factor')?.value||1.15);
    const fla60  = fla50 * factor;
    rows.push(
      ['Nameplate FLA (50 Hz)', fmtN(fla50,2), 'A'],
      ['Estimated FLA at 60 Hz', fmtN(fla60,2), 'A', 'var(--accent)'],
      ['60 Hz correction factor applied', factor, '×'],
      ['Speed increase', '~20%', '(synchronous)'],
    );
  } else {
    rows.push(
      ['Full Load Current', fmtN(fla50,2), 'A', 'var(--accent)'],
    );
  }

  rows.push(
    ['Rated Power (shaft output)', fmtN(kw,2), 'kW'],
    ['1.15× Service Factor kW', fmtN(kw*1.15,2), 'kW'],
    ['Power Input (electrical)', fmtN(kw/eff,2), 'kW'],
    ['Mode', modeLabel, ''],
    ['PF used', pf, ''],
    ['Efficiency (η) used', eff, ''],
  );

  r.innerHTML = resultGrid(rows);
}

function htmlMotorStart(){
  return `<div class="field"><label>Motor FLA (A)</label><input type="number" id="ms_fla" value="50"></div>
  <div class="field"><label>Starting Method</label>
    <select id="ms_method">
      <option value="dol">DOL — Direct Online (6–8× FLA)</option>
      <option value="sd">Star-Delta (~1/3 of DOL)</option>
      <option value="ss">Soft Starter (~3× FLA)</option>
      <option value="vfd">VFD (~1.5× FLA)</option>
      <option value="auto">Autotransformer (custom tap)</option>
    </select></div>
  <div class="field"><label>DOL Multiplier (typically 6–8)</label><input type="number" id="ms_mult" value="7" step="0.5"></div>
  <div class="field"><label>Auto-transformer tap % (auto method only)</label><input type="number" id="ms_tap" value="65"></div>
  <button class="btn" onclick="calcMotorStart()" style="margin-top:8px">Calculate</button>
  <div id="msResult" style="margin-top:12px"></div>
  ${formulaNote('DOL: Istart = mult×FLA | Star-Delta: DOL/3 | Auto-tx: (tap/100)²×DOL')}`;
}

function calcMotorStart(){
  const fla=parseFloat(document.getElementById('ms_fla')?.value);
  const method=document.getElementById('ms_method')?.value;
  const mult=parseFloat(document.getElementById('ms_mult')?.value||7);
  const tap=parseFloat(document.getElementById('ms_tap')?.value||65)/100;
  const r=document.getElementById('msResult'); if(!r) return;
  if(isNaN(fla)){r.innerHTML='Enter FLA';return;}
  const dol=fla*mult;
  let istart,label;
  if(method==='dol'){istart=dol;label='DOL';}
  else if(method==='sd'){istart=dol/3;label='Star-Delta';}
  else if(method==='ss'){istart=fla*3;label='Soft Starter';}
  else if(method==='vfd'){istart=fla*1.5;label='VFD';}
  else{istart=tap*tap*dol;label=`Auto-tx ${Math.round(tap*100)}% tap`;}
  r.innerHTML=resultGrid([['Method',label,''],['DOL Starting Current',fmtN(dol,1),'A'],['Actual Starting Current',fmtN(istart,1),'A','var(--accent)'],['Ratio to FLA',fmtN(istart/fla,1),'× FLA']]);
}

function htmlPFC(){
  return `<div class="field"><label>Active Load (kW)</label><input type="number" id="pfc_kw" value="100" oninput="calcPFC()"></div>
  <div class="field"><label>Existing Power Factor</label><input type="number" id="pfc_pf1" value="0.75" step="0.01" min="0.1" max="1" oninput="calcPFC()"></div>
  <div class="field"><label>Target Power Factor</label><input type="number" id="pfc_pf2" value="0.95" step="0.01" min="0.1" max="1" oninput="calcPFC()"></div>
  <div id="pfcResult"></div>
  ${formulaNote('kVAR required = kW × (tan φ₁ − tan φ₂)')}`;
}

function calcPFC(){
  const kw=parseFloat(document.getElementById('pfc_kw')?.value);
  const pf1=parseFloat(document.getElementById('pfc_pf1')?.value);
  const pf2=parseFloat(document.getElementById('pfc_pf2')?.value);
  const r=document.getElementById('pfcResult'); if(!r) return;
  if([kw,pf1,pf2].some(isNaN)||pf1<=0||pf2<=0){r.innerHTML='';return;}
  const t1=Math.tan(Math.acos(pf1)),t2=Math.tan(Math.acos(pf2));
  const kvar=kw*(t1-t2);
  r.innerHTML=resultGrid([['kVAR Required',fmtN(kvar,2),'kVAR','var(--accent)'],['Existing kVA',fmtN(kw/pf1,2),'kVA'],['New kVA',fmtN(kw/pf2,2),'kVA']]);
}

function htmlTransformer(){
  return `<div class="field"><label>Total Connected Load (kVA)</label><input type="number" id="tx_load" value="100" oninput="calcTransformer()"></div>
  <div class="field"><label>Demand Factor (0.5–1.0)</label><input type="number" id="tx_df" value="0.8" step="0.05" oninput="calcTransformer()"></div>
  <div class="field"><label>Safety Margin (%)</label><input type="number" id="tx_margin" value="20" oninput="calcTransformer()"></div>
  <div id="txResult"></div>
  ${formulaNote('Required kVA = Load × Demand Factor × (1 + Margin/100). Round to next standard size.')}`;
}

const TX_SIZES=[5,10,15,25,37.5,50,75,100,150,167,200,250,333,500,750,1000,1500,2000,2500,3000,4000,5000];
function calcTransformer(){
  const load=parseFloat(document.getElementById('tx_load')?.value);
  const df=parseFloat(document.getElementById('tx_df')?.value);
  const margin=parseFloat(document.getElementById('tx_margin')?.value);
  const r=document.getElementById('txResult'); if(!r) return;
  if([load,df,margin].some(isNaN)){r.innerHTML='';return;}
  const req=load*df*(1+margin/100);
  const std=TX_SIZES.find(s=>s>=req)||req;
  r.innerHTML=resultGrid([['Demand Load',fmtN(load*df,1),'kVA'],['Required (with margin)',fmtN(req,1),'kVA'],['Recommended Standard',std,'kVA','var(--accent)'],['Loading at Standard',fmtN(req/std*100,1)+'%','']]);
}

function htmlFuse(){
  return `<div class="field"><label>Full Load Current (A)</label><input type="number" id="fs_fla" value="32" oninput="calcFuse()"></div>
  <div class="field"><label>Application</label>
    <select id="fs_app" onchange="calcFuse()">
      <option value="motor">Motor (×1.25 FLA)</option>
      <option value="general">General / Heating (×1.0)</option>
    </select></div>
  <div id="fsResult"></div>
  ${formulaNote('IEC 60947: Fuse ≥ 1.25 × FLA (motors). Round to nearest standard size.')}`;
}

const FUSE_SIZES=[1,2,3,4,6,10,13,16,20,25,32,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1000,1250];
function calcFuse(){
  const fla=parseFloat(document.getElementById('fs_fla')?.value);
  const app=document.getElementById('fs_app')?.value;
  const r=document.getElementById('fsResult'); if(!r) return;
  if(isNaN(fla)){r.innerHTML='';return;}
  const min_r=fla*(app==='motor'?1.25:1.0);
  const std=FUSE_SIZES.find(s=>s>=min_r)||min_r;
  r.innerHTML=resultGrid([['FLA',fmtN(fla,1),'A'],['Minimum Rating',fmtN(min_r,1),'A'],['Recommended Standard',std,'A','var(--accent)']]);
}

function htmlZs(){
  return `<div class="field"><label>Ze — External impedance (Ω)</label><input type="number" id="zs_ze" value="0.35" step="0.01"></div>
  <div class="field"><label>R1 — Line conductor resistance (Ω)</label><input type="number" id="zs_r1" value="0.25" step="0.01"></div>
  <div class="field"><label>R2 — CPC resistance (Ω)</label><input type="number" id="zs_r2" value="0.40" step="0.01"></div>
  <div class="field"><label>Protective Device</label>
    <select id="zs_dev">
      <option value="32B">32A Type B MCB (max 1.44 Ω)</option><option value="32C">32A Type C MCB (max 0.72 Ω)</option>
      <option value="63B">63A Type B MCB (max 0.73 Ω)</option><option value="63C">63A Type C MCB (max 0.36 Ω)</option>
      <option value="100B">100A Type B MCB (max 0.46 Ω)</option><option value="rcd">RCD protected</option>
    </select></div>
  <button class="btn" onclick="calcZs()" style="margin-top:8px">Calculate</button>
  <div id="zsResult" style="margin-top:12px"></div>
  ${formulaNote('Zs = Ze + R1 + R2 | Ia = Uo/Zs | BS 7671 / IEC 60364')}`;
}

const ZS_LIMITS={'32B':1.44,'32C':0.72,'63B':0.73,'63C':0.36,'100B':0.46,'rcd':999};
function calcZs(){
  const ze=parseFloat(document.getElementById('zs_ze')?.value);
  const r1=parseFloat(document.getElementById('zs_r1')?.value);
  const r2=parseFloat(document.getElementById('zs_r2')?.value);
  const dev=document.getElementById('zs_dev')?.value;
  const r=document.getElementById('zsResult'); if(!r) return;
  if([ze,r1,r2].some(isNaN)){r.innerHTML='Enter all values';return;}
  const zs=ze+r1+r2,limit=ZS_LIMITS[dev]||999,ia=230/zs,pass=zs<=limit;
  r.innerHTML=resultGrid([['Zs (total)',fmtN(zs,3),'Ω',pass?'var(--success)':'var(--danger)'],['Max permitted',limit===999?'N/A':limit,'Ω'],['Fault Current (Ia)',fmtN(ia,1),'A'],['Compliance',pass?'✅ PASS':'❌ FAIL','',pass?'var(--success)':'var(--danger)']]);
}

function htmlIR(){
  return `<div class="field"><label>IR at 1 min (MΩ)</label><input type="number" id="ir_1m" step="any"></div>
  <div class="field"><label>IR at 10 min (MΩ) — for PI</label><input type="number" id="ir_10m" step="any"></div>
  <div class="field"><label>IR at 30 s (MΩ) — for DAR</label><input type="number" id="ir_30s" step="any"></div>
  <div class="field"><label>IR at 60 s (MΩ) — for DAR</label><input type="number" id="ir_60s" step="any"></div>
  <button class="btn" onclick="calcIR()" style="margin-top:8px">Calculate</button>
  <div id="irResult" style="margin-top:12px"></div>
  ${formulaNote('PI = R₁₀ₘᵢₙ/R₁ₘᵢₙ | DAR = R₆₀ₛ/R₃₀ₛ | PI ≥ 2.0 good, ≥ 4.0 excellent')}`;
}

function calcIR(){
  const r1m=parseFloat(document.getElementById('ir_1m')?.value);
  const r10m=parseFloat(document.getElementById('ir_10m')?.value);
  const r30s=parseFloat(document.getElementById('ir_30s')?.value);
  const r60s=parseFloat(document.getElementById('ir_60s')?.value);
  const r=document.getElementById('irResult'); if(!r) return;
  let rows=[];
  if(!isNaN(r1m)) rows.push(['IR @ 1 min',fmtN(r1m,2),'MΩ',r1m>=100?'var(--success)':r1m>=10?'var(--warn)':'var(--danger)']);
  if(!isNaN(r10m)&&!isNaN(r1m)){const pi=r10m/r1m;rows.push(['PI (10min/1min)',fmtN(pi,2),'',pi>=4?'var(--success)':pi>=2?'var(--warn)':'var(--danger)'],['PI Assessment',pi>=4?'Excellent':pi>=2?'Good':pi>=1?'Questionable':'Poor','',pi>=2?'var(--success)':'var(--danger)']);}
  if(!isNaN(r30s)&&!isNaN(r60s)){const dar=r60s/r30s;rows.push(['DAR (60s/30s)',fmtN(dar,2),'',dar>=1.25?'var(--success)':'var(--danger)'],['DAR Assessment',dar>=1.25?'Acceptable':'Poor','',dar>=1.25?'var(--success)':'var(--danger)']);}
  if(rows.length===0){r.innerHTML='Enter at least one pair of values';return;}
  r.innerHTML=resultGrid(rows);
}

function htmlBattery(){
  return `<div class="field"><label>Total DC Load (W)</label><input type="number" id="bat_load" value="500"></div>
  <div class="field"><label>System Voltage (V)</label><input type="number" id="bat_volt" value="24"></div>
  <div class="field"><label>Required Backup Time (hours)</label><input type="number" id="bat_hrs" value="4" step="0.5"></div>
  <div class="field"><label>Battery Type</label>
    <select id="bat_type"><option value="0.8">Lead-Acid / VRLA (80% usable)</option><option value="0.9">Li-Ion (90% usable)</option><option value="0.75">Ni-Cd (75% usable)</option></select></div>
  <button class="btn" onclick="calcBattery()" style="margin-top:8px">Calculate</button>
  <div id="batResult" style="margin-top:12px"></div>
  ${formulaNote('Ah = (Load/V) × Hours / Usable Capacity | Add 20% design margin')}`;
}

function calcBattery(){
  const load=parseFloat(document.getElementById('bat_load')?.value);
  const volt=parseFloat(document.getElementById('bat_volt')?.value);
  const hrs=parseFloat(document.getElementById('bat_hrs')?.value);
  const cap=parseFloat(document.getElementById('bat_type')?.value||0.8);
  const r=document.getElementById('batResult'); if(!r) return;
  if([load,volt,hrs].some(isNaN)){r.innerHTML='';return;}
  const raw=(load/volt)*hrs/cap;
  r.innerHTML=resultGrid([['Load Current',fmtN(load/volt,2),'A'],['Minimum Ah',fmtN(raw,1),'Ah'],['Recommended (+20% margin)',fmtN(raw*1.2,1),'Ah','var(--accent)']]);
}

function htmlDB(){
  return `<div class="field"><label>Mode</label>
    <select id="db_mode" onchange="calcDB()">
      <option value="pow_ratio">Power ratio → dB</option><option value="volt_ratio">Voltage ratio → dB</option>
      <option value="db_pow">dB → Power ratio</option><option value="db_volt">dB → Voltage ratio</option>
    </select></div>
  <div class="field"><label id="db_in_label">Ratio (P2/P1)</label>
    <input type="number" id="db_val" value="2" step="any" oninput="calcDB()"></div>
  <div id="dbResult"></div>
  ${formulaNote('Power: dB = 10×log₁₀(P₂/P₁) | Voltage: dB = 20×log₁₀(V₂/V₁)')}`;
}

function calcDB(){
  const mode=document.getElementById('db_mode')?.value;
  const val=parseFloat(document.getElementById('db_val')?.value);
  const lbl=document.getElementById('db_in_label');
  const r=document.getElementById('dbResult'); if(!r) return;
  if(lbl) lbl.textContent=mode?.includes('db')?'dB value':'Ratio';
  if(isNaN(val)){r.innerHTML='';return;}
  let result,label;
  if(mode==='pow_ratio'){result=10*Math.log10(val);label='dB';}
  else if(mode==='volt_ratio'){result=20*Math.log10(val);label='dB';}
  else if(mode==='db_pow'){result=Math.pow(10,val/10);label='Power ratio';}
  else{result=Math.pow(10,val/20);label='Voltage ratio';}
  r.innerHTML=resultGrid([['Result',fmtN(result,4),label,'var(--accent)']]);
}

function htmlLux(){
  return `<div class="field"><label>Room Length (m)</label><input type="number" id="lux_l" value="10" oninput="calcLux()"></div>
  <div class="field"><label>Room Width (m)</label><input type="number" id="lux_w" value="6" oninput="calcLux()"></div>
  <div class="field"><label>Lumens per Fitting</label><input type="number" id="lux_lm" value="3500" oninput="calcLux()"></div>
  <div class="field"><label>Number of Fittings</label><input type="number" id="lux_n" value="8" oninput="calcLux()"></div>
  <div class="field"><label>Maintenance Factor (0.5–1.0)</label><input type="number" id="lux_mf" value="0.8" step="0.05" oninput="calcLux()"></div>
  <div id="luxResult"></div>
  ${formulaNote('Lux = (N × Lm × UF × MF) / Area | UF (utilisation factor) assumed 0.65')}`;
}

function calcLux(){
  const l=parseFloat(document.getElementById('lux_l')?.value),w=parseFloat(document.getElementById('lux_w')?.value);
  const lm=parseFloat(document.getElementById('lux_lm')?.value),n=parseFloat(document.getElementById('lux_n')?.value);
  const mf=parseFloat(document.getElementById('lux_mf')?.value||0.8);
  const r=document.getElementById('luxResult'); if(!r) return;
  if([l,w,lm,n].some(isNaN)){r.innerHTML='';return;}
  const lux=n*lm*0.65*mf/(l*w);
  const guide=lux>=500?'Control Room ✅':lux>=300?'Workshop ✅':lux>=150?'General area ✅':'Below minimum ⚠️';
  r.innerHTML=resultGrid([['Average Illuminance',fmtN(lux,0),'lux','var(--accent)'],['Area',fmtN(l*w,1),'m²'],['Offshore guide',guide,'']]);
}

// ══════════════════════════════════════════════════════════
// HVAC
// ══════════════════════════════════════════════════════════

function htmlHeatLoad(){
  return `<div class="field"><label>Room Area (m²)</label><input type="number" id="hl_area" value="50"></div>
  <div class="field"><label>Ceiling Height (m)</label><input type="number" id="hl_h" value="2.7" step="0.1"></div>
  <div class="field"><label>U-value (W/m²K)</label><input type="number" id="hl_u" value="0.35" step="0.05"></div>
  <div class="field"><label>Indoor Temp (°C)</label><input type="number" id="hl_tin" value="21"></div>
  <div class="field"><label>Outdoor Temp (°C)</label><input type="number" id="hl_tout" value="35"></div>
  <div class="field"><label>Number of Occupants</label><input type="number" id="hl_occ" value="4"></div>
  <div class="field"><label>Equipment Load (W)</label><input type="number" id="hl_equip" value="1000"></div>
  <button class="btn" onclick="calcHeatLoad()" style="margin-top:8px">Calculate</button>
  <div id="hlResult" style="margin-top:12px"></div>
  ${formulaNote('Q_fabric = U × A × ΔT | Q_occ ≈ 80W/person | Simplified — use CIBSE for design')}`;
}

function calcHeatLoad(){
  const area=parseFloat(document.getElementById('hl_area')?.value),h=parseFloat(document.getElementById('hl_h')?.value);
  const u=parseFloat(document.getElementById('hl_u')?.value),tin=parseFloat(document.getElementById('hl_tin')?.value);
  const tout=parseFloat(document.getElementById('hl_tout')?.value),occ=parseFloat(document.getElementById('hl_occ')?.value||0);
  const equip=parseFloat(document.getElementById('hl_equip')?.value||0);
  const r=document.getElementById('hlResult'); if(!r) return;
  if([area,h,u,tin,tout].some(isNaN)){r.innerHTML='Enter all values';return;}
  const dt=Math.abs(tout-tin),wallArea=4*Math.sqrt(area)*h+area;
  const qFabric=u*wallArea*dt,qOcc=occ*80,total=qFabric+qOcc+equip;
  r.innerHTML=resultGrid([['Fabric Loss/Gain',fmtN(qFabric,0),'W'],['Occupancy Gain',fmtN(qOcc,0),'W'],['Equipment Gain',fmtN(equip,0),'W'],['Total Load',fmtN(total,0),'W','var(--accent)'],['Total Load',fmtN(total/1000,2),'kW'],['BTU/hr',fmtN(total*3.412,0),'BTU/hr']]);
}

function htmlACH(){
  return `<div class="field"><label>Room Volume (m³)</label><input type="number" id="ach_vol" value="135" oninput="calcACH()"></div>
  <div class="field"><label>Airflow Rate (m³/hr)</label><input type="number" id="ach_flow" value="810" oninput="calcACH()"></div>
  <div id="achResult"></div>
  ${formulaNote('ACH = Airflow (m³/hr) / Volume (m³)')}`;
}

function calcACH(){
  const vol=parseFloat(document.getElementById('ach_vol')?.value),flow=parseFloat(document.getElementById('ach_flow')?.value);
  const r=document.getElementById('achResult'); if(!r) return;
  if([vol,flow].some(isNaN)){r.innerHTML='';return;}
  const ach=flow/vol;
  const guide=ach>=12?'Battery room min ✅':ach>=6?'Accommodation ✅':ach>=4?'Low':'Below typical minimum';
  r.innerHTML=resultGrid([['Air Changes/Hour',fmtN(ach,1),'ACH','var(--accent)'],['Offshore Guide',guide,'']]);
}

function htmlDuct(){
  return `<div class="field"><label>Airflow (m³/s)</label><input type="number" id="duct_q" value="0.5" step="0.01" oninput="calcDuct()"></div>
  <div class="field"><label>Target Velocity (m/s)</label><input type="number" id="duct_v" value="6" step="0.5" oninput="calcDuct()"></div>
  <div id="ductResult"></div>
  ${formulaNote('A = Q/V | Dia = √(4A/π) | Square side = √A')}`;
}

function calcDuct(){
  const q=parseFloat(document.getElementById('duct_q')?.value),v=parseFloat(document.getElementById('duct_v')?.value);
  const r=document.getElementById('ductResult'); if(!r) return;
  if([q,v].some(isNaN)){r.innerHTML='';return;}
  const area=q/v;
  r.innerHTML=resultGrid([['Required Area',fmtN(area*1e4,1),'cm²'],['Circular duct dia',fmtN(Math.sqrt(4*area/Math.PI)*1000,0),'mm','var(--accent)'],['Square duct side',fmtN(Math.sqrt(area)*1000,0),'mm']]);
}

function htmlChilledWater(){
  return `<div class="field"><label>Cooling Load (kW)</label><input type="number" id="cw_kw" value="50" oninput="calcChilledWater()"></div>
  <div class="field"><label>Supply Temp (°C)</label><input type="number" id="cw_ts" value="6" oninput="calcChilledWater()"></div>
  <div class="field"><label>Return Temp (°C)</label><input type="number" id="cw_tr" value="12" oninput="calcChilledWater()"></div>
  <div id="cwResult"></div>
  ${formulaNote('ṁ = Q / (Cp × ΔT) | Cp water = 4.187 kJ/kg·K')}`;
}

function calcChilledWater(){
  const kw=parseFloat(document.getElementById('cw_kw')?.value);
  const ts=parseFloat(document.getElementById('cw_ts')?.value),tr=parseFloat(document.getElementById('cw_tr')?.value);
  const r=document.getElementById('cwResult'); if(!r) return;
  if([kw,ts,tr].some(isNaN)){r.innerHTML='';return;}
  const dt=Math.abs(tr-ts); if(dt===0){r.innerHTML='Supply and return temp must differ';return;}
  const mdot=kw/(4.187*dt);
  r.innerHTML=resultGrid([['ΔT',fmtN(dt,1),'°C'],['Mass flow',fmtN(mdot,3),'kg/s'],['Volume flow',fmtN(mdot,3),'L/s','var(--accent)'],['Volume flow',fmtN(mdot*3.6,2),'m³/hr']]);
}

function htmlPressureConv(){
  return `<div class="field"><label>Input Value</label><input type="number" id="pc_val" value="1" step="any" oninput="calcPressureConv()"></div>
  <div class="field"><label>Input Unit</label>
    <select id="pc_unit" onchange="calcPressureConv()">
      <option value="bar">bar</option><option value="psi">psi</option><option value="pa">Pa</option>
      <option value="kpa">kPa</option><option value="mpa">MPa</option><option value="mmhg">mmHg (Torr)</option>
      <option value="atm">atm</option><option value="inh2o">inH₂O</option>
    </select></div>
  <div id="pcResult"></div>
  ${formulaNote('1 bar = 14.504 psi = 100 kPa = 750.06 mmHg = 0.9869 atm')}`;
}

function calcPressureConv(){
  const val=parseFloat(document.getElementById('pc_val')?.value);
  const unit=document.getElementById('pc_unit')?.value;
  const r=document.getElementById('pcResult'); if(!r) return;
  if(isNaN(val)){r.innerHTML='';return;}
  const toPA={bar:1e5,psi:6894.76,pa:1,kpa:1e3,mpa:1e6,mmhg:133.322,atm:101325,inh2o:249.089};
  const pa=val*toPA[unit];
  r.innerHTML=resultGrid([['bar',fmtN(pa/1e5,5),''],['psi',fmtN(pa/6894.76,4),''],['Pa',fmtN(pa,2),''],['kPa',fmtN(pa/1e3,4),''],['MPa',fmtN(pa/1e6,6),''],['mmHg (Torr)',fmtN(pa/133.322,3),''],['atm',fmtN(pa/101325,5),''],['inH₂O',fmtN(pa/249.089,3),'']]);
}

// ══════════════════════════════════════════════════════════
// MECHANICAL
// ══════════════════════════════════════════════════════════

function htmlTorque(){
  return `<div class="field"><label>Mode</label>
    <select id="tq_mode" onchange="calcTorque()">
      <option value="pt">Power + Speed → Torque</option><option value="tp">Torque + Speed → Power</option>
    </select></div>
  <div class="field"><label>Power (kW)</label><input type="number" id="tq_kw" value="22" oninput="calcTorque()"></div>
  <div class="field"><label>Torque (N·m)</label><input type="number" id="tq_nm" placeholder="leave blank if solving" oninput="calcTorque()"></div>
  <div class="field"><label>Speed (RPM)</label><input type="number" id="tq_rpm" value="1480" oninput="calcTorque()"></div>
  <div id="tqResult"></div>
  ${formulaNote('T(N·m) = P(kW)×9550/RPM | P(kW) = T×RPM/9550')}`;
}

function calcTorque(){
  const mode=document.getElementById('tq_mode')?.value;
  const kw=parseFloat(document.getElementById('tq_kw')?.value);
  const nm=parseFloat(document.getElementById('tq_nm')?.value);
  const rpm=parseFloat(document.getElementById('tq_rpm')?.value);
  const r=document.getElementById('tqResult'); if(!r) return;
  if(isNaN(rpm)){r.innerHTML='';return;}
  if(mode==='pt'&&!isNaN(kw)){const t=kw*9550/rpm;r.innerHTML=resultGrid([['Torque',fmtN(t,2),'N·m','var(--accent)'],['Torque',fmtN(t*0.7376,2),'ft·lb']]);}
  else if(mode==='tp'&&!isNaN(nm)){const p=nm*rpm/9550;r.innerHTML=resultGrid([['Power',fmtN(p,3),'kW','var(--accent)'],['Power',fmtN(p*1.341,3),'HP']]);}
  else r.innerHTML='<span style="color:var(--text2)">Enter required values</span>';
}

function htmlPump(){
  return `<div class="field"><label>Flow Rate (L/s)</label><input type="number" id="pm_q" value="10" oninput="calcPump()"></div>
  <div class="field"><label>Total Head (m)</label><input type="number" id="pm_h" value="30" oninput="calcPump()"></div>
  <div class="field"><label>Fluid Density (kg/m³)</label><input type="number" id="pm_rho" value="1025" oninput="calcPump()"></div>
  <div class="field"><label>Pump Efficiency (%)</label><input type="number" id="pm_eff" value="75" oninput="calcPump()"></div>
  <div id="pmResult"></div>
  ${formulaNote('P_hydraulic = ρ×g×Q×H | P_shaft = P_hydraulic/η | g=9.81 m/s²')}`;
}

function calcPump(){
  const q=parseFloat(document.getElementById('pm_q')?.value)/1000;
  const h=parseFloat(document.getElementById('pm_h')?.value);
  const rho=parseFloat(document.getElementById('pm_rho')?.value||1000);
  const eff=parseFloat(document.getElementById('pm_eff')?.value||75)/100;
  const r=document.getElementById('pmResult'); if(!r) return;
  if([q,h].some(isNaN)){r.innerHTML='';return;}
  const phyd=rho*9.81*q*h;
  r.innerHTML=resultGrid([['Hydraulic Power',fmtN(phyd/1000,3),'kW'],['Shaft Power',fmtN(phyd/eff/1000,3),'kW','var(--accent)'],['Shaft Power',fmtN(phyd/eff/745.7,3),'HP']]);
}

function htmlPipeVelocity(){
  return `<div class="field"><label>Pipe Internal Bore (mm)</label><input type="number" id="pv_bore" value="50" oninput="calcPipeVelocity()"></div>
  <div class="field"><label>Flow Rate (L/s)</label><input type="number" id="pv_q" value="5" oninput="calcPipeVelocity()"></div>
  <div id="pvResult"></div>
  ${formulaNote('V = Q/A | A = π(d/2)² | Limit: water ≤3 m/s, seawater ≤2 m/s')}`;
}

function calcPipeVelocity(){
  const bore=parseFloat(document.getElementById('pv_bore')?.value)/1000;
  const q=parseFloat(document.getElementById('pv_q')?.value)/1000;
  const r=document.getElementById('pvResult'); if(!r) return;
  if([bore,q].some(isNaN)||bore<=0){r.innerHTML='';return;}
  const area=Math.PI*(bore/2)**2,vel=q/area;
  r.innerHTML=resultGrid([['Pipe Area',fmtN(area*1e4,2),'cm²'],['Velocity',fmtN(vel,3),'m/s',warnBand(vel,2,3)],['Assessment',vel>3?'⚠️ High — erosion risk':vel>2?'⚠️ Above seawater limit':'✅ Acceptable','']]);
}

function htmlPipePressure(){
  return `<div class="field"><label>Pipe Internal Bore (mm)</label><input type="number" id="pp_bore" value="50"></div>
  <div class="field"><label>Pipe Length (m)</label><input type="number" id="pp_len" value="100"></div>
  <div class="field"><label>Flow Velocity (m/s)</label><input type="number" id="pp_vel" value="2"></div>
  <div class="field"><label>Fluid Density (kg/m³)</label><input type="number" id="pp_rho" value="1025"></div>
  <div class="field"><label>Darcy Friction Factor (f)</label><input type="number" id="pp_f" value="0.02" step="0.001"></div>
  <button class="btn" onclick="calcPipePressure()" style="margin-top:8px">Calculate</button>
  <div id="ppResult" style="margin-top:12px"></div>
  ${formulaNote('ΔP = f×(L/D)×(ρV²/2) | f≈0.02 turbulent steel | Add 10–20% for fittings')}`;
}

function calcPipePressure(){
  const bore=parseFloat(document.getElementById('pp_bore')?.value)/1000;
  const len=parseFloat(document.getElementById('pp_len')?.value);
  const vel=parseFloat(document.getElementById('pp_vel')?.value);
  const rho=parseFloat(document.getElementById('pp_rho')?.value||1025);
  const f=parseFloat(document.getElementById('pp_f')?.value||0.02);
  const r=document.getElementById('ppResult'); if(!r) return;
  if([bore,len,vel,rho].some(isNaN)||bore<=0){r.innerHTML='Enter all values';return;}
  const dp=f*(len/bore)*(rho*vel**2/2);
  r.innerHTML=resultGrid([['Pressure Drop',fmtN(dp/1000,3),'kPa','var(--accent)'],['Pressure Drop',fmtN(dp/1e5,5),'bar'],['Pressure Drop',fmtN(dp/6894.76,3),'psi']]);
}

function htmlThermalExp(){
  return `<div class="field"><label>Material</label>
    <select id="te_mat" onchange="calcThermalExp()">
      <option value="12">Carbon Steel (12 μm/m·°C)</option><option value="16">Stainless Steel 316 (16 μm/m·°C)</option>
      <option value="17">Copper (17 μm/m·°C)</option><option value="23">Aluminium (23 μm/m·°C)</option>
      <option value="150">HDPE (150 μm/m·°C)</option><option value="200">XLPE Cable (200 μm/m·°C)</option>
      <option value="0">Custom…</option>
    </select></div>
  <div class="field"><label>α — Coefficient (μm/m·°C) — custom only</label>
    <input type="number" id="te_alpha" value="12" oninput="calcThermalExp()"></div>
  <div class="field"><label>Length (m)</label><input type="number" id="te_len" value="100" oninput="calcThermalExp()"></div>
  <div class="field"><label>ΔT — Temperature change (°C)</label><input type="number" id="te_dt" value="40" oninput="calcThermalExp()"></div>
  <div id="teResult"></div>
  ${formulaNote('ΔL = α × L × ΔT | α in μm/m·°C')}`;
}

function calcThermalExp(){
  const mat=parseFloat(document.getElementById('te_mat')?.value);
  const alphaRaw=mat===0?parseFloat(document.getElementById('te_alpha')?.value):mat;
  const alpha=alphaRaw/1e6;
  const len=parseFloat(document.getElementById('te_len')?.value);
  const dt=parseFloat(document.getElementById('te_dt')?.value);
  const r=document.getElementById('teResult'); if(!r) return;
  if([alpha,len,dt].some(isNaN)){r.innerHTML='';return;}
  const dL=alpha*len*dt;
  r.innerHTML=resultGrid([['Expansion ΔL',fmtN(dL*1000,2),'mm','var(--accent)'],['Expansion ΔL',fmtN(dL*1000/25.4,3),'inches']]);
}

// ══════════════════════════════════════════════════════════
// OFFSHORE / PROCESS
// ══════════════════════════════════════════════════════════

function htmlHydrostatic(){
  return `<div class="field"><label>Depth (m)</label><input type="number" id="hs_depth" value="100" oninput="calcHydrostatic()"></div>
  <div class="field"><label>Fluid</label>
    <select id="hs_fluid" onchange="calcHydrostatic()">
      <option value="1025">Seawater (1025 kg/m³)</option><option value="1000">Fresh Water (1000 kg/m³)</option>
      <option value="800">Light Oil (~800 kg/m³)</option><option value="0">Custom density…</option>
    </select></div>
  <div class="field"><label>Custom Density (kg/m³)</label><input type="number" id="hs_rho" value="1025" oninput="calcHydrostatic()"></div>
  <div id="hsResult"></div>
  ${formulaNote('P = ρ×g×h | Seawater: ~1 bar per 10m depth')}`;
}

function calcHydrostatic(){
  const depth=parseFloat(document.getElementById('hs_depth')?.value);
  const fluidSel=parseFloat(document.getElementById('hs_fluid')?.value);
  const rho=fluidSel===0?parseFloat(document.getElementById('hs_rho')?.value||1025):fluidSel;
  const r=document.getElementById('hsResult'); if(!r) return;
  if(isNaN(depth)||isNaN(rho)){r.innerHTML='';return;}
  const pa=rho*9.81*depth;
  r.innerHTML=resultGrid([['Pressure',fmtN(pa/1e5,4),'bar','var(--accent)'],['Pressure',fmtN(pa/6894.76,3),'psi'],['Pressure',fmtN(pa/1e3,2),'kPa'],['~Depth equiv',fmtN(pa/(1025*9.81),1),'m SW']]);
}

function htmlBoyles(){
  return `<div class="field"><label>Initial Pressure P1 (bar absolute)</label><input type="number" id="bl_p1" value="1.013" step="any" oninput="calcBoyles()"></div>
  <div class="field"><label>Initial Volume V1 (litres)</label><input type="number" id="bl_v1" value="50" oninput="calcBoyles()"></div>
  <div class="field"><label>Final Pressure P2 (bar absolute)</label><input type="number" id="bl_p2" value="7" oninput="calcBoyles()"></div>
  <div id="blResult"></div>
  ${formulaNote('P₁V₁ = P₂V₂ | Constant temperature. 1 atm = 1.01325 bar absolute.')}`;
}

function calcBoyles(){
  const p1=parseFloat(document.getElementById('bl_p1')?.value);
  const v1=parseFloat(document.getElementById('bl_v1')?.value);
  const p2=parseFloat(document.getElementById('bl_p2')?.value);
  const r=document.getElementById('blResult'); if(!r) return;
  if([p1,v1,p2].some(isNaN)||p2<=0){r.innerHTML='';return;}
  const v2=p1*v1/p2;
  r.innerHTML=resultGrid([['V2 (Final Volume)',fmtN(v2,4),'L','var(--accent)'],['Compression ratio',fmtN(v1/v2,3),'× reduction']]);
}

function htmlVacuum(){
  return `<div class="field"><label>Input Value</label><input type="number" id="vac_val" value="500" step="any" oninput="calcVacuum()"></div>
  <div class="field"><label>Input Unit</label>
    <select id="vac_unit" onchange="calcVacuum()">
      <option value="mbar_abs">mbar (absolute)</option><option value="torr">Torr (mmHg)</option>
      <option value="pct">% Vacuum</option><option value="pa">Pa (absolute)</option><option value="inhg">inHg</option>
    </select></div>
  <div id="vacResult"></div>
  ${formulaNote('1 atm = 1013.25 mbar = 760 Torr = 101325 Pa | % Vacuum = (1 − P/Patm)×100')}`;
}

function calcVacuum(){
  const val=parseFloat(document.getElementById('vac_val')?.value);
  const unit=document.getElementById('vac_unit')?.value;
  const r=document.getElementById('vacResult'); if(!r) return;
  if(isNaN(val)){r.innerHTML='';return;}
  const atm=101325;
  const toPA={mbar_abs:100,torr:133.322,pa:1,inhg:3386.39};
  const pa_abs=unit==='pct'?atm*(1-val/100):val*toPA[unit];
  const pct_vac=(1-pa_abs/atm)*100;
  const quality=pa_abs>10000?'Rough vacuum':pa_abs>100?'Medium vacuum':pa_abs>0.1?'High vacuum':'Ultra-high vacuum';
  r.innerHTML=resultGrid([['mbar (abs)',fmtN(pa_abs/100,3),'mbar'],['Torr',fmtN(pa_abs/133.322,3),'Torr'],['% Vacuum',fmtN(Math.max(0,pct_vac),2),'%'],['Pa (abs)',fmtN(pa_abs,2),'Pa'],['inHg',fmtN(pa_abs/3386.39,3),'inHg'],['Quality',quality,'']]);
}

function htmlVentilation(){
  return `<div class="field"><label>Room Area (m²)</label><input type="number" id="ven_area" value="50" oninput="calcVentilation()"></div>
  <div class="field"><label>Ceiling Height (m)</label><input type="number" id="ven_h" value="2.7" step="0.1" oninput="calcVentilation()"></div>
  <div class="field"><label>Required ACH</label><input type="number" id="ven_ach" value="8" oninput="calcVentilation()"></div>
  <div id="venResult"></div>
  ${formulaNote('Q(m³/hr) = Volume × ACH | Q(m³/s) = Q/3600')}`;
}

function calcVentilation(){
  const area=parseFloat(document.getElementById('ven_area')?.value);
  const h=parseFloat(document.getElementById('ven_h')?.value);
  const ach=parseFloat(document.getElementById('ven_ach')?.value);
  const r=document.getElementById('venResult'); if(!r) return;
  if([area,h,ach].some(isNaN)){r.innerHTML='';return;}
  const vol=area*h,qhr=vol*ach,qs=qhr/3600;
  r.innerHTML=resultGrid([['Volume',fmtN(vol,1),'m³'],['Airflow',fmtN(qhr,0),'m³/hr','var(--accent)'],['Airflow',fmtN(qs,3),'m³/s'],['Airflow',fmtN(qs*2118.88,0),'CFM']]);
}

// ══════════════════════════════════════════════════════════
// GENERAL
// ══════════════════════════════════════════════════════════

function htmlPctError(){
  return `<div class="field"><label>Actual / Reference Value</label><input type="number" id="pe_ref" value="100" step="any" oninput="calcPctError()"></div>
  <div class="field"><label>Measured / Observed Value</label><input type="number" id="pe_meas" value="97.5" step="any" oninput="calcPctError()"></div>
  <div class="field"><label>Tolerance (%)</label><input type="number" id="pe_tol" value="2" step="0.1" oninput="calcPctError()"></div>
  <div id="peResult"></div>
  ${formulaNote('% Error = |Measured − Actual| / |Actual| × 100')}`;
}

function calcPctError(){
  const ref=parseFloat(document.getElementById('pe_ref')?.value);
  const meas=parseFloat(document.getElementById('pe_meas')?.value);
  const tol=parseFloat(document.getElementById('pe_tol')?.value||2);
  const r=document.getElementById('peResult'); if(!r) return;
  if([ref,meas].some(isNaN)||ref===0){r.innerHTML='';return;}
  const err=Math.abs(meas-ref)/Math.abs(ref)*100;
  const pass=err<=tol;
  r.innerHTML=resultGrid([['% Error',fmtN(err,4)+'%','',pass?'var(--success)':'var(--danger)'],['Tolerance',fmtN(tol,2)+'%',''],['Result',pass?'✅ Within tolerance':'❌ Out of tolerance','',pass?'var(--success)':'var(--danger)'],['Absolute Error',fmtN(Math.abs(meas-ref),4),'']]);
}

function htmlThreePhase(){
  return `<div class="field"><label>Line Voltage VL (V)</label>${voltSelect('tp_volt','calcThreePhase()',400)}</div>
  <div class="field"><label>Line Current IL (A)</label><input type="number" id="tp_il" value="100" oninput="calcThreePhase()"></div>
  <div class="field"><label>Power Factor</label><input type="number" id="tp_pf" value="0.85" step="0.01" min="0" max="1" oninput="calcThreePhase()"></div>
  <div id="tpResult"></div>
  ${formulaNote('P = √3×VL×IL×cosφ | S = √3×VL×IL | Q = √3×VL×IL×sinφ')}`;
}

function calcThreePhase(){
  const vl=getVolt('tp_volt'),il=parseFloat(document.getElementById('tp_il')?.value);
  const pf=parseFloat(document.getElementById('tp_pf')?.value||0.85);
  const r=document.getElementById('tpResult'); if(!r) return;
  if(isNaN(vl)||isNaN(il)){r.innerHTML='';return;}
  const s=Math.sqrt(3)*vl*il/1000,p=s*pf,q=Math.sqrt(Math.max(0,s**2-p**2));
  r.innerHTML=resultGrid([['Apparent Power S',fmtN(s,4),'kVA'],['Active Power P',fmtN(p,4),'kW','var(--accent)'],['Reactive Power Q',fmtN(q,4),'kVAR'],['Phase Voltage',fmtN(vl/Math.sqrt(3),2),'V'],['Angle φ',fmtN(Math.acos(Math.min(1,pf))*180/Math.PI,2),'°']]);
}

// ── IP Rating ─────────────────────────────────────────────
const IP_FIRST={0:'No protection',1:'≥50mm objects (hand)',2:'≥12.5mm objects (finger)',3:'≥2.5mm objects (tools)',4:'≥1mm objects (wire)',5:'Dust protected (limited ingress)',6:'Dust tight (no ingress)'};
const IP_SECOND={0:'No protection',1:'Dripping water (vertical)',2:'Dripping water (15° tilt)',3:'Spraying water (60°)',4:'Splashing water (all directions)',5:'Water jets',6:'Powerful water jets',7:'Temporary immersion (1m/30min)',8:'Continuous immersion',9:'High-pressure jet wash'};

// IP Rating moved to ATEX tab (tab-atex.js)

// ── Date Calculator ───────────────────────────────────────
let calState={viewYear:new Date().getFullYear(),viewMonth:new Date().getMonth(),selectedDate:null,selectedDate2:null,activeCalendar:1};

function htmlDateCalc(){
  return `<div class="grid2">
    <div>
      <div class="cal-pick-btns">
        <button class="btn active" id="calPicking1" onclick="calSetActive(1)" style="border-color:var(--accent)">📍 Set Date A (blue)</button>
        <button class="btn" id="calPicking2" onclick="calSetActive(2)">📍 Set Date B (orange)</button>
      </div>
      <div id="calWidget" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px"></div>
      <p style="margin-top:8px;font-size:0.75rem;color:var(--text2)">Click to set <span style="color:var(--accent)">Date A</span>, then <span style="color:var(--accent2)">Date B</span>. Today = <span style="color:var(--accent4)">amber</span>.</p>
    </div>
    <div>
      <h4 style="margin-bottom:10px">Add / Subtract from Date A</h4>
      <div class="flex-row" style="margin-bottom:12px">
        <div class="field" style="flex:1"><label>Amount (negative = back)</label><input type="number" id="daysNum" value="30" oninput="updateDateCalcResults()"></div>
        <div class="field" style="flex:0 0 auto"><label>Unit</label>
          <select id="daysUnit" onchange="updateDateCalcResults()">
            <option value="days">Days</option><option value="weeks">Weeks</option><option value="months">Months</option>
          </select></div>
      </div>
      <div id="dateFwdResult"></div>
      <hr style="border:none;border-top:1px solid var(--border);margin:16px 0">
      <h4 style="margin-bottom:10px">Difference — Date A → Date B</h4>
      <p style="font-size:0.8rem;color:var(--text2);margin-bottom:10px">Set both A and B on the calendar above.</p>
      <div id="dateDiffResult"></div>
    </div>
  </div>`;
}

function renderCalendar(){
  const cal=calState,y=cal.viewYear,m=cal.viewMonth;
  const mNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dNames=['Su','Mo','Tu','We','Th','Fr','Sa'];
  const firstDay=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate();
  const today=new Date();today.setHours(0,0,0,0);
  const s1=cal.selectedDate,s2=cal.selectedDate2;
  let html=`<div class="cal-header"><button class="btn" onclick="calNav(-1)" style="padding:4px 10px">‹</button>
    <span style="font-family:var(--head);font-weight:700;color:var(--text)">${mNames[m]} ${y}</span>
    <button class="btn" onclick="calNav(1)" style="padding:4px 10px">›</button></div>
  <div class="cal-grid">${dNames.map(d=>`<div class="cal-dayname">${d}</div>`).join('')}`;
  for(let i=0;i<firstDay;i++) html+=`<div class="cal-cell empty"></div>`;
  for(let d=1;d<=dim;d++){
    const dt=new Date(y,m,d);
    const cls=['cal-cell',dt.getTime()===today.getTime()?'cal-today':'',s1&&dt.getTime()===s1.getTime()?'cal-sel1':'',s2&&dt.getTime()===s2.getTime()?'cal-sel2':''].filter(Boolean).join(' ');
    html+=`<div class="${cls}" onclick="calPickDate(${y},${m},${d})">${d}</div>`;
  }
  html+=`</div>`;
  const el=document.getElementById('calWidget');
  if(el) el.innerHTML=html;
  updateDateCalcResults();
}

function calNav(dir){calState.viewMonth+=dir;if(calState.viewMonth>11){calState.viewMonth=0;calState.viewYear++;}if(calState.viewMonth<0){calState.viewMonth=11;calState.viewYear--;}renderCalendar();}
function calPickDate(y,m,d){const dt=new Date(y,m,d);if(calState.activeCalendar===1)calState.selectedDate=dt;else calState.selectedDate2=dt;calState.activeCalendar=calState.activeCalendar===1?2:1;renderCalendar();}
function calSetActive(n){calState.activeCalendar=n;document.getElementById('calPicking1')?.classList.toggle('active',n===1);document.getElementById('calPicking2')?.classList.toggle('active',n===2);}

function updateDateCalcResults(){
  const s1=calState.selectedDate,s2=calState.selectedDate2;
  const fwd=parseInt(document.getElementById('daysNum')?.value||0);
  const unit=document.getElementById('daysUnit')?.value||'days';
  if(s1&&fwd!==0){
    const dt=new Date(s1);
    if(unit==='days')dt.setDate(dt.getDate()+fwd);
    else if(unit==='weeks')dt.setDate(dt.getDate()+fwd*7);
    else dt.setMonth(dt.getMonth()+fwd);
    const el=document.getElementById('dateFwdResult');
    if(el)el.innerHTML=`<div class="npt-info-item"><div class="key">${fwd>0?fwd+' '+unit+' forward':Math.abs(fwd)+' '+unit+' back'}</div><div class="val" style="color:var(--accent)">${dt.toISOString().split('T')[0]} (${dt.toLocaleDateString('en-GB',{weekday:'long'})})</div></div>`;
  }
  if(s1&&s2){
    // Inclusive — count both start and end day
    const days = Math.round(Math.abs(s2-s1)/86400000) + 1;
    // Count Sat/Sun in inclusive range
    const earlier = s1 <= s2 ? s1 : s2;
    const later   = s1 <= s2 ? s2 : s1;
    let sats=0, suns=0;
    const cur = new Date(earlier);
    while(cur <= later) {
      const d = cur.getDay();
      if(d===6) sats++;
      if(d===0) suns++;
      cur.setDate(cur.getDate()+1);
    }
    const weekendDays = sats+suns;
    const weekdays = days - weekendDays;
    const el=document.getElementById('dateDiffResult');
    if(el)el.innerHTML=resultGrid([
      ['Total days (inclusive)', days,'','var(--accent)'],
      ['Weeks + extra days', Math.floor((days)/7)+'w + '+(days%7)+'d',''],
      ['Approx months', fmtN(days/30.44,1),''],
      ['Saturdays', sats,'','var(--warn)'],
      ['Sundays', suns,'','var(--warn)'],
      ['Weekend days total', weekendDays,' (potential lieu days)','var(--warn)'],
      ['Weekdays', weekdays,'']
    ]);
  }
}

function initCalendar(){calState.selectedDate=new Date();calState.selectedDate.setHours(0,0,0,0);renderCalendar();}

// ══════════════════════════════════════════════════════════
// MOTOR DATA TABLE
// ══════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════
// MOTOR DATA TABLE
// ══════════════════════════════════════════════════════════

// IEC 60092-352 Table B.4 — 90°C rated conductor, 45°C ambient
// [csa, single_core, two_core, three_or_four_core]  (AC values for 400/500mm²)
const IEC60092_352_B4 = [
  [1.5,  23,  20,  16],
  [2.5,  40,  26,  21],
  [4,    51,  34,  28],
  [6,    52,  44,  36],
  [10,   72,  61,  50],
  [16,   96,  82,  67],
  [25,  127, 108,  89],
  [35,  157, 133, 110],
  [50,  196, 167, 137],
  [70,  242, 206, 169],
  [95,  293, 249, 205],
  [120, 339, 288, 237],
  [150, 389, 331, 272],
  [185, 444, 377, 311],
  [240, 522, 444, 365],
  [300, 601, 511, 421],
  [400, 670, 570, 469],
  [500, 720, 612, 504],
];

// Return {csa, ampacity} for minimum CSA whose derated ampacity >= required current
// coreCol: 1=single, 2=two-core, 3=three/four-core
function csaLookup(current, coreCol, derating) {
  const needed = current / derating;
  const row = IEC60092_352_B4.find(r => r[coreCol] >= needed);
  if (!row) return { csa: '>500 mm²', ampacity: '—' };
  const ratedAmp = row[coreCol];
  const deratedAmp = Math.round(ratedAmp * derating);
  return {
    csa: row[0] + ' mm²',
    ampacity: derating < 1 ? `${deratedAmp} (${ratedAmp})` : `${ratedAmp}`
  };
}

let mtShowRPM = false;
let mtHz      = 50;
let mtIE      = 'IE3';
let mtCores   = 3;    // 1=single, 2=two-core, 3=three/four-core
let mtBunch   = 1.0;  // derating factor

function htmlMotorTable() {
  const voltOpts = [
    ['380','380 V'],['400','400 V'],['415','415 V'],['440','440 V'],
    ['460','460 V'],['480','480 V'],['600','600 V'],['690','690 V'],
    ['3300','3.3 kV'],['6600','6.6 kV'],['11000','11 kV']
  ].map(([v,l])=>`<option value="${v}"${v==='400'?' selected':''}>${l}</option>`).join('');

  return `
  <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-bottom:16px">
    <div class="field" style="margin:0;flex:0 0 auto">
      <label>Voltage</label>
      <select id="mt_volt" onchange="renderMotorTable()">${voltOpts}</select>
    </div>
    <div class="field" style="margin:0;flex:0 0 auto">
      <label>Frequency</label>
      <div class="flex-wrap">
        <button class="btn active" id="mt_hz50" onclick="mtSetHz(50)">50 Hz</button>
        <button class="btn" id="mt_hz60" onclick="mtSetHz(60)">60 Hz</button>
      </div>
    </div>
    <div class="field" style="margin:0;flex:0 0 auto">
      <label>IE Class</label>
      <div class="flex-wrap">
        <button class="btn" id="mt_ie2" onclick="mtSetIE('IE2')">IE2</button>
        <button class="btn active" id="mt_ie3" onclick="mtSetIE('IE3')">IE3</button>
        <button class="btn" id="mt_ie4" onclick="mtSetIE('IE4')">IE4</button>
      </div>
    </div>
    <div class="field" style="margin:0;flex:0 0 auto">
      <label>Starting Method</label>
      <select id="mt_start" onchange="renderMotorTable()">
        <option value="dol">DOL (×7)</option>
        <option value="sd">Star-Delta (×7÷3)</option>
        <option value="ss">Soft Starter (×3)</option>
        <option value="vfd">VFD (×1.5)</option>
      </select>
    </div>
    <div class="field" style="margin:0;flex:0 0 auto">
      <label>Cable Cores</label>
      <div class="flex-wrap">
        <button class="btn" id="mt_c1" onclick="mtSetCores(1)">Single core</button>
        <button class="btn" id="mt_c2" onclick="mtSetCores(2)">2 core</button>
        <button class="btn active" id="mt_c3" onclick="mtSetCores(3)">3 or 4 core</button>
      </div>
    </div>
    <div class="field" style="margin:0;flex:0 0 auto">
      <label>Cable Bunching</label>
      <div class="flex-wrap">
        <button class="btn active" id="mt_b1" onclick="mtSetBunch(1.0)">≤6 cables</button>
        <button class="btn" id="mt_b2" onclick="mtSetBunch(0.85)">&gt;6 cables (×0.85)</button>
      </div>
    </div>
    <div class="field" id="mt_factor_row" style="margin:0;flex:0 0 auto;display:none">
      <label>60 Hz power factor <span style="color:var(--text2);font-weight:400;font-size:0.75rem">(×IEC kW rating)</span></label>
      <input type="number" id="mt_60hz_factor" value="1.15" step="0.01" min="0.5" max="2" style="width:80px" oninput="renderMotorTable()">
    </div>
    <div class="field" style="margin:0;flex:0 0 auto">
      <label>RPM columns</label>
      <button class="btn" id="mt_rpm_toggle" onclick="mtToggleRPM()">Show RPM</button>
    </div>
  </div>

  <div id="mt_60hz_note" style="display:none;margin-bottom:12px;padding:8px 12px;background:var(--warn-bg,#3a2e00);border-left:3px solid var(--warn);border-radius:4px;font-size:0.77rem;color:var(--warn);line-height:1.6">
    ⚠️ 60 Hz mode: kW column shows effective output (IEC frame rating × factor). IEC frame column shows the original 50 Hz nameplate rating. Factor &gt;1 = uprate, &lt;1 = derate. Voltage auto-set to 460 V — adjust if needed. Always confirm with manufacturer.
  </div>

  <div style="overflow-x:auto">
    <table id="motorTable" class="motor-table">
      <thead id="motorTableHead"></thead>
      <tbody id="motorTableBody"></tbody>
    </table>
  </div>
  <div id="mt_disclaimer" style="margin-top:10px;font-size:0.75rem;color:var(--text2);line-height:1.7"></div>`;
}

function mtSetCores(c) {
  mtCores = c;
  [1,2,3].forEach(n => document.getElementById('mt_c'+n)?.classList.toggle('active', n===c));
  renderMotorTable();
}

function mtSetBunch(f) {
  mtBunch = f;
  document.getElementById('mt_b1')?.classList.toggle('active', f===1.0);
  document.getElementById('mt_b2')?.classList.toggle('active', f===0.85);
  renderMotorTable();
}

function mtSetHz(hz) {
  mtHz = hz;
  document.getElementById('mt_hz50')?.classList.toggle('active', hz===50);
  document.getElementById('mt_hz60')?.classList.toggle('active', hz===60);
  const factRow = document.getElementById('mt_factor_row');
  const note    = document.getElementById('mt_60hz_note');
  if (factRow) factRow.style.display = hz===60 ? 'block' : 'none';
  if (note)    note.style.display    = hz===60 ? 'block' : 'none';
  const voltSel = document.getElementById('mt_volt');
  if (voltSel) {
    if (hz===60 && ['380','400','415'].includes(voltSel.value)) voltSel.value = '460';
    if (hz===50 && ['460','480'].includes(voltSel.value))       voltSel.value = '400';
  }
  renderMotorTable();
}

function mtSetIE(ie) {
  mtIE = ie;
  ['IE2','IE3','IE4'].forEach(c => document.getElementById('mt_ie'+c.toLowerCase())?.classList.toggle('active', c===ie));
  renderMotorTable();
}

function mtToggleRPM() {
  mtShowRPM = !mtShowRPM;
  const btn = document.getElementById('mt_rpm_toggle');
  if (btn) { btn.textContent = mtShowRPM ? '✅ RPM shown' : 'Show RPM'; btn.classList.toggle('active', mtShowRPM); }
  renderMotorTable();
}

function renderMotorTable() {
  const volt     = parseFloat(document.getElementById('mt_volt')?.value || 400);
  const start    = document.getElementById('mt_start')?.value || 'dol';
  const factor60 = mtHz===60 ? parseFloat(document.getElementById('mt_60hz_factor')?.value || 1.15) : 1;
  const thead    = document.getElementById('motorTableHead');
  const tbody    = document.getElementById('motorTableBody');
  const disc     = document.getElementById('mt_disclaimer');
  if (!thead || !tbody) return;

  const startLabel = {dol:'DOL Istart (A)',sd:'Star-Delta Istart (A)',ss:'Soft Starter Istart (A)',vfd:'VFD Istart (A)'}[start];
  const startMult  = {dol:7, sd:7/3, ss:3, vfd:1.5}[start];
  const syncSpeeds = mtHz===50
    ? {2:3000,4:1500,6:1000,8:750}
    : {2:3600,4:1800,6:1200,8:900};
  const slip = 0.965;
  const coreLabel = {1:'Single core',2:'2 core',3:'3 or 4 core'}[mtCores];
  const csaHeader = `CSA — ${coreLabel}${mtBunch<1?' ×'+mtBunch:''}`;
  const ampHeader = `Cable Ampacity (A)${mtBunch<1?' derated':''}`;

  let hCols = mtHz===60
    ? ['IEC Frame (kW)','60 Hz kW','HP',`FLC (A) @ ${volt}V`,startLabel,'Fuse (A)',csaHeader,ampHeader]
    : ['kW','HP',`FLC (A) @ ${volt}V`,startLabel,'Fuse (A)',csaHeader,ampHeader];
  if (mtShowRPM) hCols = hCols.concat(['2-pole','4-pole','6-pole','8-pole'].map(p=>`${p} RPM`));
  thead.innerHTML = `<tr>${hCols.map(c=>`<th>${c}</th>`).join('')}</tr>`;

  const flcColIdx = mtHz===60 ? 3 : 2;
  const ratings = IEC_KW.filter(k => k <= 315);

  tbody.innerHTML = ratings.map(iecKw => {
    const effKw  = iecKw * factor60;
    const hp     = (effKw / 0.7457).toFixed(1);
    const {eff, pf} = flaLookup(iecKw, mtIE);
    const flc    = (effKw * 1000) / (Math.sqrt(3) * volt * pf * eff);
    const istart = flc * startMult;
    const fuse   = FUSE_SIZES.find(s => s >= flc * 1.25) || Math.ceil(flc * 1.25);
    const {csa, ampacity} = csaLookup(flc, mtCores, mtBunch);

    // Headroom colour — how close is FLC to cable ampacity
    const ampNum = parseFloat(ampacity);
    const headroom = isNaN(ampNum) ? null : (ampNum - flc) / ampNum;
    const ampColor = headroom === null ? '' : headroom < 0.05 ? ' style="color:var(--warn)"' : '';

    let cols = mtHz===60
      ? [iecKw, fmtN(effKw,2), hp, fmtN(flc,1), fmtN(istart,1), fuse, csa, {val:ampacity, color:ampColor}]
      : [iecKw, hp, fmtN(flc,1), fmtN(istart,1), fuse, csa, {val:ampacity, color:ampColor}];

    if (mtShowRPM) cols = cols.concat([2,4,6,8].map(p => Math.round(syncSpeeds[p]*slip)));

    const rowClass = iecKw >= 75 ? 'mt-row-large' : iecKw >= 11 ? 'mt-row-mid' : '';
    return `<tr class="${rowClass}">${cols.map((c,i) => {
      const isFlc = i === flcColIdx;
      if (c && typeof c === 'object') return `<td${c.color}>${c.val}</td>`;
      return `<td${isFlc?' style="color:var(--accent);font-weight:600"':''}>${c}</td>`;
    }).join('')}</tr>`;
  }).join('');

  // Dynamic disclaimer
  const bunchNote = mtBunch < 1
    ? `, ×${mtBunch} derating applied for &gt;6 cables bunched`
    : ', bunched up to 6 cables (no derating)';
  if (disc) disc.innerHTML = `Cable CSA basis: IEC 60092-352 Table B.4 — ${coreLabel}, 90°C rated conductor, 45°C ambient${bunchNote}. FLC from IEC 60034-30-1 typical ${mtIE} values. No additional derating applied. Always verify on motor nameplate and size to project specification.`;
}

// ══════════════════════════════════════════════════════════
// VOLUME SHAPES CALCULATOR
// ══════════════════════════════════════════════════════════
function htmlVolShapes() {
  return `
  <div class="field"><label>Shape</label>
    <select id="vol_shape" onchange="calcVolShapes()">
      <option value="cuboid">Cuboid / Rectangular Prism</option>
      <option value="cube">Cube</option>
      <option value="cylinder">Cylinder</option>
      <option value="cone">Cone</option>
      <option value="sphere">Sphere</option>
    </select>
  </div>
  <div class="field"><label>Unit</label>
    <select id="vol_unit" onchange="calcVolShapes()">
      <option value="mm">mm</option>
      <option value="cm" selected>cm</option>
      <option value="m">m</option>
    </select>
  </div>
  <div id="vol_inputs" style="margin-top:8px"></div>
  <div id="volResult" style="margin-top:12px"></div>`;
}

function calcVolShapes() {
  const shape = document.getElementById('vol_shape')?.value;
  const unit  = document.getElementById('vol_unit')?.value;
  const inp   = document.getElementById('vol_inputs');
  const r     = document.getElementById('volResult');
  if (!inp || !r || !shape) return;

  // Render inputs for shape
  const fields = {
    cuboid:   [['Length (L)','vs_l'],['Width (W)','vs_w'],['Height (H)','vs_h']],
    cube:     [['Side (a)','vs_a']],
    cylinder: [['Diameter (d)','vs_d'],['Height (H)','vs_h']],
    cone:     [['Diameter (d)','vs_d'],['Height (H)','vs_h']],
    sphere:   [['Diameter (d)','vs_d']],
  };
  inp.innerHTML = fields[shape].map(([lbl,id]) =>
    `<div class="field"><label>${lbl} (${unit})</label><input type="number" id="${id}" value="100" min="0" oninput="calcVolShapes()"></div>`
  ).join('');

  const g = id => parseFloat(document.getElementById(id)?.value) || 0;
  let vol_unit3 = 0, formula = '';
  switch(shape) {
    case 'cuboid':  { const l=g('vs_l'),w=g('vs_w'),h=g('vs_h'); vol_unit3=l*w*h; formula=`L×W×H = ${l}×${w}×${h}`; break; }
    case 'cube':    { const a=g('vs_a'); vol_unit3=a**3; formula=`a³ = ${a}³`; break; }
    case 'cylinder':{ const d=g('vs_d'),h=g('vs_h'),r2=d/2; vol_unit3=Math.PI*r2*r2*h; formula=`π×(d/2)²×H`; break; }
    case 'cone':    { const d=g('vs_d'),h=g('vs_h'),r2=d/2; vol_unit3=(1/3)*Math.PI*r2*r2*h; formula=`(1/3)×π×(d/2)²×H`; break; }
    case 'sphere':  { const d=g('vs_d'),r2=d/2; vol_unit3=(4/3)*Math.PI*r2**3; formula=`(4/3)×π×(d/2)³`; break; }
  }
  // Convert to m³ then to other units
  const toM3 = unit==='mm' ? 1e-9 : unit==='cm' ? 1e-6 : 1;
  const m3 = vol_unit3 * toM3;
  r.innerHTML = resultGrid([
    ['Volume', fmtN(vol_unit3,4), unit+'³', 'var(--accent)'],
    ['m³', fmtN(m3,6), ''],
    ['Litres', fmtN(m3*1000,4), 'L'],
    ['US Gallons', fmtN(m3*264.172,4), 'gal'],
    ['Formula', formula, ''],
  ]);
}

// ══════════════════════════════════════════════════════════
// BMI CALCULATOR
// ══════════════════════════════════════════════════════════
function htmlBMI() {
  return `
  <div class="field"><label>Height</label>
    <div class="flex-row" style="gap:6px">
      <input type="number" id="bmi_h" value="180" min="50" max="300" oninput="calcBMI()" style="flex:1">
      <select id="bmi_hunit" onchange="calcBMI()" style="flex:0 0 auto">
        <option value="cm" selected>cm</option>
        <option value="ft">ft+in</option>
      </select>
    </div>
    <input type="number" id="bmi_hin" placeholder="inches part" style="display:none;margin-top:6px" oninput="calcBMI()">
  </div>
  <div class="field"><label>Weight</label>
    <div class="flex-row" style="gap:6px">
      <input type="number" id="bmi_w" value="80" min="20" max="500" oninput="calcBMI()" style="flex:1">
      <select id="bmi_wunit" onchange="calcBMI()" style="flex:0 0 auto">
        <option value="kg" selected>kg</option>
        <option value="lb">lb</option>
      </select>
    </div>
  </div>
  <div id="bmiResult" style="margin-top:12px"></div>
  ${formulaNote('BMI = weight(kg) / height(m)² | WHO classification')}`;
}

function calcBMI() {
  const hunit = document.getElementById('bmi_hunit')?.value;
  const wunit = document.getElementById('bmi_wunit')?.value;
  const hinEl = document.getElementById('bmi_hin');
  if (hinEl) hinEl.style.display = hunit==='ft' ? 'block' : 'none';

  let hm;
  if (hunit==='cm') {
    hm = (parseFloat(document.getElementById('bmi_h')?.value)||0) / 100;
  } else {
    const ft = parseFloat(document.getElementById('bmi_h')?.value)||0;
    const inc = parseFloat(document.getElementById('bmi_hin')?.value)||0;
    hm = (ft*12 + inc) * 0.0254;
  }
  let wkg = parseFloat(document.getElementById('bmi_w')?.value)||0;
  if (wunit==='lb') wkg = wkg * 0.453592;

  const r = document.getElementById('bmiResult'); if(!r) return;
  if (hm<=0||wkg<=0) { r.innerHTML=''; return; }
  const bmi = wkg / (hm*hm);
  let cat, col;
  if      (bmi < 18.5) { cat='Underweight';  col='var(--accent)'; }
  else if (bmi < 25)   { cat='Normal weight'; col='var(--success)'; }
  else if (bmi < 30)   { cat='Overweight';    col='var(--warn)'; }
  else                 { cat='Obese';          col='var(--danger)'; }
  r.innerHTML = resultGrid([
    ['BMI', fmtN(bmi,1), 'kg/m²', col],
    ['Classification', cat, '', col],
    ['Height used', fmtN(hm*100,1), 'cm'],
    ['Weight used', fmtN(wkg,1), 'kg'],
  ]);
}
