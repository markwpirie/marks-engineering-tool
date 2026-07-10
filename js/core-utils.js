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
