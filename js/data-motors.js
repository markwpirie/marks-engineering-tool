// ══════════════════════════════════════════════════════════
// MOTOR DATA — shared by the Calcs tab (Motor FLA / Motor Table) and the Wonder Tool.
// Previously this lived in tab-calcs.js and tab-wonder.js relied on script load order to see
// it as an implicit global — moved here so the dependency is explicit and there is exactly one
// copy of the ratings tables and the FLA formula.
// ══════════════════════════════════════════════════════════

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

// Standard 3-phase FLA: I = P(W) / (√3 × V × PF × η). Used by both the Motor FLA calculator
// and the Wonder Tool so a correction to the formula only needs to be made once.
function computeFLA(kw, volt, pf, eff) {
  return (kw*1000) / (Math.sqrt(3) * volt * pf * eff);
}
