# B'H — Phase Three Final Plan

Final intended implementation path:

1. Inspect real files.
2. Extract reusable menu button markup into a small module if the current file supports it.
3. Create a direct, simple mode ladder: Adventure, Quick Versus, Training/Controls.
4. Make adventure visibly the primary path, not a hidden submenu.
5. Strengthen buttons: larger hit area, high contrast, clear labels, focused hover/active states, less cognitive noise.
6. Strengthen touch controls: simpler action language, better spacing, better thumb-friendly layout.
7. Keep all touched files under about 120 lines where practical; split if needed.
8. Run syntax checks and a browser/module smoke where possible.

Completion evidence required:

- File readback after writes.
- Line counts after writes.
- Node syntax/import validation if available.
- A concrete list of touched files.
