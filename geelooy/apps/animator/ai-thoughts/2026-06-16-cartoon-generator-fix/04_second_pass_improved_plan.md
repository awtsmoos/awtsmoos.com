B\"H

# Second Pass Improved Plan

Observed evidence: `src/camera/core/CameraRigRegistry.js` line 36 uses `this.defaults[kind]` from an instance method while `defaults` is declared as a static class field. In browser execution, the instance has no `defaults`; therefore reading `this.defaults.wide`/`this.defaults[kind]` explodes. The screenshot error aligns exactly with this mechanism.

## Actual touched files planned

1. Rewrite `src/camera/core/CameraRigRegistry.js` fully.
   - Use `CameraRigRegistry.defaults` through a helper.
   - Guard bad/missing specs.
   - Keep fallback rigs.
   - Keep the module small.
   - Add poetic JSDoc but no giant line bloat.
2. Add `tools/verify/cameraRigRegistrySmoke.js`.
   - Import registry.
   - Instantiate with a camera spec.
   - Assert no crash and defaults exist.
3. Rewrite `package.json` fully only if adding verify script is needed.
4. Add `src/generator/CartoonGeneratorRoadmap.js` as a non-invasive schema/roadmap module only if time remains after crash fix verification.
5. Write final handoff in ai-thoughts.

## Thirty more improvements and revelations

1. Static class fields must be accessed by constructor/class, not instance.
2. The smoke test should reproduce the exact camera spec path.
3. Use `Number.isFinite(Number(value))` for numeric strings.
4. Preserve original `x` if present.
5. Provide default `id` if malformed scene camera lacks one.
6. Filter scene rigs only after coercing object values.
7. Avoid swallowing errors from `new CameraRig` by feeding complete objects.
8. Preserve actor-generated rigs order.
9. Preserve scene rigs overriding fallbacks by same id.
10. Avoid changing camera processors unless needed.
11. Keep generator work as additive.
12. Add 2s duration constants later.
13. Make AI output strict JSON later.
14. Existing app is browser module; tests can use Node ESM.
15. Do not use mobile browser DevTools as verification when Node can check module logic first.
16. Use npm scripts present.
17. Avoid command-based partial edits; rewrite whole files with heredocs.
18. Verify syntax for changed files.
19. Verify app import graph if affordable.
20. Avoid touching index.html.
21. Avoid any network dependency.
22. Record the outside-root list failure as evidence of tunnel root mismatch.
23. The public URL can remain same after file rewrite.
24. Preserve B\"H headers.
25. Ensure files under 120 lines where practical.
26. Do not refactor the whole camera stack today.
27. The generator plan can be explicit without pretending finished.
28. The user wants full future; deliver a real roadmap artifact.
29. The immediate broken state must be fixed first.
30. Verification must be run and recorded.
