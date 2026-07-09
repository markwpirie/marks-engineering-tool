// ══════════════════════════════════════════════════════════
// TAB — NPT REFERENCE
// ══════════════════════════════════════════════════════════

// NPT sizes in explicit smallest-to-largest order
const NPT_SIZES_ORDERED = ['1/8','1/4','3/8','1/2','3/4','1','1-1/4','1-1/2','2','2-1/2','3'];

const NPT_DATA = {
  '1/8':  { threadOD:9.49,  tpi:27,   pitch:0.941, bore:6.35,  metric:'M10', hawkeEntry:'—', adapters:['M10 certified adapter'] },
  '1/4':  { threadOD:13.16, tpi:18,   pitch:1.411, bore:9.53,  metric:'M16', hawkeEntry:'—', adapters:['M16 certified adapter'] },
  '3/8':  { threadOD:16.66, tpi:18,   pitch:1.411, bore:12.7,  metric:'M16', hawkeEntry:'—', adapters:['M16 certified adapter'] },
  '1/2':  { threadOD:21.34, tpi:14,   pitch:1.814, bore:15.88, metric:'M20', hawkeEntry:'Os/O (M20)', adapters:['M20 certified adapter (e.g. Eaton Redapt ½" NPT→M20)'] },
  '3/4':  { threadOD:26.67, tpi:14,   pitch:1.814, bore:19.05, metric:'M25', hawkeEntry:'A/B (M20/M25)', adapters:['M25 certified adapter (e.g. Eaton Redapt ¾" NPT→M25, bore 19.00mm)'] },
  '1':    { threadOD:33.40, tpi:11.5, pitch:2.209, bore:25.4,  metric:'M32', hawkeEntry:'B/C (M25/M32)', adapters:['M32 certified adapter (e.g. Eaton Redapt 1" NPT→M32)'] },
  '1-1/4':{ threadOD:42.16, tpi:11.5, pitch:2.209, bore:31.75, metric:'M40', hawkeEntry:'C/C2 (M32/M40)', adapters:['M40 certified adapter'] },
  '1-1/2':{ threadOD:48.26, tpi:11.5, pitch:2.209, bore:38.10, metric:'M50', hawkeEntry:'C2/D (M40/M50)', adapters:['M50 certified adapter'] },
  '2':    { threadOD:60.33, tpi:11.5, pitch:2.209, bore:50.80, metric:'M63', hawkeEntry:'D/E (M50/M63)', adapters:['M63 certified adapter'] },
  '2-1/2':{ threadOD:72.70, tpi:8,    pitch:3.175, bore:63.50, metric:'M75', hawkeEntry:'E/F (M63/M75)', adapters:['M75 certified adapter'] },
  '3':    { threadOD:88.90, tpi:8,    pitch:3.175, bore:76.20, metric:'M80', hawkeEntry:'F/G (M75/M80)', adapters:['M80 certified adapter'] },
};

const ADAPTER_DATA = {
  '1/2':  { metric:'M20', bore:'~15.9 mm', glands:'Os, O (421) | Os, O (453U) | Os, O (653U)', note:'½" NPT → M20 adapter — verify IP and Ex cert' },
  '3/4':  { metric:'M25', bore:'19.00 mm (Eaton Redapt)', glands:'A, B (421) | A (453U) | A (653U)', note:'¾" NPT → M25 adapter — Eaton Redapt is a common certified option. Bore = 19.00 mm (not ¾" = 19.05 mm!). Always use catalogue figure.' },
  '1':    { metric:'M32', bore:'~25.4 mm', glands:'B, C (421) | B (453U) | B (653U)', note:'1" NPT → M32 adapter — verify ATEX/IECEx cert' },
  '1-1/4':{ metric:'M40', bore:'~31.8 mm', glands:'C, C2 (421) | C (453U) | C (653U)', note:'1¼" NPT → M40 — verify ATEX/IECEx cert' },
  '1-1/2':{ metric:'M50', bore:'~38.1 mm', glands:'C2, D (421) | C2 (453U) | C2 (653U)', note:'1½" NPT → M50 — verify ATEX/IECEx cert' },
  '2':    { metric:'M63', bore:'~50.8 mm', glands:'D, E (421) | D (453U) | D (653U)', note:'2" NPT → M63 — verify ATEX/IECEx cert' },
};

