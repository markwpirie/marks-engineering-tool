# M.E.T. v4 Redesign — Build Plan (handover to implementation model)

**Status:** Approved by Mark 2026-07-10. Ready to build.
**Canonical design reference:** `design-preview.html` in the repo root (open it in a browser, toggle both themes). This file IS the design. When in doubt, match it.
**Superseded:** `Plan/MET_v4_UI_Art_Direction_Spec.docx` and `Plan/Vision.png` were an earlier art direction (neon cyan, glows, pill buttons, dark-only, 3-column). Where they conflict with `design-preview.html`, **the preview wins**. Specifically rejected from the docx: cyan `#59D6FF` accent, glow effects, scan-line animations, pill (24px radius) buttons, dark-mode-only, count-up animations. Retained from the docx: the three fonts (Rajdhani / Inter / JetBrains Mono), status chips concept, left-accent-strip on highlighted cards, 150–300ms ease transitions.

---

## 0. Ground rules (read before touching anything)

1. **Static site, no build step, no new dependencies.** Do not add frameworks, bundlers, or npm. Per `CLAUDE.md`.
2. **This is a restyle, not a rewrite.** Do NOT change any calculation logic, data files (`js/data-*.js` values), localStorage keys, or function signatures. If a change to a `js/tabs/*.js` file is needed, it is limited to the HTML template strings and class names those functions emit.
3. **Do not rename existing CSS custom properties.** The tab JS files emit inline styles referencing `var(--accent)`, `var(--accent3)`, `var(--text2)`, `var(--surface3)`, `var(--mono)` etc. The redesign works by **repointing the values** of the existing variable names (see token table §2). New variables may be *added*, never removed.
4. **Keep the existing theme mechanism**: `body.light-mode` class toggled by `toggleTheme()` in `js/app.js`, persisted in `localStorage('met_theme')`. The preview file uses `html[data-theme="light"]` — translate those selectors to `body.light-mode` when porting CSS. Do not adopt `data-theme`.
5. **Emoji policy — chrome vs content.** Remove emoji from *chrome*: nav tabs, card titles, `<h2>` page titles, buttons, labels. Keep emoji that are *content/features*: the entire Symbols tab symbol grids, the emoji picker modal, custom section emoji, snippet content. When unsure: if the user clicks it to copy it or chose it themselves, it stays.
6. **Keep the engineering disclaimer and safety guidance intact** (About modal disclaimers, footer disclaimer, ATEX/NPT warnings, wallchart caveats). Restyle, never delete or soften wording.
7. **Preserve the print stylesheet behaviour** (`@media print` in style.css) — the Wonder Tool PDF export depends on it. After restyling, re-check print output.
8. **Work on a branch** (`redesign-v4`), commit per phase below. Do **not** push to `main` until Mark approves — Cloudflare auto-deploys `main`.
9. `design-preview.html` and the `Plan/` folder are working documents — they do not ship. Do not link them from `index.html`. (Leave them in the repo; add nothing.)

---

## 1. Design summary ("the datasheet, electrified")

- Looks like a premium engineering datasheet: numbered section kickers with hairline rules, small-caps labels, mono numerals, one restrained steel-blue accent.
- **Zero chrome emoji, zero decorative icons.** The only iconography is the 10-icon inline SVG sprite (already authored in `design-preview.html` — copy it verbatim into `index.html`).
- **Colour is semantic**: blue = interactive/key value; green/amber/red = engineering judgement (pass/warn/fail) only. If a colour is on screen it means something.
- Status pills survive **only** as `.badge` chips (pass/warn/fail/rec/muted). Category labels become plain text or muted badges.
- Both themes are first-class. Dark is default.
- Density: compact row spacing (see the `.spec` grid paddings in the preview — these were tuned by Mark, keep them exactly).
- Canvas: `max-width: 1220px`.

## 2. Design tokens — final values

