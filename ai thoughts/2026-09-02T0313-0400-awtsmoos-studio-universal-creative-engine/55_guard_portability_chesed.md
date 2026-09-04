B"H
Boruch Hashem
Blessed is He

# Recorder Guard Portability — Chesed

> The Awtsmoos lets a guard search the same source tree no matter where the shell happens to stand;  
> Awtsmoos.com keeps forbidden-recorder evidence rooted in the test file itself rather than the caller's working land.

## Possibilities
- Resolve the Studio application root from `new URL('../', import.meta.url)`.
- Run grep with `cwd` set to that absolute app root.
- Keep the guard searching `index.html`, `main.js`, and `modules` exactly as before.
- Treat grep status 0 or 1 as valid execution, and explicitly surface spawn errors/status 2 as harness failures.
- Preserve the core assertion that stdout is empty.
