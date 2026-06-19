B\"H

# Theoretical Touch Map

Potential files to touch after inspection:

- `src/camera/CameraRigRegistry.js` if the crash is inside spec normalization.
- `src/camera/ShotRegistry.js` or `ShotProfiles.js` if bad presets originate there.
- `src/main.js` if boot ordering feeds incomplete cameras.
- New small modules under `src/generator/` if beginning the 2D cartoon generator architecture is safe now.
- `index.html` only if scripts/imports need wiring.
- `tools/verify/*.js` if validation needs a smoke test.

No partial patching. Every modified file must be completely rewritten. Existing files should remain under 120 lines where practical; if too large, prefer new modules rather than swelling old vessels.