function showNPTInfo() {
  const size = document.getElementById('nptSelect').value;
  const d = NPT_DATA[size];
  if (!d) return;
  document.getElementById('nptInfo').innerHTML = `
    <div class="npt-info-grid">
      <div class="npt-info-item"><div class="key">Thread OD</div><div class="val">${d.threadOD} mm</div></div>
      <div class="npt-info-item"><div class="key">TPI</div><div class="val">${d.tpi} tpi</div></div>
      <div class="npt-info-item"><div class="key">Thread Pitch</div><div class="val">${d.pitch} mm</div></div>
      <div class="npt-info-item"><div class="key">Nominal Bore</div><div class="val">${d.bore} mm</div></div>
      <div class="npt-info-item"><div class="key">Nearest Metric</div><div class="val">${d.metric}</div></div>
      <div class="npt-info-item"><div class="key">Hawke Gland Sizes</div><div class="val" style="font-size:0.85rem">${d.hawkeEntry}</div></div>
    </div>
    <div style="margin-top:12px;font-size:0.82rem;color:var(--text2)">
      <strong style="color:var(--text)">Adapter options:</strong> ${d.adapters.join(', ')}
    </div>`;
}

function identifyNPT() {
  const od = parseFloat(document.getElementById('nptOD').value);
  if (isNaN(od)) return;
  const entries = Object.entries(NPT_DATA);
  const match = entries.find(([k,v]) => Math.abs(v.threadOD-od)<1.5);
  const close = entries.filter(([k,v]) => Math.abs(v.threadOD-od)<3).sort((a,b)=>Math.abs(a[1].threadOD-od)-Math.abs(b[1].threadOD-od));
  let html='';
  if (match) {
    html=`<div class="result-box"><span style="color:var(--accent3)">Likely match: <strong>${match[0]}" NPT</strong> (thread OD ${match[1].threadOD}mm, diff: ${Math.abs(match[1].threadOD-od).toFixed(2)}mm)</span><button class="copy-btn" onclick="copyText('${match[0]}&quot; NPT')">Copy</button></div>`;
  } else if (close.length) {
    html=`<div class="result-box" style="color:var(--warn)">No exact match. Closest: ${close.map(([k,v])=>`${k}" NPT (${v.threadOD}mm)`).join(', ')}</div>`;
  }
  html+=`<p style="font-size:0.75rem;color:var(--text2);margin-top:6px">Tolerance ±1.5mm. NPT threads are tapered — measure at thread OD, not crests. Confirm with thread gauge.</p>`;
  document.getElementById('nptIDResult').innerHTML=html;
}

function showAdapterInfo() {
  const size = document.getElementById('adapterNPT').value;
  const d = ADAPTER_DATA[size];
  if (!d) return;
  document.getElementById('adapterInfo').innerHTML = `
    <div class="npt-info-grid">
      <div class="npt-info-item"><div class="key">Metric Equivalent</div><div class="val">${d.metric}</div></div>
      <div class="npt-info-item"><div class="key">Adapter Bore</div><div class="val">${d.bore}</div></div>
    </div>
    <div style="margin-top:10px;font-size:0.82rem"><strong style="color:var(--text2)">Compatible Gland Sizes:</strong> <span>${d.glands}</span></div>
    <div style="margin-top:8px;font-size:0.8rem;color:var(--accent2)">${d.note}</div>
    <div style="margin-top:10px;background:var(--surface3);border:1px solid var(--warn);border-radius:6px;padding:10px;font-size:0.78rem">
      <span style="color:var(--warn)">⚠️ MOC Note:</span> Using NPT cable entries in ATEX-classified zones requires a certified NPT-to-metric adapter. Uncertified adapters constitute a derogation requiring a formal Management of Change (MOC) process. Verify ATEX/IECEx/UKEX certificate numbers for both gland and adapter.
    </div>`;
}

function renderNPTTable() {
  let html=`<table><thead><tr><th>NPT Size</th><th>Thread OD (mm)</th><th>TPI</th><th>Pitch (mm)</th><th>Nom. Bore (mm)</th><th>Nearest Metric</th></tr></thead><tbody>`;
  NPT_SIZES_ORDERED.forEach(k => {
    const v = NPT_DATA[k];
    if (!v) return;
    html+=`<tr>
      <td><strong>${k}"</strong></td>
      <td style="font-family:var(--mono)">${v.threadOD}</td>
      <td>${v.tpi}</td>
      <td>${v.pitch}</td>
      <td>${v.bore}</td>
      <td><span class="tag tag-blue">${v.metric}</span></td>
    </tr>`;
  });
  html+='</tbody></table>';
  document.getElementById('nptFullTable').innerHTML=html;
}
