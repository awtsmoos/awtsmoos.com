B"H

# Shadow Demon Material Readability — Scope and Evidence

## Mission
Reveal dark demon surfaces that remain internally readable under the live bootstrap and rich rendering paths without brightening the world.

## Exclusive source scope
Only the nine user-authorized application files, new `MinimalMeadowDemonReadability*` or `MinimalMeadowCreatureSurface*` modules, focused tests, and this handoff directory may be written.

## Baseline evidence
- Scoped SHA-1 hashes were captured before source work.
- `MinimalMeadowDemonMaterial.js` was already modified in the worktree and must be preserved through a complete-file rewrite rather than reverted.
- Geometry already carries position, normal, color, UV, joints, and weights.
- Procedural canvas sources are 256×256 and cached by a finite family key.
- Existing tests disagree with current implementation about vertex colors and roughness.
- Current rich material records `mapImage`; renderer binding still requires direct proof.

## Work graph
1. Trace rich material property consumption.
2. Trace bootstrap tint and vertex-color multiplication.
3. Identify live lighting preset and six live demon profiles.
4. Define measurable luminance and anatomical contrast contracts.
5. Rewrite complete scoped modules.
6. Add focused world and app tests.
7. Run syntax, focused tests, allocation checks, and luminance diagnostics.
8. Re-read every touched file and produce final evidence.
