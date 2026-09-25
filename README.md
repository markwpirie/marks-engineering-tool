# Mark's Engineering Tool (M.E.T.)

Mark's Engineering Tool is a browser-based engineering helper for electrical and hazardous-area work. It is a static web app with no backend, so it runs entirely in the browser and can be deployed as a simple static site.

## What it includes

- Symbol and snippet library with clipboard-friendly shortcuts
- ATEX / IEC 60079 decoder, encoder and marking-vs-area suitability check
- Unit conversion tools
- Engineering calculators (electrical, HVAC, mechanical, offshore)
- NEK 606 cable selector with Hawke gland recommender (measured-OD override, size below/above), tray fill and pulling tension
- Wonder Tool — motor → cable → gland, including running/starting voltage drop and short-circuit checks, with PDF output
- IS loop entity check with maximum cable length and PDF output
- NPT / adapter reference tools
- Prompt-generation helpers
- Ctrl+K search across tabs, calculators, cables, NPT sizes and symbols; shareable links to a specific view
- Works offline once visited (service worker + self-hosted fonts); field mode for phone use on site
- Local storage for user-created snippets and custom sections, with JSON export/import

## Demo

Live: [tools.brigelectric.com](https://tools.brigelectric.com/)

<!-- Add a screenshot or short GIF of the app here, e.g.: -->
<!-- ![M.E.T. screenshot](jpg/screenshot.png) -->

To try it yourself, visit the live link above, or open [index.html](index.html) directly in a browser / serve the folder locally (see [Local use](#local-use) below) and click through the tabs — no setup or account required.

## Project structure

- index.html — main single-page app shell
- css/style.css — styling; css/fonts.css + css/fonts/ — self-hosted fonts
- js/app.js — startup, export/import, tab routing
- js/shell.js — deep links, Ctrl+K palette, field mode, backup reminder, service-worker registration
- js/data-*.js — static reference data
- js/tabs/*.js — tab-specific logic
- sw.js — offline cache (bump CACHE_VERSION when adding/removing files)
- checks.html — data sanity checks; open it after editing any js/data-*.js file
- pdfs/ — reference PDFs
- jpg/ — supporting images

## Local use

Because this is a static site, you can open the project locally in a browser directly from index.html, or serve the folder with any simple static server.

Example with Python:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Git and deployment

This project is already connected to GitHub and is set up for deployment from the main branch. Cloudflare deploys from main to [tools.brigelectric.com](https://tools.brigelectric.com/), so simply push your changes there when ready.

A GitHub Pages workflow is also included as a fallback in [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

Typical flow:

```bash
git add .
git commit -m "Describe your update"
git push origin main
```

For a simple release checklist, see [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).

## Notes

- The app stores user data in the browser using localStorage.
- No server-side processing is required.
- Always verify engineering results against official datasheets, standards, and project specifications.
