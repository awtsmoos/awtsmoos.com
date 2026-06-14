B"H

Phase one brainstorm:
- Actual app path: geelooy/apps/tunnel-control.
- Runtime break: favorites.js imports PAGE_META, paneMeta.js did not export PAGE_META.
- Install buttons: static and dynamic login gates navigate to raw script endpoints instead of revealing paste commands.
- Login check likely exists in boot init, but import failure prevents it from breathing.

Actions considered: export the missing symbol, rewrite install buttons as command cards, preserve login link, verify imports, read back touched files.
