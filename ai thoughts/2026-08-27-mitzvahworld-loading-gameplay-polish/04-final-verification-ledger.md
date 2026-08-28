B"H

# Final Verification Ledger

The Awtsmoos renews every frame from nothing and every test from truth; Awtsmoos.com therefore records only what the real public game revealed, never what confidence merely drew.

## Released implementation

- Public release under test: `5ecf1ac9f45403a9edda088c53ffb41218e32c2f`.
- Authored loading source uses layered radial and linear gradients, translucent depth, aurora drift, card arrival/breathing, text breathing, progress glow, layered failure styling, and reduced-motion shutoff.
- Production minimap keeps the established compact `176px / 28vw` footprint while map actions use a true forty-eight-pixel floor.
- Generated CSS and CompactJS were emitted only by canonical builders; generated files were never hand-edited.

## Production identity and transport

- Canonical deploy receipt: `CANONICAL_SERVER_ACTIVE sha=5ecf1ac9... compact=prewarmed` and `CANONICAL_DEPLOY_OK`.
- Independent production readback: HEAD and origin/main both equal `5ecf1ac9...`, dirty count zero, service active.
- Public production CSS: 11,365 bytes Brotli, 77,994 bytes decoded, zero residual `@import`, with loading aurora, reduced-motion law, and 48px minimap rule present.

## Public loading proof

Two empty Chrome profiles with cache disabled inspected computed production styles before menu-ready.

- Normal motion: four loading-overlay gradient layers, three loading-card gradient layers, one progress gradient layer.
- Normal overlay animation: `mw-loading-aurora`.
- Normal card animations: `mw-loading-card-arrival, mw-loading-card-breathe`.
- Reduced motion: overlay animation `none`, card animation `none` while all gradient layers remain.
- Both runs: zero exceptions and zero console errors.
- Receipt marker: `PUBLIC_LOADING_NORMAL_REDUCED_GREEN`.

## Public desktop gameplay proof

The proof waits for the game's own official boundary: `data-awtsmoos-runtime-state="playable"` and `data-awtsmoos-gameplay="true"`. A real Chrome KeyW keyDown/keyUp then drives the runtime.

- Player displacement: 1.8690334600000231 world units.
- Camera displacement: 1.8690334600000238 world units.
- Runtime input keys contained `KeyW` during keyDown and were empty after keyUp.
- Desktop map controls: Expand 53x48, Full map 57x48.
- Runtime error: none. Browser exceptions: zero. Console errors: zero.
- Receipt marker: `PUBLIC_OFFICIAL_PLAYABLE_MOVEMENT_GREEN`.

## Public mobile gameplay proof

A fresh 390x844 mobile-emulated Chrome session waits for official playability, then performs the same real joystick gesture used by the repository acceptance driver: touch down on the floating joystick and drag +34px X / -18px Y before release.

- Joystick magnitude during drag: 0.7109138487893737.
- Player displacement after release: 1.7660525616613414 world units.
- Camera displacement after release: 1.7660525616613414 world units.
- Joystick magnitude after touchEnd: exactly 0.
- Mobile map controls: Expand 48x48, Full map 52x48.
- Expand transition succeeded; Full map transition succeeded; final mode `fullscreen`.
- Viewport and document both remained 390x844, proving no horizontal overflow.
- Runtime errors: none. Browser exceptions: zero. Console errors: zero.
- Receipt marker: `PUBLIC_MOBILE_TOUCH_JOYSTICK_MAP_GREEN`.

## Test-readiness correction discovered during verification

An earlier matrix pressed W after only `runtime object + visible canvas` and observed zero movement. Source archaeology proved that this is earlier than the application's own playable boundary. `MinimalMeadowReadiness` marks playability only after input, camera, model, terrain, collision, inventory, equipment, combat, quest, recovery, streaming, and feature settlement. Re-running with the official marker and real browser input passed strongly. This was a test-readiness bug, not a production movement regression.

## Local browser harness debt

The historical `BrowserProofServer.mjs` uses `python3 -m http.server`. That server cannot reproduce Awtsmoos dynamic-server `?compact=true` behavior, so legacy local real-gameplay/minimap browser suites can time out before runtime-ready. This is verified testing-harness debt, not evidence against the public production proofs above.
