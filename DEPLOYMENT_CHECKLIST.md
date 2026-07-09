# Deployment Checklist

## Before pushing
- [ ] Review the change in the browser or via a local static server
- [ ] Confirm no backend or build step is required
- [ ] Verify the updated tab or feature still behaves as expected
- [ ] Check that any new files are included in the repo

## For Cloudflare deployment
- [ ] Confirm the main branch is the deployment branch
- [ ] Push the changes to GitHub
- [ ] Wait for Cloudflare to build and deploy the update
- [ ] Open the live site and spot-check the affected feature

## For GitHub Pages fallback
- [ ] Ensure the GitHub Pages workflow is enabled in the repository settings
- [ ] Confirm the deployment workflow has permission to publish Pages
- [ ] Open the GitHub Pages URL after the workflow completes
