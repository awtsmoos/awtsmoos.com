B"H

First 28-case run produced 26 passes and 2 failures:
1. Element.remove is absent on virtual elements.
2. Dynamic import remained native `import()` in transformed module, causing Node VM dynamic import callback missing.

New plan:
- Inspect compat/installCompat and module transform hooks.
- Add DOM polyfill for Element.remove if absent, using parentNode.removeChild.
- Lower dynamic import expressions to __import(spec) in moduleTransform fallback and parser-safe branch if any import() survives.
- Rerun the 28-case isolated test until green.
- Rebuild manifest after source changes.
