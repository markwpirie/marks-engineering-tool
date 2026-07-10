// ══════════════════════════════════════════════════════════
// SHARED UTILITIES
// Loaded before all data-*.js / tabs/*.js files — keep this dependency-free.
// ══════════════════════════════════════════════════════════

// Escapes a string for safe interpolation into HTML text/attribute contexts.
// Was previously copy-pasted inline in several places (tab-symbols.js, app.js) — consolidated
// here so there's one implementation to fix if the escaping rules ever need to change.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Prints a standalone HTML document via a hidden same-origin iframe rather
// than window.open() + document.write() — that pair is routinely killed by
// pop-up blockers since it opens a new window/tab. An iframe append isn't a
// pop-up at all, so it sidesteps the blocker entirely. The html string must
// be a complete document (its own <html>/<head>/<body>) and must not embed
// its own print-on-load <script>, since this helper drives print() itself.
function printHtmlDocument(html) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(iframe);

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    iframe.remove();
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) { cleanup(); alert('Could not generate the print preview.'); return; }
    win.addEventListener('afterprint', cleanup, { once: true });
    try {
      win.focus();
      win.print();
    } catch (err) {
      cleanup();
      alert('Could not open the print dialog. Please try again.');
      return;
    }
    // Fallback in case afterprint never fires (e.g. print cancelled in some browsers)
    setTimeout(cleanup, 60000);
  };

  iframe.srcdoc = html;
}

// Shared v4 "datasheet" look for printable reports (Wonder Tool, IS Loop).
// Light/print-white only — these documents must stand alone in a client
// package, so no dependency on the app's CSS variables or webfonts; the
// system font stack + letter-spacing approximates the app's Rajdhani
// small-caps kickers without a network font dependency.
const PDF_DATASHEET_CSS = `
  @page { size: A4; margin: 15mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #1e293b; background: #fff; }

  /* Header */
  .hdr { border-bottom: 3px solid #2E7CC0; padding: 0 0 9px; margin-bottom: 14px; }
  .hdr-brand { font-size: 13pt; font-weight: 700; color: #1B4B72; letter-spacing: 1px; }

  /* Title block */
  .title-block { border: 1px solid #cbd5e1; border-top: 3px solid #2E7CC0;
    margin-bottom: 14px; }
  .title-block table { width: 100%; border-collapse: collapse; }
  .title-block td { padding: 5px 10px; border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0; font-size: 8.5pt; }
  .title-block td.lbl { background: #f1f5f9; font-weight: 600; color: #475569;
    text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.04em; width: 18%; }
  .title-block td.val { color: #0f172a; font-weight: 500; }
  .title-block tr:last-child td { border-bottom: none; }

  /* Section headers — small-caps kicker with clause number */
  .sec { font-size: 9pt; font-weight: 700; color: #0f172a; text-transform: uppercase;
    letter-spacing: 0.1em; padding: 5px 0 4px 8px; border-left: 3px solid #2E7CC0;
    margin: 14px 0 8px; }

  /* Data grids — hairline-rule spec treatment */
  .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0;
    border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
  .data-item { padding: 5px 10px; border-bottom: 1px solid #f1f5f9; }
  .data-item:nth-child(odd) { border-right: 1px solid #f1f5f9; }
  .data-item .k { font-size: 7pt; color: #64748b; text-transform: uppercase;
    letter-spacing: 0.05em; font-weight: 600; }
  .data-item .v { font-size: 9pt; color: #0f172a; font-weight: 500; margin-top: 1px; }
  .data-item.full { grid-column: 1/-1; border-right: none; }
  .data-item.accent .v { color: #1B4B72; font-weight: 700; }

  /* Order code box (success — order code resolved) */
  .order-box { background: rgba(36,119,78,0.07); border: 1px solid rgba(36,119,78,0.35); border-radius: 4px;
    padding: 8px 14px; margin: 8px 0; display: flex; align-items: center; gap: 12px; }
  .order-label { font-size: 7.5pt; color: #24774E; text-transform: uppercase;
    font-weight: 600; letter-spacing: 0.05em; white-space: nowrap; }
  .order-code { font-family: 'Courier New', monospace; font-size: 12pt;
    font-weight: 700; color: #24774E; letter-spacing: 1px; }

  /* Comparison / data tables */
  .cmp-table { width: 100%; border-collapse: collapse; font-size: 8.5pt;
    margin-bottom: 10px; }
  .cmp-table th { background: #1B4B72; color: #e2e8f0; padding: 5px 8px;
    text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.05em; }
  .cmp-table td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }

  /* Pass/warn/fail — tinted badges, not raw background fills */
  .pdf-badge { display: inline-block; font-weight: 700; font-size: 7.5pt;
    letter-spacing: 0.04em; text-transform: uppercase; padding: 2px 7px; border-radius: 3px; }
  .pdf-badge-pass { color: #24774E; background: rgba(36,119,78,0.12); }
  .pdf-badge-warn { color: #96690F; background: rgba(150,105,15,0.12); }
  .pdf-badge-fail { color: #B33F31; background: rgba(179,63,49,0.12); }

  /* Formula / highlighted result */
  .fla-formula { font-family: 'Courier New', monospace; font-size: 8pt;
    color: #475569; margin-bottom: 3px; }
  .fla-result { font-size: 12pt; font-weight: 700; color: #2E7CC0; }

  /* Notice (informational / advisory) */
  .pdf-notice { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2E7CC0;
    border-radius: 4px; padding: 8px 12px; margin-bottom: 10px; font-size: 8pt; color: #334155; }

  /* Disclaimer */
  .disclaimer { border-top: 1px solid #e2e8f0; margin-top: 14px; padding-top: 10px;
    font-size: 7.5pt; color: #94a3b8; line-height: 1.6; }

  /* Footer */
  .footer { position: fixed; bottom: 0; left: 0; right: 0;
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 18mm; background: #f8fafc; border-top: 1px solid #e2e8f0;
    font-size: 7pt; color: #94a3b8; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

// Wraps report body markup in the shared datasheet shell (doctype, head,
// header band). `bodyHtml` should start from the title-block onward — the
// brand header is included here so both tools render it identically.
function buildPdfDocument(title, appVersion, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>${PDF_DATASHEET_CSS}</style>
</head>
<body>

<div class="hdr"><div class="hdr-brand">M.E.T. v${appVersion}</div></div>

${bodyHtml}

</body>
</html>`;
}
