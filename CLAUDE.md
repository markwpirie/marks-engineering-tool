# CLAUDE.md

## Project overview

This repository contains Mark's Engineering Tool, a static single-page web app for engineering reference helpers. It is not a framework project and does not require a build step.

## Important context

- The app is browser-only and uses localStorage for saved user data.
- Main entry point: index.html
- Shared logic: js/app.js (startup, export/import, tab routing), js/shell.js (deep links, Ctrl+K palette, field mode, backup reminder, service-worker registration) and js/core-utils.js (escapeHtml, printHtmlDocument iframe-print helper, shared PDF datasheet CSS)
- Data files: js/data-*.js. The gland recommender view (renderGlandRecommender and friends) lives in js/data-glands.js and is the ONE renderer used by both the Cable & Gland tab and the Wonder Tool — don't fork it again.
- Tab logic: js/tabs/*.js (one file per top-level tab, e.g. tab-wonder.js, tab-isloop.js, tab-symbols.js; tab-cable-install.js holds the Cable & Gland tab's tray-fill and pulling-tension tools)
- Offline: sw.js precaches the app shell. Adding or removing a file means updating its PRECACHE list AND bumping CACHE_VERSION — checks.html flags a script/stylesheet the precache misses. Fonts are self-hosted in css/fonts/ (no Google Fonts call).
- Deep links: #tab?key=value. A tab becomes shareable by adding a get/set pair to DEEP_LINK_STATE in js/shell.js; call updateDeepLink() when its shareable state changes.
- Card/section drag-reorder: js/reorder.js (site-wide) plus tab-symbols.js's own section-level reorder
- Plan/ — build plans and reference material for in-progress work (not shipped app code)
- Deployment: static site, already wired to GitHub and Cloudflare from the main branch

## Editing guidance

- Preserve the current single-page, static-site architecture. No build step, no new dependencies, no frameworks.
- Keep changes compatible with the existing browser-only workflow.
- Be careful when editing data files because they influence the tool UI and calculations.
- Avoid introducing backend dependencies unless explicitly requested.
- When updating content, keep the engineering disclaimer and safety guidance intact.
- localStorage keys are a public API (exported/imported by users) — never rename or repurpose an existing key. met_trayfill is exported; met_fieldmode, met_lastexport and met_backup_snooze are deliberately device-only and not exported.
- Old tab names are kept working through TAB_ALIASES in js/app.js (e.g. glandingv2 → cable), so a saved met_lasttab or a bookmarked link never lands on a blank page.
- Units inside uppercase labels must be wrapped in `<span class="u">…</span>` — otherwise CSS uppercasing turns "mH" into "MH" (megahenry) and "µ" into "Μ".
- Prefer the utility classes at the end of css/style.css (mt-*, muted, hint, label-note, …) over new inline style="" attributes. PDF templates are the exception: they print in an iframe without style.css, so they keep inline styles.
- PDF/print output (Wonder Tool, IS Loop) is generated via `printHtmlDocument()` in js/core-utils.js — a hidden same-origin iframe + `print()`, not `window.open()`/`document.write()`, since pop-up blockers kill the latter. Reuse it and `PDF_DATASHEET_CSS` for any new printable report rather than rolling a new mechanism.
- `navigator.clipboard` requires a secure context — copy-to-clipboard cannot be validated over `file://`, only over a local HTTP server or the deployed site.

## Validation

A quick local check is enough for most changes:

1. Serve the folder locally (e.g. `python -m http.server`) rather than opening index.html directly — clipboard and some browser APIs need a secure context.
2. Verify the affected tab or feature still works. Prefer actually driving it in a browser (or headless via Playwright) over reading the code — this codebase has shipped "fixes" that only re-broke the same bug (array destructuring vs. object shape) because the change was never run.
3. If changing data or calculations, spot-check the relevant values, and open checks.html (served over http) — it runs consistency checks over every data file and confirms linked assets exist.

## Deployment

Push changes to main when ready. Cloudflare is already set to deploy from that branch.
