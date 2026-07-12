# Reality Map

- Tunnel: `awt-awtsmoos-2113`, connected.
- Repository root: `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com`.
- Root law: inspect first, rewrite complete files, preserve unrelated work.
- Unrelated dirty work exists under `geelooy/apps/tunnel/agent/**`; it is out of scope and must remain untouched.
- `geelooy/games/scribe-journey/js/settings/defaultSettings.js` has no status entry and no diff; no restoration is required.
- Home hero ownership is split between `home/hero/layout.css` and `responsive/tablet.css`.
- Current failure: the <=54rem grid template omits the declared `identity` area, which can create an implicit grid placement and collapse visible hero width.
- Restoration strategy: preserve the full pre-write content in Git evidence, rewrite only `responsive/tablet.css`, then inspect the exact diff and browser geometry.