Replace the `:root` and `body.light-mode` token blocks in `css/style.css` with the following. **Names on the left already exist and must keep their names.**

| Variable | Dark (default) | Light (`body.light-mode`) | Notes |
|---|---|---|---|
| `--bg` | `#101317` | `#F5F7FA` | page background |
| `--surface` | `#161A20` | `#FFFFFF` | cards |
| `--surface2` | `#1D232B` | `#EDF1F5` | inputs, nested panels |
| `--surface3` | `#242C37` | `#E2E8F0` | deepest nesting (derived; not in preview) |
| `--border` | `#303947` | `#D5DCE4` | hairlines |
| `--border2` | `#47525F` | `#B9C3CF` | emphasised rules, hover borders |
| `--text` | `#F4F7FB` | `#1A2330` | primary text |
| `--text2` | `#B4BFCE` | `#4A5568` | secondary |
| `--text3` | `#8593A6` | `#7A8698` | muted labels |
| `--accent` | `#6CB2F2` | `#2E7CC0` | THE blue |
| `--accent2` | `#D9A13B` | `#96690F` | was orange → now maps to warn amber |
| `--accent3` | `#4CAF7D` | `#24774E` | was green → maps to pass green |
| `--accent4` | `#D9A13B` | `#96690F` | was yellow → maps to warn amber |
| `--danger` | `#D96A5B` | `#B33F31` | |
| `--warn` | `#D9A13B` | `#96690F` | |
| `--success` | `#4CAF7D` | `#24774E` | |
| `--glow` | `none` | `none` | glows are dead; keep the var so nothing 404s |

**New variables to add** (both themes, values from `design-preview.html`):
`--accent-hover` (`#8FC5F8` / `#1F659F`), `--accent-ink` (`#0F1216` / `#FFFFFF`), `--accent-tint` (`rgba(108,178,242,0.14)` / `rgba(46,124,192,0.10)`), `--pass` + `--pass-tint`, `--warn-tint`, `--fail` + `--fail-tint` (values in preview), `--r-ctl: 4px`, `--r-card: 8px`. Keep `--radius: 8px` as an alias (existing JS/CSS references it).
Keep `--mono`, `--head`, `--body` as-is (fonts unchanged; keep the existing Google Fonts `@import` with its current weights — the offline TODO at the top of style.css stays).

**Typography scale** (from preview): body `0.875rem/1.45` Inter; kickers Rajdhani 600 `0.74rem` tracked `0.14em` uppercase; field labels `0.72rem` small-caps muted; mono data values `0.86rem`; key values (`.v.hi` pattern) `1.02rem` accent.

## 3. Component mapping — old → new

