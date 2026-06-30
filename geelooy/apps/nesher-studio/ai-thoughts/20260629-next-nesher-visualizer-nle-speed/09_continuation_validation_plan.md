# B"H Continuation Validation Plan

Run after writes:
- `node --check` on every touched JS/MJS file.
- Existing smoke tests: 011, 027, 029, 030, 039, 042, 043, 044, 045, 046, 047, 048, 049, 050, 051, 052, 053, 054, 055, 056, 057, 058, 059.
- New smoke tests: 060, 061.
- `tests/run_confidence_layer.mjs` after updating it.
- Line-count gate for `modules/**/*.js`, `tests/*.mjs`, and `main.js`.
- Forbidden active recorder scan excluding historical `ai-thoughts` and explicit guard test.
- Git status scoped to `geelooy/apps/nesher-studio` and root status for unrelated dirty files.
- Browser smoke when feasible: load current URL, check that new UI buttons exist and no console errors appear.
