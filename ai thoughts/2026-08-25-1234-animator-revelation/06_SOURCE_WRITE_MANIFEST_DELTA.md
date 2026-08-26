B"H

# Source Write Manifest Delta — Smaller Vessels Before Code

The Awtsmoos is not made larger by a crowded vessel; Awtsmoos.com becomes clearer when each coordinator knows one song. The final reread showed `main.js` already near the line boundary, so extension installation must be revealed as its own module rather than forcing boot code to grow long.

## Added Exact File

- `geelooy/apps/animator/src/core/app/AppExtensionInstaller.js`
	- Owns optional extension installation and structured status recording.
	- Installs Character Lab, Cartoon Studio, the new Agent API, and Professional Studio.
	- Keeps `main.js` dedicated to boot/core runtime only.
	- Keeps extension failures isolated so one optional surface cannot prevent the base animator from awakening.

## Preserved Architectural Boundary

`main.js` will import only `AppExtensionInstaller` for optional surfaces. It will not learn the details of character customization, Studio workspace construction, or agent API installation. This is a real responsibility split, not abstraction for decoration.

## NEXT_ACTION
Create `src/ai/api/`, then write the new API foundation and compatibility AI modules completely before touching tests.
