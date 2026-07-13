// ══════════════════════════════════════════════════════════
// IS LOOP DATA — Barrier/Isolator & Field Instrument preset library
// ══════════════════════════════════════════════════════════
// Transcribed from two previous projects' IS loop calc registers:
//   UKOP-263-F99-0001-00-00a (IS Loop Calculations).xlsx — 6 loops, sheets '1'-'6'
//   EHP-195-F99-0001-00-01 (IS Loop Calculations).xlsx   — 5 loops, sheets '1'-'5'
// Entity parameters (Uo/Io/Po/Co/Lo, Ui/Ii/Pi/Ci/Li) are exactly as recorded
// in those documents. These are convenience presets for populating the IS
// Loop tab quickly — always re-verify against the actual equipment's
// current certificate before relying on this for a new project; a
// certificate can be revised or an item substituted.
//
// co/lo/ci/li units below match the source document's own units (µF/mH)
// so the preset can just set the unit selects directly — no conversion.
//
// Known source-data caveats, carried through rather than silently resolved:
//  - ui/ii of `null` means the source certificate stated no limit for that
//    parameter (not zero, not "simple apparatus" — the device's other
//    parameters were still checked normally). The preset leaves that field
//    blank rather than inventing a number; treat it as non-restricting only
//    after confirming against the certificate quoted in `cert`.
//  - EHP-195 had recorded certificate "Nemko 04ATEX1233X" against both the
//    P+F NJ2-V3-N proximity sensor and the Drexel Brook PMT0-2015-AXBZ — a
//    copy-paste error in the source spreadsheet, since one cert can't cover
//    two different manufacturers. Confirmed against the actual EC-Type
//    Examination Certificate (2026-07): it belongs to AMETEK Drexelbrook's
//    "ThePoint" Two-wire PXTX 2 Series Level Control, not the P+F sensor —
//    the mistaken P+F entry has been dropped from this library. Note the
//    certificate's own equipment description ("ThePoint...PXTX 2 Series")
//    doesn't exactly match the model code recorded in the spreadsheet
//    (PMT0-2015-AXBZ) — likely an alternate/legacy part number for the same
//    product line, but worth a glance at the cert yourself if it matters.

const IS_BARRIER_PRESETS = [
  {
    id: 'pf_fb1209b3',
    mfr: 'Pepperell and Fuchs', model: 'FB1209B3',
    cert: 'PRESAFE 19 ATEX 14055 U', marking: 'II 2(1) G Ex db eb q [ia Ga]', gasGroup: 'IIC',
    uo: 10, io: 13, po: 0.033, co: 3, coUnit: 'uF', lo: 100, loUnit: 'mH',
  },
  {
    id: 'pf_fb7204b3',
    mfr: 'Pepperell and Fuchs', model: 'FB7204B3',
    cert: 'PRESAFE 19 ATEX 14057 U', marking: 'II 2(1) G Ex db eb q [ia Ga]', gasGroup: 'IIC',
    uo: 27, io: 87, po: 0.575, co: 0.09, coUnit: 'uF', lo: 4.6, loUnit: 'mH',
  },
  {
    id: 'pf_kfd2_stc5_ex2',
    mfr: 'Pepperell and Fuchs', model: 'KFD2-STC5-Ex2',
    cert: 'CML 17 ATEX 2031X', marking: 'II (1) G Ex [ia Ga] IIC', gasGroup: 'IIC',
    uo: 26.2, io: 93, po: 0.634, co: 0.092, coUnit: 'uF', lo: 4.11, loUnit: 'mH',
  },
  {
    id: 'siemens_6es7_321',
    mfr: 'Siemens', model: '6ES7 321-7RD00-0AB0',
    cert: 'KEMA 01 ATEX 1057 X', marking: 'II 3 G (2) GD Ex nA [ib Gb] [ib IIIC Db] IIC T4 Gc', gasGroup: 'IIC',
    uo: 10, io: 14.1, po: 0.0337, co: 3, coUnit: 'uF', lo: 100, loUnit: 'mH',
  },
  {
    id: 'siemens_6es7_331',
    mfr: 'Siemens', model: '6ES7 331-7RD00-0AB0',
    cert: 'KEMA 01 ATEX 1060 X', marking: 'II 3 G (2) GD Ex nA [ib Gb] [ib IIIC Db] IIC T4 Gc', gasGroup: 'IIC',
    uo: 25.2, io: 68.5, po: 0.431, co: 0.09, coUnit: 'uF', lo: 7.5, loUnit: 'mH',
  },
  {
    id: 'bizerba_stex0_00001_barrier',
    mfr: 'Bizerba GmbH', model: 'STEX0/00001*',
    cert: 'EX5 01 10 38033 013', marking: 'II 2 G EEx ib m IIB T4 / II 2 D, T 100°C', gasGroup: 'IIB',
    uo: 7.8, io: 120, po: 0.936, co: 1, coUnit: 'uF', lo: 0.5, loUnit: 'mH',
  },
];

