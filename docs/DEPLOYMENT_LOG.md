# Deployment Resolution: CleanSwift Manager

**Date:** May 8, 2026
**Status:** Resolved & Live
**Live URL:** [cleanswift.sociomagicka.com](https://cleanswift.sociomagicka.com)
**Legacy URL:** [sixoverme.github.io/cleanswift2/](https://sixoverme.github.io/cleanswift2/)

## 1. The Problem
The application worked on GitHub Pages but failed with a "White Screen" and 404 errors when deployed as a subdomain on Netlify via Cloudflare.

### Root Causes:
*   **Hardcoded Base Path:** `vite.config.ts` had `base: '/cleanswift2/'` (required for GH Pages subfolders), which caused Netlify to look for assets in a non-existent directory.
*   **Netlify Path Nesting:** The "Base directory" in Netlify was set to `cleanswift2`, but because the repo itself was already at the root, Netlify was searching for a folder *inside* itself.
*   **SPA Routing:** Missing `_redirects` file caused 404s on page refresh/direct navigation to sub-routes.

## 2. The Solution

### Dynamic Configuration (`vite.config.ts`)
Implemented a "smart" base path detection to support both environments simultaneously:
```typescript
const base = process.env.GITHUB_ACTIONS === 'true' ? '/cleanswift2/' : '/';
```
*   **GitHub Actions:** Automatically uses the subfolder path.
*   **Netlify/Local:** Automatically uses the root path.

### Netlify Deployment Specs
Updated the dashboard settings to eliminate path nesting:
*   **Base directory:** (Empty)
*   **Build command:** `npm run build`
*   **Publish directory:** `dist`

### Routing Fix
Created `public/_redirects` with the following rule:
```text
/* /index.html 200
```

## 3. External Dependencies
*   **Google Cloud Console:** Added `https://cleanswift.sociomagicka.com` to "Authorized JavaScript origins" and "Authorized redirect URIs" to ensure Google Sheets persistence remains functional on the new domain.
*   **Cloudflare:** Verified CNAME record for `cleanswift` pointing to the Netlify site alias.

## 4. Maintenance Notes
Future updates pushed to the `main` branch will automatically deploy to both platforms with the correct configuration. No manual path changes are required.
