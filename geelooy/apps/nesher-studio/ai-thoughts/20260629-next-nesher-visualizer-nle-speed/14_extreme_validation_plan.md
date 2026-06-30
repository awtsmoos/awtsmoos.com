# B"H Extreme Validation Plan

Run after full-file writes:
- `node --check` on every touched JS/MJS file.
- New tests 062, 063, 064.
- Existing smoke tests 011, 027, 029, 030, 039, 042 through 061.
- Full `tests/run_confidence_layer.mjs`, updated through 064.
- Line-count gate for `main.js`, `modules/**/*.js`, and `tests/*.mjs`.
- Active forbidden recorder scan excluding historical `ai-thoughts` and explicit guard tests.
- Browser smoke through local static app: verify `#stage`, crop preset buttons, nav buttons, real NLE ruler/playhead, benchmark button, no app-breaking console exception.
- Final scoped `git status --short geelooy/apps/nesher-studio` and root status to identify unrelated dirty files not touched.
