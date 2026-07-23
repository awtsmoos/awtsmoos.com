<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Final Execution Plan

## Stage 1: Evidence

1. Search repository references for the exact filename, route, install language, and dynamic-route error.
2. Inventory extension source files and validate the manifest/resource graph.
3. Read install scripts, server route/static modules, package/deploy metadata, ignore rules, and focused tests.
4. Capture current public HTTP behavior and headers.
5. Record Git status so unrelated work remains untouched.

## Stage 2: Architecture decision

1. Prove whether the current static server can serve a real ZIP placed at the canonical path.
2. Select static artifact plus deterministic builder when possible.
3. Select an exact-path binary route only if static serving is structurally blocked.
4. Define the canonical install order from server prerequisites through extension activation.

## Stage 3: Complete-file implementation

Potential production artifacts, subject to evidence:

- A focused deterministic packaging script.
- A focused installation guide or existing guide rewritten completely.
- A route module or route registration file rewritten completely only when required.
- Focused regression tests rewritten or added as complete files.
- The generated `relay/install/awtsmoos-server-extension.zip` artifact.
- Any existing UI file containing the stale URL, rewritten completely rather than partially patched.

Every source file will begin with B"H, Boruch Hashem, Blessed is He, use tabs for indentation, remain readable and modular, and include meaningful Awtsmoos-conscious documentation without obscuring behavior.

## Stage 4: Verification

1. Run syntax and manifest validation.
2. Build the archive twice and compare content/hash behavior.
3. Run `unzip -t` and inspect archive root.
4. Run focused tests.
5. Request the local exact URL and verify status, headers, magic bytes, size, and archive integrity.
6. Request the public exact URL and repeat the same checks.
7. Verify all installer references point to the canonical URL.
8. Verify installation documentation order against actual scripts and extension behavior.
9. Re-read every touched file and inspect Git diff.
10. Record planned-versus-actual delta and close remaining work only with evidence.

## Completion gate

The task is complete only when the exact requested URL downloads valid ZIP bytes instead of JSON, the archive contains a loadable extension at the correct root, the installation order is documented accurately, focused regression checks pass, and no unrelated file has been modified.
