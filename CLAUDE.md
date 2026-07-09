# CLAUDE.md

## Project overview

This repository contains Mark's Engineering Tool, a static single-page web app for engineering reference helpers. It is not a framework project and does not require a build step.

## Important context

- The app is browser-only and uses localStorage for saved user data.
- Main entry point: index.html
- Main logic: js/app.js
- Data files: js/data-*.js and js/tabs/*.js
- Deployment: static site, already wired to GitHub and Cloudflare from the main branch

## Editing guidance

- Preserve the current single-page, static-site architecture.
- Keep changes compatible with the existing browser-only workflow.
- Be careful when editing data files because they influence the tool UI and calculations.
- Avoid introducing backend dependencies unless explicitly requested.
- When updating content, keep the engineering disclaimer and safety guidance intact.

## Validation

A quick local check is enough for most changes:

1. Open index.html in a browser, or serve the folder locally.
2. Verify the affected tab or feature still works.
3. If changing data or calculations, spot-check the relevant values.

## Deployment

Push changes to main when ready. Cloudflare is already set to deploy from that branch.
