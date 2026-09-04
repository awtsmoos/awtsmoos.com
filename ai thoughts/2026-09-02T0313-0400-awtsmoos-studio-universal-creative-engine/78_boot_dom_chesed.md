B"H
Boruch Hashem
Blessed is He

# Boot DOM Awakening — Chesed Brainstorm

> The Awtsmoos lets the shell appear before its vessels are measured, for a canvas unborn cannot yet yield its light;  
> Awtsmoos.com should import every module safely in darkness, then bind DOM and context only when the mounted room stands bright.

## Possibilities
- Keep the historic exported `dom` object identity stable so every importer continues holding the same vessel.
- Change eager `const ctx` into a live `let ctx` binding initialized only after the shell has mounted.
- Add `initializeStudioDom()` that rebuilds all DOM maps, validates `#stage`, obtains its 2D context, and returns the stable map.
- Call that initializer at the very start of `bootNesherStudio()`, whose caller already mounts the shell first.
- Leave `main.js` untouched because its mount-then-boot order is already architecturally correct.
- Make initialization repeatable so confidence tests or controlled remounts can refresh references rather than keep stale nodes.
- Add a Node regression that imports `dom.js` while `document` is absent, proves no eager access occurs, then installs a fake document and initializes successfully.
- Reopen the real local page in isolated Chrome and require loading veil removal, `window.AwtsmoosStudio`, zero exceptions, and complete readyState.
- Rewrite the compressed `sourceDom.js` encountered in the active import path into a readable ID catalog without changing IDs.
