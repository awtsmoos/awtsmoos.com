B"H

# Heichel OS world render continuation

The widened heichel group reached the OS world contract. The layout now contains the world panel and the CSS entry imports the OS world stylesheet. The remaining covenant is runtime wiring:

1. `modules/ui/render.js` must expose `renderHeichelWorldState` and `activateDistrict`.
2. `modules/ui.js` must re-export those functions as the public UI mouth.
3. `modules/navigator/loader.js` must call `ui.renderHeichelWorldState` after content is loaded.
4. Re-run the heichel static/visual group.

All files will be rewritten whole.