const IS_INSTRUMENT_PRESETS = [
  {
    id: 'pf_nj2_v3_n',
    mfr: 'Pepperell and Fuchs', model: 'NJ2-V3-N', desc: 'Proximity sensor',
    cert: 'PTB 00ATEX2032 X', marking: 'Ex ia IIC T6',
    ui: 16, ii: 25, pi: 0.034, ci: 0.04, ciUnit: 'uF', li: 0.05, liUnit: 'mH',
  },
  {
    id: 'vega_vegabar82_flange',
    mfr: 'VEGA', model: 'VEGABAR 82 (2" Flange)', desc: 'Pressure transmitter',
    cert: 'TUV 13 ATEX 131115 X', marking: 'II 1 G Ex ia IIC T6...T1 Ga',
    ui: 30, ii: 131, pi: 0.983, ci: 0, ciUnit: 'uF', li: 0.005, liUnit: 'mH',
  },
  {
    id: 'vega_vegabar82_thread',
    mfr: 'VEGA', model: 'VEGABAR 82 (G¾ Thread)', desc: 'Pressure transmitter',
    cert: 'TUV 13 ATEX 131115 X', marking: 'II 1 G Ex ia IIC T6...T1 Ga',
    ui: 30, ii: 131, pi: 0.983, ci: 0, ciUnit: 'uF', li: 0.005, liUnit: 'mH',
  },
  {
    id: 'vega_vegapuls6x',
    mfr: 'VEGA', model: 'Vegapuls 6X', desc: 'Level transmitter (radar)',
    cert: 'CSANe 22 ATEX 1019X', marking: 'II 1/2 G Ex ia IIC T6...T1 Ga/Gb',
    ui: 30, ii: 131, pi: 0.983, ci: 0, ciUnit: 'uF', li: 0, liUnit: 'mH',
  },
  {
    id: 'vega_vegaswing63',
    mfr: 'VEGA', model: 'Vegaswing 63', desc: 'Level switch (vibrating fork)',
    cert: 'PTB 00 ATEX 2216 X', marking: 'II 1/2 G Ex ia IIC T6...T1 Ga/Gb',
    ui: 29, ii: 116, pi: 0.841, ci: 0, ciUnit: 'uF', li: 0, liUnit: 'mH',
  },
  {
    id: 'drexelbrook_pmt0',
    mfr: 'Ametek Drexelbrook', model: 'PMT0-21ZZ-NN', desc: 'Level switch (RF admittance)',
    cert: 'FM 16 ATEX 0023X', marking: 'II 1 GD Ex ia IIC T5',
    ui: 30, ii: 140, pi: 1, ci: 0, ciUnit: 'uF', li: 0.159, liUnit: 'mH',
  },
  {
    id: 'drexelbrook_pmt0_2015',
    mfr: 'AMETEK Drexelbrook', model: 'PMT0-2015-AXBZ', desc: 'Level switch (RF admittance) — "ThePoint" two-wire PXTX 2 Series',
    cert: 'Nemko 04ATEX1233X', marking: 'II 1/2/3 GD Ex ia IIC T5...T2',
    ui: 30, ii: 140, pi: 1, ci: 0, ciUnit: 'uF', li: 0.159, liUnit: 'mH',
  },
  {
    id: 'vega_vegabar82_acc9',
    mfr: 'VEGA', model: 'VEGABAR 82 (B82.ACC9SAGWEHXKIMXX)', desc: 'Pressure transmitter',
    cert: 'TUV 13 ATEX 131115 X', marking: 'II 1 G / II 1/2 G / II 2 G Ex ia IIC T6...T1 Ga/Gb/Gb',
    ui: 30, ii: 131, pi: 0.983, ci: 0, ciUnit: 'uF', li: 0.005, liUnit: 'mH',
  },
  {
    id: 'applied_weighing_aw315',
    mfr: 'Applied Weighing', model: 'AW315/3000X', desc: 'Load cell',
    cert: 'BAS 99 ATEX 2067', marking: 'II 1 GD Ex ia IIC T6 Ga (-35°C ≤ Ta < +60°C)',
    ui: null, ii: 1000, pi: 1.2, ci: 0, ciUnit: 'uF', li: 0, liUnit: 'mH',
    note: 'No Ui limit stated on this certificate — Ui left blank; confirm whether a limit applies before treating voltage as non-restricting.',
  },
  {
    id: 'bizerba_stex0_00001_instrument',
    mfr: 'Bizerba GmbH', model: 'STEX0/00001', desc: 'Weighing terminal analogue output card',
    cert: 'EX5 01 10 38033 013', marking: 'II 2 G EEx ib m IIB T4 / II 2 D, T 100°C',
    ui: 30, ii: null, pi: 1.1, ci: 0.012, ciUnit: 'uF', li: 0, liUnit: 'mH',
    note: 'No Ii limit stated on this certificate — Ii left blank; confirm whether a limit applies before treating current as non-restricting.',
  },
];
