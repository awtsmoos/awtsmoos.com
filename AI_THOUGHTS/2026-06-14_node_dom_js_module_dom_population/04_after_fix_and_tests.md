B"H

After investigation:
- Inline module DOM population already worked.
- External file module DOM population already worked in simple cases.
- Real localhost tunnel-control URL failed before the fix because moduleTransform trusted Merkava parser output even when parser errors left a raw `export function` in js/ui/copy.js.
- Rewrote moduleTransform.js so parser warnings or surviving module syntax fall back to a stronger transform that handles exported functions/classes/vars/reexports.
- Copied the full rewritten file into the installed agent path.
- Real URL node-dom simulation now runs ok=true and shows JS module-created login gate DOM, not just static preboot HTML.
- Added isolated regression test node-dom-js-module-dom-population.test.cjs and rebuilt manifest.