| Current (style.css / markup) | New treatment (see preview selector) |
|---|---|
| `#topnav` brand `⚡ M.E.T.` | Masthead: `M.E.T.` wordmark with accent dots (`.brand`/`.dot`), "Mark's Engineering Tool" small-caps wordmark. Brand still opens About on click. |
| `.version-banner` row | **Delete the banner row.** Version moves into masthead right as plain mono text (`.ver`). Keep element id `verBannerPill` on the new span so `app.js` version injection keeps working, or update both places in app.js (`verBannerPill` + `aboutVersion`). |
| `.nav-tab` (emoji + text) | Typography-only tabs (`nav.tabs a` pattern): Rajdhani small-caps, 2px accent underline on active, no emoji. Keep them as `<button class="nav-tab">` with existing `data-tab`/`onclick` — only restyle + strip emoji. Keep the BETA badge on Wonder Tool (restyle per `.beta-badge`, amber → warn token). |
| Export / Import / Reset / theme buttons | Move into masthead right as compact `.btn`s (text only, no emoji). Theme toggle becomes `.iconbtn` using sprite `#i-sun`/`#i-moon`; update `toggleTheme()`/`initTheme()` in app.js to swap the `<use href>` instead of textContent emoji. |
| `h2` page titles (`🔧 Symbol Tool`) | Strip emoji. Style: Rajdhani, `--text` (not accent), tighter margin. |
| `.card-title` (`📋 Cable Selector — …`) | Numbered kicker (`.kicker` pattern): `<span class="n">5.1</span>` clause number + title + hairline rule. Numbering scheme in §4. Strip emoji. |
| `.tag.tag-*` category pills | Keep class names (JS emits them) but restyle to `.badge` look: small-caps, tint background, 3px radius. tag-blue→accent-tint, tag-green→pass-tint, tag-orange/yellow→warn-tint, tag-red→fail-tint. |
| `.result-box` (green mono on panel) | Restyle: `--surface2` panel, mono, value in `--text` with key figures in `--accent` (not green). Keep the absolute-positioned `.copy-btn`; restyle it to the ghost `.copy` look (sprite `#i-copy` optional — text "Copy" acceptable since JS emits it). |
| `.gland-info-grid` / `.gland-info-item` | Restyle to the `.spec` definition-grid: hairline top+bottom rules, small-caps keys, mono values, `padding: 6px 14px 6px 0` (Mark's tuned density — keep exact). Key values (Overall OD, Current) get the `.v.hi` accent treatment via existing inline styles (already `var(--accent)` — they inherit the new blue automatically). |
| Gland size rows (emitted by `renderGlandSizeList` in tab JS) | Adopt `.gsize` row pattern where feasible: big mono size ref, meta spans, fit badges, order-code chip with copy. If the emitted markup differs too much, minimum bar = replace pass/warn text markers with `.badge pass/warn` chips and keep density. |
| `table` / `.wt-table` / `.motor-table` | Datasheet table treatment (`table.data` pattern): no filled header background — small-caps muted headers with `--border2` bottom rule, `td` padding `5px 12px`, numeric cells mono + right-aligned where already classed. Keep row hover. Keep `.wt-row-*` tint semantics, repoint colours to pass/warn/fail tints. |
| `.wt-chip` stat chips | Keep structure, restyle: surface2, small-caps label, mono accent value (KPI-tile feel from the docx, executed in the calmer palette). |
| Warnings/notes (`.wt-alert`, `.wt-upsize-note`, `.wt-borderline-note`, NPT ATEX box) | `.notice` pattern: hairline border + 3px semantic left strip + tint bg. Danger notes use fail tint, cautions warn tint, info accent tint. |
| `.search-bar::before` `⌕` glyph | Keep (it's a unicode glyph, not emoji, and pseudo-elements can't use the sprite). Colour `--text3`. |
| About modal | Leave its hardcoded brigelectric.com styling alone (it's brand-matched on purpose). Only strip nothing — emoji inside the modal body are fine to keep or remove at your discretion; the disclaimer WORDING must not change. |
| Scrollbar, toast, emoji modal, drag handles | Repoint to new tokens; toast text colour = `--accent-ink` on accent. No other changes. |
| "COMING SOON" stub cards | Keep, restyle tag to muted badge. |

## 4. Kicker numbering scheme

Tab order = clause number: 1 Symbols, 2 ATEX, 3 Units, 4 Calculators, 5 Cable & Gland, 6 Wonder Tool, 7 NPT, 8 Prompts, 9 Recycle Bin. Cards within a tab number sequentially top-to-bottom: e.g. Cable & Gland → 5.1 Cable Selector, 5.2 Ambient Temperature Correction, 5.3 Gland Recommender, 5.4 AWG ↔ CSA, 5.5 Cable Description Generator, 5.6 Gland Part Number Generator (stub cards get numbers too). Sub-sections rendered by JS don't need numbers.

## 5. Work phases (commit after each; validate per §6 before committing)

### Phase 1 — `css/style.css`: tokens + base restyle *(biggest win, zero HTML/JS edits)*
Rewrite style.css around the new tokens and component treatments (§2–§3). Port rules from `design-preview.html`, translating `html[data-theme="light"]` → `body.light-mode`. Delete `--glow` usages (keep var defined as `none`). Fix `#siPrefixBtns .btn.active` to use `--accent-ink` instead of `color: var(--bg) !important`. `.btn.primary`/`.btn.active`/`.cal-cell.cal-sel1`/`.calc-list-item.active`/`#toast` currently hardcode `#000` text — change to `var(--accent-ink)`. Expect the app to look ~80% redesigned after this phase alone because the JS inline styles reference the repointed variables.

### Phase 2 — `index.html`: chrome
SVG sprite (copy from preview) after `<body>`; masthead + restyled nav (strip chrome emoji, keep onclick/data-tab wiring); delete version banner row, relocate version text; theme toggle → iconbtn; strip emoji from all static `h2`s, `.card-title`s (convert to kickers with numbers per §4), buttons and labels; site footer with disclaimer line (copy pattern from preview `footer.site` — wording from the existing About modal disclaimer, shortened form as in preview). Update `app.js` `initTheme`/`toggleTheme` icon swap + version element ids if changed.

### Phase 3 — `js/tabs/*.js` template sweep
For each tab file, in emitted HTML strings only: strip chrome emoji (`grep -n '[\u{1F300}-\u{1FAFF}☀-➿]' js/tabs/*.js` and judge each hit against ground rule 5); replace ⚠️-style text warnings with `.badge warn` / `.notice` markup; repoint any hardcoded rgba colours (e.g. `.wt-row-*`, `.wt-upsize-note` blues) to token tints. Files: tab-symbols, tab-atex, tab-units, tab-calcs, tab-cable, tab-wonder, tab-npt, tab-prompts. Also `app.js` (`makeCopyBox`, `generatePrompt` output, toasts with ✅/↺ — strip). **Do not touch logic lines.**

### Phase 4 — Component polish
Gland recommender rows → `.gsize` pattern (tab-cable.js `renderGlandSizeList`/`renderGland421SizeList`, and the same components inside tab-wonder.js); cable result → `.spec` grid classes; Wonder Tool section headers → kicker style; datasheet source-note lines (`.source` pattern) under Cable Selector and AWG table (wording exists in preview).

### Phase 5 — Full validation + version bump
Bump `APP_VERSION` to `4.0` in app.js and title in index.html. Run the full checklist §6. Present to Mark. **Stop — do not merge/push to main.**

## 6. Validation checklist (run per phase; full run at Phase 5)

Serve locally (`python -m http.server` or open `index.html`).
1. Every tab renders with no console errors; interactions work: symbol copy, ATEX decode/encode, unit convert + swap, every calculator in Calcs list, cable selector cascade (all 4 dropdowns incl. Earth + instrument types), temp correction, gland recommender metric/NPT, both generators, Wonder Tool end-to-end incl. **Generate PDF**, NPT lookup/identifier, prompts generator, recycle bin restore.
2. Spot-check values unchanged (this is restyle-only): RFOU Power 3×25mm² → OD 26±1, 89 A @45°C; temp corr 60°C → 73.0 A; gland rec for that cable → 501/453 size C M32 recommended.
3. Both themes: toggle on every tab; no unreadable text, no leftover cyan/orange/#000-on-accent. Theme persists after reload.
4. Mobile: 390px and 768px widths — nav scrolls horizontally, grids collapse, no horizontal body scroll.
5. Export/Import/Reset still work; localStorage keys unchanged.
6. Print preview of Wonder Tool result still produces a clean report.
7. Disclaimers present: About modal, footer, ATEX wallchart caveat, NPT ATEX note.

## 7. Out of scope (do not do)

- Self-hosting fonts (tracked separately in TODO.md).
- The docx's 3-column app shell / left sidebar / project-health widget — not in this pass.
- Count-up / scan-line animations.
- Any data additions (motors, cables, glands).
- Renaming files, reorganising modules, adding a build step.
