# B"H — Post Write Audit

Files written as complete files:

- `main.js` — 7 lines
- `modules/app/bootNesherStudio.js` — 56 lines
- `modules/app/nleState.js` — 14 lines
- `modules/app/canvasBindings.js` — 15 lines
- `modules/app/sourceBindings.js` — 51 lines
- `modules/app/layerBindings.js` — 20 lines
- `modules/app/recordingBindings.js` — 15 lines
- `modules/app/providerBindings.js` — 26 lines
- `modules/app/nleBindings.js` — 59 lines
- `modules/app/genericHlsController.js` — 92 lines

No partial patches were used. `main.js` is now a tiny entrypoint. Runtime wiring moved into `modules/app/*` controllers.
