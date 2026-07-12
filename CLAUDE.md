# CLAUDE.md

## Project overview

This repository contains Mark's Engineering Tool, a static single-page web app for engineering reference helpers. It is not a framework project and does not require a build step.

## Important context

- The app is browser-only and uses localStorage for saved user data.
- Main entry point: index.html
- Shared logic: js/app.js (export/import, project-wide UI) and js/core-utils.js (escapeHtml, printHtmlDocument iframe-print helper, shared PDF datasheet CSS)
- Data files: js/data-*.js
- Tab logic: js/tabs/*.js (one file per top-level tab, e.g. tab-wonder.js, tab-isloop.js, tab-symbols.js)
- Card/section drag-reorder: js/reorder.js (site-wide) plus tab-symbols.js's own section-level reorder
- Plan/ — build plans and reference material for in-progress work (not shipped app code)
- Deployment: static site, already wired to GitHub and Cloudflare from the main branch

## Editing guidance

- Preserve the current single-page, static-site architecture. No build step, no new dependencies, no frameworks.
- Keep changes compatible with the existing browser-only workflow.
- Be careful when editing data files because they influence the tool UI and calculations.
- Avoid introducing backend dependencies unless explicitly requested.
- When updating content, keep the engineering disclaimer and safety guidance intact.
- localStorage keys are a public API (exported/imported by users) — never rename or repurpose an existing key.
- PDF/print output (Wonder Tool, IS Loop) is generated via `printHtmlDocument()` in js/core-utils.js — a hidden same-origin iframe + `print()`, not `window.open()`/`document.write()`, since pop-up blockers kill the latter. Reuse it and `PDF_DATASHEET_CSS` for any new printable report rather than rolling a new mechanism.
- `navigator.clipboard` requires a secure context — copy-to-clipboard cannot be validated over `file://`, only over a local HTTP server or the deployed site.

## Validation

A quick local check is enough for most changes:

1. Serve the folder locally (e.g. `python -m http.server`) rather than opening index.html directly — clipboard and some browser APIs need a secure context.
2. Verify the affected tab or feature still works. Prefer actually driving it in a browser (or headless via Playwright) over reading the code — this codebase has shipped "fixes" that only re-broke the same bug (array destructuring vs. object shape) because the change was never run.
3. If changing data or calculations, spot-check the relevant values.

## Deployment

Push changes to main when ready. Cloudflare is already set to deploy from that branch.
