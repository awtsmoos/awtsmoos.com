# B"H — Real Repair Completed

## Fixed actual runtime behavior
- Replaced broken/overcomplicated bot platform pacing with direct combat AI in `js/ai/botBrain.js`.
- Restored primary top percentage UI by rewiring `js/render/ui.js` and v3 HUD cards.
- Hid old DOM topbar globally in `style.css` so it no longer competes with the canvas percent HUD.
- Repaired v3 visible run/jump/fall/punch/charge poses.
- Restored rapid detection through clean double-tap and AI rapid command paths in `js/combat/inputIntent.js`.
- Kept charge and rapid separated: rapid does not fill charge; charged attacks still use hold/release and AI charge flags.
- Increased touch control visibility and size so UI is playable.

## Verification evidence
Commands run on Windows tunnel:
- `node .sim/write-real-repair.mjs; node .sim/real-repair-probe.mjs`
- `node .sim/v3-render-probe.mjs; node .sim/charge-rapid-separation-probe.mjs; node .sim/rapid-fairness-probe.mjs; import smoke test`

## Results
- AI chases target: pass.
- V3 run height and pose: pass.
- Jump visible: pass.
- Charged punch pose extends: pass.
- Double-tap rapid punch: pass.
- Charge/rapid separation: pass.
- v3 pose constraints: pass.
- imports: pass.

## Important note
The stale overwrite trap was discovered: static imports can load old code before writer scripts run. The final probes now run writer first, then load modules in a separate process.
