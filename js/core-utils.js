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
