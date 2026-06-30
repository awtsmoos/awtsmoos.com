# B"H Reality Scan
- App tree inspected before writes: visualizer, renderers, NLE, app bindings, encoding benchmark, tests 045-056, and prior ai-thoughts.
- App was clean in initial `git status --short`; many unrelated dirty files existed outside `geelooy/apps/nesher-studio` and are not to be touched.
- Visualizer architecture is preset/family/helper based; safest change is new tiny model and preset modules plus small registry/helper rewrites.
- NLE timeline already supports add/select/split/trim/move/ripple; safest change is new command helpers over existing model.
- Encoding benchmark already has matrix, recommendation, compact view; safest change is smoke scenarios, capability helper, and richer compact rows.
