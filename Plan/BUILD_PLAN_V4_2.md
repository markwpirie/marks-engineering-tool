# BUILD PLAN v4.2

Four improvements, ordered so shared-logic work lands before the things that depend on it.
Constraints that apply to every phase (per CLAUDE.md): static site, no build step, no new
dependencies; localStorage keys are a public API — never rename or repurpose an existing key
(stopping *writing* one is fine); validate by actually driving the app in a browser over a
local HTTP server, not by reading the code.

---

## Phase 1 — Gland fit badges: per-dimension over/under flags

### Problem
`fitStatusDual()` (js/data-glands.js:71) collapses the outer-sheath check and the
inner-sheath check into a single `fitsFullTol` boolean, and the warning badge
(js/data-glands.js:122–124) always reads "undersized at max tolerance (+Xmm)" regardless of
which dimension failed or in which direction. Real example that prompted this: RFOU 4c×25mm²
(OD 28.5±1, inner 24±1) against the 453 **C2** gland fails on the **low** side (27.5 < 28.0
outer min; 23 < 23.1 inner min) — the cable at minus-tolerance drops below the gland's
minimum clamp range — yet the badge claims it's undersized at *max* tolerance. The user has
to redo the mm arithmetic by hand to find out what actually failed.

### Change
1. **`fitStatus(od, odTol, min, max)`** — additionally return fail direction:
   `lowFail` = `(od - tol) < min`, `highFail` = `(od + tol) > max` (only meaningful when
   `fitsNominal` is true and `fitsFullTol` is false).
2. **`fitStatusDual(...)`** — keep the existing combined `fitsNominal` / `fitsFullTol` /
   `tol` keys (so `findFittingGlands` filtering and `pickRecommendedGland` are untouched),
   but also attach per-dimension results, e.g. `outerFit` and `innerFit` objects each
   carrying `{ fitsFullTol, lowFail, highFail, tol }`. `innerFit` is null/absent when no
   inner check ran (no innerOD data, or 421 family).
