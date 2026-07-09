# B"H — Implementation Pivot: Stable App Facade

After inspecting the dependency graph, a smaller and safer solution appeared.

Instead of rewriting every save caller, rewrite only the old portal `apps/code/js/app.js` so it exports a stable `App` object immediately. The former portal used `export * from './app/index.js'`, which asks the compact runtime to preserve a live re-export through a circular graph. The screenshot shows that this live binding becomes undefined in leaf modules.

New vessel:

- `js/app.js` will not statically import `./app/index.js`.
- It will export an immediately available `App` facade.
- The facade's `saveSession()` and `saveSessionDebounced()` dynamically import `session.js` directly.
- The facade's settings/fullscreen/git/settings dialog methods dynamically import the true specialized modules.
- `initialize()` can still dynamically delegate to `app/index.js` for any future caller that imports `js/app.js` as the entry.

Why this is better:

1. Breaks the circular app/index -> listeners -> app.js -> app/index chain.
2. Fixes all current `App.saveSession*` callers without broad risky rewrites.
3. Preserves the public `App` interface expected by old modules.
4. Keeps the fix small and easy to verify.

Touched code file: `apps/code/js/app.js` only, full rewrite.
