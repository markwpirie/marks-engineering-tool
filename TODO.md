# TODO

## Near-term

- [x] Add project README
- [x] Add project guidance for future edits
- [x] Add Git-friendly ignore rules
- [ ] Review and tidy any stale or duplicate data entries
- [ ] Add screenshots or a short demo section to the README
- [ ] Validate the live Cloudflare deployment after the next push

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