3. **Renderers** (`renderGlandSizeList`, `renderGland421SizeList`):
   - In the meta row, colour the **failing dimension's value** amber (reuse the existing
     `--warn` colour / `badge warn` visual language — do not invent a new style) and append
     a compact direction tag next to it:
     - high-side fail: `+1mm exceeds max` (cable at top tolerance exceeds the gland's max)
     - low-side fail: `−1mm below min` (cable at bottom tolerance falls below the gland's min)
   - Replace the generic summary badge text with one that names each failing criterion and
     direction, e.g. `Book value only — outer sheath below min at −1mm` or
     `Book value only — inner sheath exceeds max at +1mm`. Multiple failures: list both.
   - Passing dimensions stay as they are. `Fits full tolerance (±Xmm)` badge unchanged.
4. **Wonder PDF fit row** (js/tabs/tab-wonder.js:42) — same directional wording.

### Verification (must actually drive the browser)
Cable & Gland tab, RFOU P1/P8 Power, 4 core, 25 mm² (OD 28.5±1, inner 24±1):
- 453 **C2** (outer 28–41, inner 23.1–32.5): low-side fail on **both** outer (27.5 < 28.0)
  and inner (23 < 23.1) → badge must say below-min / −1mm, both dimensions flagged.
- 653 **C** (inner max 24.7): high-side fail on inner (24+1 = 25 > 24.7) → exceeds-max / +1mm.
- 653 **C2** (outer min 28): low-side fail on outer (27.5 < 28.0) → below-min / −1mm.

Then BFOU 4c×25mm² (OD 29.5±1, inner 25±1): 653 **C2** must show full-tolerance pass
(28.5 ≥ 28, 26 ≤ 29.7) — i.e. the exact pair of screenshots that raised this now
self-explain why the smaller cable warns and the bigger one doesn't.

---

## Phase 2 — Wonder Tool gland output = Cable & Gland selector output

### Problem
The Wonder Tool renders only one gland family, chosen by the `wt_glandtype` dropdown
(index.html:697), via `wtGlandCard()` (tab-wonder.js:752). The Cable & Gland tab's
`showGlandRec()` (tab-cable.js:173–208) renders all three families — 501/453 braided,
ICG/653 barrier, 501/421 compression — each with a family header, image, and full size list.
The two render paths have already drifted apart once before (the shipped ICG/653 bug).

### Change
1. **Extract a shared renderer** into js/data-glands.js, e.g.
   `renderAllGlandFamilies(OD, odTol, innerOD, innerODTol, useNPT, codeTransform)`, that
   produces the family-header + size-list sequence for all three families exactly as
   `showGlandRec()` does today (including the `jpg/501-453.jpg`, `jpg/icg653.jpg`,
   `jpg/501-421.jpg` images and descriptive blurbs).
2. **tab-cable.js `showGlandRec()`** becomes a thin call to the shared renderer.
3. **tab-wonder.js**: replace the single-family `wtGlandCard()` call (line 633) with the
   shared renderer (passing `wtNptCode` as codeTransform when NPT). Remove the *Gland Type*
   dropdown from index.html (keep *Entry Thread* metric/NPT). `wt_glandtype` was never
   persisted to localStorage (only `met_wt_proj_*` fields are), so removal is safe — but
   verify that during implementation.
4. **Summary box + PDF** (`wtFindGland`, the `glandCode` summary line ~550, and the PDF
   gland section in tab-wonder.js:37–71): instead of one recommended gland for one family,
   show the **recommended pick from each of the three families** — three order-code lines
   in the summary, and three sub-blocks (or one compact table) in the PDF's gland section,
   each with its family name, size ref, entry, ranges, and the Phase-1 directional fit
   wording. `window._wtData` carries all three matches. Where a family has no fit at all,
   say so explicitly per family rather than dropping the row.
5. PDF still goes through `printHtmlDocument()` / `PDF_DATASHEET_CSS` — no new print path.

### Verification
Wonder Tool, e.g. 15 kW / 400 V defaults → check the gland section now lists all three
families with the same sizes/badges the Cable & Gland tab shows for the same cable OD, in
both Metric and NPT entry modes (NPT codes get the `NP → NPT` transform). Generate the PDF
and confirm all three family blocks render and nothing overflows the page. Re-check the
Cable & Gland tab still renders identically after the extraction.

---

## Phase 3 — Doc Number Generator: allow sheet 00

### Problem
Sheet numbers of `00` are legitimate (see real-world refs like `EHP-195-F99-0001-00-01`),
but the sheet input has `min="1"` (index.html:152) and `genDocNumber()` does
`parseInt(...)||1` (tab-symbols.js:697), so an entered 0 is falsy and silently becomes 01.

### Change
- index.html:152 — `min="0"`.
- tab-symbols.js:697 — parse so 0 survives:
  `const n = parseInt(...); const sheet = String(Number.isFinite(n) ? n : 1).padStart(2,'0');`
  (Leave the seq field's `||1` alone — sequence 0000 wasn't asked for.)

### Verification
Enter sheet 0 → full reference shows `-00-`; blank/garbage still falls back to `01`.

---

## Phase 4 — Date & Time section: date picker, Today button, move the Day/Date Calculator in

### Current state
- Symbols tab has the special section `datetime` — "Date & Time — Today"
  (tab-symbols.js:76–91), rendering ~25 copyable formats from `getTodayFormats()`
  (tab-symbols.js:36–72), always for *now*.
- The Day/Date Calculator lives in the Calcs tab (`date_calc` in `CALC_REGISTRY.general`,
  tab-calcs.js:11; UI + logic at tab-calcs.js:1184–1283: `calState`, `htmlDateCalc`,
  `renderCalendar`, `calNav`, `calPickDate`, `calSetActive`, `updateDateCalcResults`,
  `initCalendar`).

### Change
1. **Date picker + Today button** at the top of the datetime section:
   an `<input type="date">` plus a `Today` button. `getTodayFormats()` takes an optional
   `Date` argument (default: now); picking a date re-renders every format card for that
   date; `Today` resets to now. Time-of-day rows (HH:MM, HH:MM:SS, 12hr, ISO datetime,
   Unix timestamp): when a non-today date is selected, render them at **midnight of the
   selected date** rather than mixing today's clock into another date (and the Unix
   timestamp then matches the shown date). Keep the section's reorder **key `datetime`
   unchanged** (it lives in the saved section-order state); the visible name can drop
   "— Today" since it's no longer today-only.
2. **Move the Day/Date Calculator** into this section, rendered below the format grid:
   - Move the eight functions + `calState` listed above from tab-calcs.js into
     tab-symbols.js (they're globals; markup IDs `calWidget`, `daysNum`, `daysUnit`,
     `calPicking1/2`, `dateFwdResult`, `dateDiffResult` stay identical). The calendar CSS
     (`.cal-grid` etc. in css/style.css) already exists and is ID-agnostic.
   - Remove `date_calc` from `CALC_REGISTRY.general`, `CALC_META`, and `CALC_DESC`.
     Do **not** touch the `met_calc_state` key itself — its stale `date_calc` entry is
     harmless and the key is public API.
   - Call `initCalendar()` when the section first renders. Note the section re-renders on
     every symbols search keystroke (`render(q)`): when a search query is active, hide the
     calculator entirely (format cards already filter by `q`) so typing doesn't wipe
     calendar selections mid-search — and since re-render rebuilds the DOM, `calState`
     (module-level, not DOM) must be the single source of truth it already is.
   - Wire the new date picker to the calculator lightly: picking a date also sets it as
     the calendar's Date A (and centres the calendar view on that month). Today button
     does the same with today. This makes the picker useful for both halves without
     entangling them.

### Verification
Symbols tab: pick 2026-12-25 → all format cards show Christmas Day renderings, click one
to copy; Today button returns to live values. Calendar shows Date A = picked date; set a
Date B, confirm inclusive day count / weekend tally still correct across a month boundary.
Type in the symbols search box, clear it — calendar selections survive. Calcs tab General
category no longer lists the Day/Date Calculator and nothing 404s in the console.

---

## Suggested commit slicing

One commit per phase. Phases 1→2 are order-dependent (shared renderer builds on the new fit
objects); 3 and 4 are independent and can land any time. After Phase 2, run the full
validation list from CLAUDE.md including the Wonder PDF, since that button has a history of
silently re-breaking.
