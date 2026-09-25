# TODO

## Near-term

- [x] Add project README
- [x] Add project guidance for future edits
- [x] Add Git-friendly ignore rules
- [ ] Review and tidy any stale or duplicate data entries
- [ ] Add screenshots or a short demo section to the README
- [ ] Validate the live Cloudflare deployment after the next push

## Next — to flesh out together

- [ ] **Cable & gland schedule** — build up a list of circuits (tag, from/to, route length, cable, gland at each end, entry thread) from the Cable & Gland tab / Wonder Tool and export it as CSV and as a PDF via `printHtmlDocument()` + `PDF_DATASHEET_CSS`, ready for a documentation package. To decide: which columns the client's schedule template needs, whether glands are per-end, how it interacts with Export/Import (new `met_schedule` key).
- [ ] **Ex inspection checklist (IEC 60079-17)** — Visual / Close / Detailed grades, pass/fail/N/A + comment per item, equipment tag and Ex marking header (reuse the ATEX decoder), PDF output. To decide: item list source (60079-17 Table 1 vs. company form), whether results persist per tag, photo attachments (not possible in localStorage — maybe out of scope).

## Follow-ups found during v4.3

- [ ] `pdfs/IEC 60092-352 Table B4.pdf` is linked from the Wonder Tool but not in the repo (a copy is in ~/Downloads). It's an IEC extract — decide whether it can be published; until then the link hides itself when the file is missing.
- [ ] RFOU 3C × 240 mm² is a legacy `unverified` entry with no R/X/short-circuit data (not in the Draka datasheet). Confirm and complete it, or remove it. The Wonder Tool now refuses it whenever a voltage-drop or fault-level check is requested.
- [ ] Gland torque & install card (NPT tab roadmap) — needs torque / stripping-length / armour-cone data transcribed from Hawke installation instructions.
- [ ] MOC / derogation builder for NPT adapters (NPT tab roadmap).
- [ ] Remaining inline styles: ~40 in index.html plus the IS Loop / Wonder Tool / Symbols render templates. PDF templates must keep theirs (they print without style.css).
- [ ] Symbols tab could register in DEEP_LINK_STATE (e.g. link straight to a custom section) — not done yet.

## Maintenance ideas

- [ ] Add a changelog for major updates
- [ ] Review the ATEX and cable/gland datasets for accuracy
- [ ] Consider adding a small version history banner in the app UI
- [ ] Add a simple backup/export reminder for users
- [x] The generate pdf button in workder tool no longer works. get it working to generate a profesional output that would look good in a documentation package to a large oil company. *(v4.1 — replaced window.open+document.write with an iframe print helper, restyled to steel-blue v4 datasheet look; the restyle itself briefly re-broke the button with an array-destructuring crash and a garbled gland-section table — caught by actually running the app and fixed same day)*
- [x] Prompt engineering tab - overhaul for 2026 with quick prompt generation ideas for engineering - each of the existig sections persona, role, task, context, format should ahve clickable buttons like how the persona buttons currently work. The out put should have a click to copy button (check it works) *(v4.1)*
- [x] The symobls section has handles to reorder the boxes. This is then saved in the export json so I can move to new pc if i make drastic changes. All boxes in the site should have these handles. *(v4.1 — site-wide card drag-reorder via js/reorder.js)*
- [x] There are no "x" in the section headers to send to recycle bin. this should be re-introduced. *(v4.1 — built-in Symbols sections now get ✕ too, restore-only since there's no data to delete)*
- [x] check the functionality of the recycle bin when this is done. *(v4.1 — code-reviewed; a manual click-through in the browser is still worth doing)*
- [x] Add an IS loop calculation worksheet which outputs to a pdf. it should have dropdows with cable types which dynamically reference the cable date resisistance, inductance capacitance values.. baked in value converter for example converfing micro farrads to milli etc. space to key in instrument details, tag, certificate. automatically calculate based on entered figures. Attached excel for reference of our exiting sheet. (in plan folder named IS Loop calculation) *(v4.1 — new IS Loop tab)*
- [x] 2.3 reference wallcharts - call this reference wallchart and only include the Ex veritas one. Remove Sira (this is the out of date one) and remove the note about the wallcharts being out of date. *(v4.1)*
- [x] none of the click to copy buttons seem to be working for example in the document number generator clicking copy in the Full reference box does not add anything to the clip board, same for the AREX marking box in the atex generator. But the click the symbols (like the mm2 and the 1/2 are working). *(v4.1 — attribute-escaping bug in makeCopyBox/generatePrompt)*
- [x] remove reference to 'brig electric' within the pages. *(v4.1)*
- [x] **v4.3 site-wide round** — Glanding V2 promoted into the Cable & Gland tab and the Wonder Tool (shared renderer in js/data-glands.js; Metric/NPT switch no longer wipes a measured OD; single amber "Book fit only" badge; estimated over-cores check on ICG/653). Wonder Tool: running/starting voltage drop + adiabatic short-circuit sizing with per-criterion checks and PDF section, measured-OD gland override. IS Loop: spare margins + maximum cable length. ATEX: marking-vs-area suitability check; fixed "Ex db" being read as EPL Db and "Ex e mb" dropping mb; added db/eb/ec/pxb/… codes. Calcs: reasons under amber/red results, next size down/up for fuse/transformer, NEK 606 conductor data option in volt drop. NPT: nearest two sizes with deltas. Cable tab: tray fill (5.5) and pulling tension (5.6). Shell: grouped nav, Ctrl+K palette, deep links, field mode, system theme default, offline service worker + self-hosted fonts, import preview/validation, backup reminder, checks.html data sanity page, unit-case fix in labels, phone layout fixes.
- [x] Cable & Gland: checking a gland recommendation meant scrolling up to re-read the cable OD, and a "no size covers this cable" result gave no way to see how close it came. Added a new "Glanding V2" sandbox tab (nav bar, next to Cable & Gland) to iterate on this without touching the live tab: cable OD/inner-OD copied down next to each gland recommendation, collapsed "show size below/above" toggles either side of the single recommended size, per-dimension (outer/inner sheath) pass/fail badges instead of one combined badge, closest-candidate sizes shown with specific fail reasons when nothing fits, and a manual-entry override on the cable OD figures for checking a physically measured cable. *(js/tabs/tab-glandingv2.js, new; additive-only functions in js/data-glands.js; live Cable & Gland tab and Wonder Tool untouched)*
