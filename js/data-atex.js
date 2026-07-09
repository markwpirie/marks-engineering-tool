// ══════════════════════════════════════════════════════════
// ATEX DATA — Full IEC 60079 coverage
// ══════════════════════════════════════════════════════════
const ATEX_DB = {
  group: {
    I: 'Group I — Mining (methane/coal dust)',
    II: 'Group II — Surface industries (non-mining)'
  },
  cat: {
    1: 'Category 1 — Very high protection (Zone 0/20, EPL Ga/Da)',
    2: 'Category 2 — High protection (Zone 1/21, EPL Gb/Db)',
    3: 'Category 3 — Normal protection (Zone 2/22, EPL Gc/Dc)'
  },
  env: {
    G: 'Gas/Vapour/Mist environment',
    D: 'Dust environment',
    GD: 'Gas and Dust environment'
  },
  prot: {
    d:   'Ex d — Flameproof enclosure (contains internal explosion)',
    e:   'Ex e — Increased safety (extra measures prevent ignition)',
    ia:  'Ex ia — Intrinsic safety level ia (safe with 2 faults)',
    ib:  'Ex ib — Intrinsic safety level ib (safe with 1 fault)',
    ic:  'Ex ic — Intrinsic safety level ic (safe under normal conditions)',
    ma:  'Ex ma — Encapsulation level ma (Category 1, Zone 0)',
    mb:  'Ex mb — Encapsulation level mb (Category 2, Zone 1)',
    mc:  'Ex mc — Encapsulation level mc (Zone 2)',
    nA:  'Ex nA — Non-sparking (Zone 2/Category 3 only)',
    nR:  'Ex nR — Restricted breathing (Zone 2)',
    nC:  'Ex nC — Sealed or hermetically sealed device (Zone 2)',
    nL:  'Ex nL — Energy limited (Zone 2)',
    px:  'Ex px — Pressurisation type px (reduces Zone 1 to non-hazardous)',
    py:  'Ex py — Pressurisation type py (maintains Zone 1)',
    pz:  'Ex pz — Pressurisation type pz (reduces Zone 2 to non-hazardous)',
    o:   'Ex o — Oil immersion (submerged in oil)',
    q:   'Ex q — Powder/sand filling (quartz sand filling)',
    t:   'Ex t — Protection by enclosure (dust, replaces older Ex tD)',
    h:   'Ex h — Special/miscellaneous protection (per IEC 60079-33)',
    s:   'Ex s — Special protection (older standard, site-specific)',
    op_is: 'Ex op is — Optical radiation intrinsically safe',
    op_pr: 'Ex op pr — Optical radiation with pressurisation',
    op_sh: 'Ex op sh — Optical radiation with protected optical system'
  },
  gasgrp: {
    I:    'Group I — Mining (methane/firedamp)',
    IIA:  'Group IIA — Propane/similar (min. ignition energy ~180 μJ)',
    IIB:  'Group IIB — Ethylene/similar (min. ignition energy ~60 μJ)',
    IIC:  'Group IIC — Hydrogen/Acetylene (min. ignition energy ~17 μJ — most ignitable)',
    IIIA: 'Group IIIA — Combustible flyings (fibres/lint)',
    IIIB: 'Group IIIB — Non-conductive dust',
    IIIC: 'Group IIIC — Conductive dust (most hazardous)'
  },
  temp: {
    T1: 'T1 — Max surface temperature 450°C',
    T2: 'T2 — Max surface temperature 300°C',
    T3: 'T3 — Max surface temperature 200°C',
    T4: 'T4 — Max surface temperature 135°C',
    T5: 'T5 — Max surface temperature 100°C',
    T6: 'T6 — Max surface temperature 85°C'
  },
  epl: {
    Ga: 'EPL Ga — Gas, highest protection (Zone 0 capable)',
    Gb: 'EPL Gb — Gas, high protection (Zone 1 capable)',
    Gc: 'EPL Gc — Gas, normal protection (Zone 2 capable)',
    Da: 'EPL Da — Dust, highest protection (Zone 20 capable)',
    Db: 'EPL Db — Dust, high protection (Zone 21 capable)',
    Dc: 'EPL Dc — Dust, normal protection (Zone 22 capable)',
    Ma: 'EPL Ma — Mining, highest protection (Zone 0 capable)',
    Mb: 'EPL Mb — Mining, high protection (Zone 1 capable)'
  }
};

// Zone/EPL compatibility matrix
const ZONE_MATRIX = [
  { zone:'Zone 0',  type:'Gas',  epl:'Ga', cats:['1'],   desc:'Explosive gas atmosphere continuously present' },
  { zone:'Zone 1',  type:'Gas',  epl:'Gb', cats:['1','2'], desc:'Explosive gas atmosphere likely under normal operation' },
  { zone:'Zone 2',  type:'Gas',  epl:'Gc', cats:['1','2','3'], desc:'Explosive gas atmosphere unlikely/short duration' },
  { zone:'Zone 20', type:'Dust', epl:'Da', cats:['1'],   desc:'Combustible dust cloud continuously present' },
  { zone:'Zone 21', type:'Dust', epl:'Db', cats:['1','2'], desc:'Combustible dust cloud likely under normal operation' },
  { zone:'Zone 22', type:'Dust', epl:'Dc', cats:['1','2','3'], desc:'Combustible dust cloud unlikely/short duration' },
  { zone:'Zone M1', type:'Mine', epl:'Ma', cats:['M1'],  desc:'Mining: explosive atmosphere continuously present' },
  { zone:'Zone M2', type:'Mine', epl:'Mb', cats:['M1','M2'], desc:'Mining: explosive atmosphere likely' },
];
