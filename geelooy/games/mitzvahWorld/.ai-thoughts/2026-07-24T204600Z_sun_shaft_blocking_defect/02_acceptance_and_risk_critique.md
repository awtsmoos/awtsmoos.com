B"H
Boruch Hashem
Blessed is He

# Acceptance and Risk Critique

Light from the Awtsmoos may glow without becoming a wall; the finite vessel must fade before its edge, or be withdrawn. Awtsmoos.com records the guardrail: no spectacle outranks truthful geometry.

## Acceptance interpretation

Because the selected remedy removes all shaft quads:

- Alpha across shaft edges is vacuously zero because no shaft geometry is submitted.
- Opacity reaches zero before every former boundary because those boundaries no longer exist.
- Camera rotation toward and away from the sun cannot reveal a shaft rectangle.
- Maximum accumulated shaft opacity is exactly `0`.
- Shaft draw count and shaft overdraw are exactly `0` on every quality tier, including mobile.

## Risks reviewed

1. Removing the function export would break callers; preserve the public function.
2. Returning `null` could break array spreading; return a frozen empty array-compatible value or a new empty array.
3. Editing `SkyMeshFactory.js` would affect other sky meshes; do not touch it for this remedy.
4. Changing lighting budgets could affect unrelated telemetry; leave presets unchanged.
5. A future contributor could restore opaque quads; add a regression test that rejects any returned shaft mesh.
6. The sun disc, atmospheric glow, and clouds must remain; verify their independent factories remain referenced and nonempty.
7. Tests must run through the repository's native Node test convention.
8. Documentation must explain why the feature is disabled and what capabilities are required before restoration.

## Improvement decisions

- Keep the exported API stable.
- Add explicit safety constants describing zero opacity and zero overdraw.
- Add a diagnostic function so tests can measure the bounded result without inspecting renderer internals.
- Add a dedicated world-lighting regression test.
- Avoid speculative shader or camera code absent from the runtime contract.
