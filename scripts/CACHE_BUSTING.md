# B"H — Bulletproof Cache Busting System

**Yaakov's law (2026-10-13): "Users should NEVER need to hard refresh."**

## How It Works

### 1. Content-Hash Asset Versions (Automatic)
**Script:** `scripts/bustAllCaches.mjs`

- Scans ALL 574 HTML files in `geelooy/`
- Finds every `href="..."`, `src="..."`, `@import`, `import()`, `url()` referencing `.css`, `.js`, `.webp`, `.png`, `.jpg`, `.mp4`, etc.
- Rewrites `?v=xxx` to the SHA256 content hash (first 10 chars) of the referenced file
- When a file changes → hash changes → browser fetches fresh automatically
- When a file doesn't change → hash stays same → browser uses cache (fast)
- **1076 asset references** updated in the first run

**Usage:**
```bash
node scripts/bustAllCaches.mjs --write          # all pages
node scripts/bustAllCaches.mjs --write --html geelooy/index.html  # single page
```

### 2. Automatic on Every Deploy
**Modified:** `scripts/vmDeploySigned.mjs`

- Before every deploy, if any `.css`, `.js`, or `.html` is in the payload:
  1. Runs `bustAllCaches.mjs --write` automatically
  2. Re-reads modified payload files
  3. Auto-adds any HTML files the buster touched
- **No human ever bumps a version manually again**
- Bypass with `--no-bust` (not recommended)

### 3. Service Worker with Auto-Updates
**Files:** `geelooy/sw.js`, `geelooy/scripts/sw-register.js`

**Strategy:**
- **HTML:** Network-first, ALWAYS revalidate. Users never get stale HTML.
- **Hashed assets** (`?v=abc123`): Cache-first (immutable, safe to cache forever)
- **Unhashed assets:** Network-first with short cache
- **On update:** Shows "✨ New version available" toast, auto-updates after 10s

**Registration:** Added to homepage, games, profile, email. Once registered with scope `/`, controls all pages.

### 4. Drive Asset Hashing
**Modified:** `scripts/driveServiceUpload.mjs`

- Now outputs `CONTENT HASH` and `VERSIONED URL` on every upload
- When re-uploading to the same path, append `?v=<hash>` to bust cache
- Example: `https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/foo.webp?v=a1b2c3d4e5`

### 5. HTML Never Cached (Server-Side)
- `/games/` already serves `Cache-Control: no-cache, must-revalidate`
- Service worker enforces network-first for ALL HTML navigations
- Even if server headers are wrong, SW ensures freshness

## Verification

```bash
# SW is live
curl -s -o /dev/null -w "%{http_code}\n" https://awtsmoos.com/sw.js
# → 200

# Registration script is live
curl -s -o /dev/null -w "%{http_code}\n" https://awtsmoos.com/scripts/sw-register.js
# → 200

# Pages include hashed SW registration
curl -s https://awtsmoos.com/ | grep -o "sw-register[^\"']*"
# → sw-register.js?v=ea8654e790
```

## Commits
- `79cd805d2` — bustAllCaches.mjs, sw.js, sw-register.js, vmDeploySigned.mjs integration
- `c1552c65e` — driveServiceUpload.mjs content hash output
- `1570af55a` — SW registration on key pages

### 6. Build Version Guard (2026-10-13 — "fix cache busting way better")
**Problem:** the app shell is a long-lived SPA. Once loaded it never does a
full page load, so a deploy could leave it running stale code for hours
(this is how the old `/mav` Search route survived a deploy on Yaakov's phone).

**Files:** `geelooy/version.json`, `geelooy/scripts/sw-register.js` (version-guard section), `scripts/vmDeploySigned.mjs` (stamps the version)

- Every deploy writes a fresh build id (`<git-sha>-<timestamp>`) to `geelooy/version.json` and pushes it with the payload.
- `sw-register.js` polls `/version.json` (`cache: 'no-store'`) every 60s, on tab-visibility, and 5s after load.
- On mismatch: hidden tab reloads immediately; visible tab shows an "✨ New version ready" toast and reloads after 45s of user idleness (any tap/key/scroll resets the timer; tapping the toast reloads now).
- Never reload-loops: one auto-reload per build id, max 3 per 10 minutes.
- `sw-register.js` also polls `registration.update()` every 5 minutes so long-lived tabs pick up SW updates.
- `sw.js` v3: `SKIP_WAITING` message handler added (was dropped silently before), activate now deletes EVERY cache except the two current ones, and only `response.ok` responses are cached (error pages are never cached).

## What Yaakov Gets
1. **Never hard-refresh again** — content hashes change automatically
2. **No manual version bumps** — the buster handles it on every deploy
3. **Instant updates** — SW checks for new versions on every navigation
4. **Offline support** — cached pages work offline, update when online
5. **Fast caching** — unchanged assets stay cached (hashes don't change)
