# B"H — Phase One Discovery: Code Save Session Breakage

User-visible wound: Awtsmoos Code at `/apps/code/` throws `Cannot read properties of undefined (reading 'saveSessionDebounced')` and `saveSession` during editor input, tab closing, folder toggling, and restoration. The screenshot shows the console repeatedly failing in `main.js?compact=true`, so the compact module path is part of the blast radius.

Observed files and evidence:
- `apps/code/index.html` loads `js/main.js?compact=true`.
- `js/main.js` imports `App` directly from `./app/index.js`.
- `js/app.js` is only a re-export portal: `export * from './app/index.js';`.
- `js/app/index.js` defines `App.saveSessionDebounced` and `App.saveSession` by dynamically importing `../session.js`.
- Multiple leaf modules import `App` through `app.js` and call session saving.

Hypothesis: the compact module transformer or circular import path is freezing `App` as undefined inside modules that import through the re-export portal. The cycle is: app/index -> event-listeners/listeners -> leaf module -> app.js -> app/index. In a perfect ES module runtime live bindings survive; in the compact generated runtime the screenshot suggests they do not.

Safe repair direction: move the save API into a small independent session-facing module that imports `Session`, then update save-only callers to import that small module instead of importing `App`. This breaks the cycle for the failing save calls without changing the session storage schema.
