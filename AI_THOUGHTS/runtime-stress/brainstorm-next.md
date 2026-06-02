B"H
# Merkava Runtime Hardening Brainstorm

## Core Law
Normal browser JavaScript must remain valid and untouched. The simulator must learn the browser, not force the browser code to learn the simulator.

## Dependency Truth
A file becomes a runtime source dependency only when a browser would load it as one:
- HTML script/link/style references
- CSS import/url assets
- import maps
- static ES import declarations
- ES re-export declarations of the forms `export * from` and `export { ... } from`
- literal dynamic `import('...')`
- fetch URLs only when useful as runtime assets

Not source dependencies:
- CommonJS `require(...)` inside browser app code or worker payloads
- text inside strings, template literals, comments, regex literals
- words like import/export/from embedded in generated code strings

## Test Families To Add
1. Parser purity fixtures:
   - regex containing import/export/from
   - template strings containing import/export/from/require
   - normal multiline imports
   - compact imports
   - export const with template strings containing from
   - real reexports
2. Import map fixtures:
   - bare `three`
   - scoped imports
   - CDN-shaped three paths mapped to local repo files
3. Runtime lifecycle fixtures:
   - zero wait must mean zero wait
   - timers/RAF frozen after lifecycle
   - event listener async rejection captured, not process-killing
4. DOM browser parity fixtures:
   - script raw text node readable by ID
   - Element.append/prepend/before/after
   - getElementsByName, querySelectorAll, canvas basics
5. Matrix proof:
   - all geelooy/apps/*/index.html
   - all geelooy/games/*/index.html
   - fail rows must be explicit app-side or executor-side, never hidden timeout

## Source Discipline
Before final: git diff must show no app/game source changes except user-approved actual app bug fixes. Since user said never require source files to satisfy simulator, revert any simulator-driven app/game edits.
