<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Third Pass: Final Brainstorm

The second model still risks assuming the extension source, static server, deployment process, and user-facing installation flow are aligned. This pass treats each alignment as something to prove.

## Thirty-two additional refinements

1. Capture the failing public response headers and body exactly.
2. Confirm whether the failure is current on both GET and HEAD.
3. Search case-sensitive and case-insensitive filename variants.
4. Search for old extension names in Git history.
5. Inspect route precedence with direct source references.
6. Identify whether the server normalizes or strips file extensions.
7. Confirm URL decoding cannot alter the path.
8. Confirm the static root that maps to `/ai`.
9. Confirm symlinks are or are not followed.
10. Confirm archive serving does not require authentication.
11. Confirm caching headers permit future artifact replacement.
12. Decide whether the filename should be versioned or stable.
13. Keep the requested stable filename unless evidence demands versioning.
14. Add a package manifest describing included files if useful.
15. Validate JSON manifests before packaging.
16. Validate JavaScript syntax for packaged scripts.
17. Validate extension icons and referenced resources exist.
18. Validate host permissions and service-worker files are included.
19. Avoid shipping source maps unless intended.
20. Avoid shipping installation scripts inside the browser extension.
21. Make archive production fail on missing required files.
22. Make archive production fail on duplicate or unsafe paths.
23. Print the produced archive path and size.
24. Add a checksum evidence record.
25. Verify extraction on a clean temporary directory.
26. Verify the extracted manifest can be discovered at archive root.
27. Verify the public response bytes equal the local canonical archive.
28. Verify browser download does not render JSON.
29. Verify the install documentation does not instruct users to open the ZIP as an unpacked directory before extraction.
30. Verify macOS/Linux and Windows install sequences are consistent.
31. Add a regression test for `DYN_ROUTE_NOT_FOUND` never appearing on the canonical URL.
32. Re-run the public check after any server restart or deployment-affecting change.

## Final candidate architectures

### Architecture A: Static canonical artifact

Package extension source into `relay/install/awtsmoos-server-extension.zip`; rely on existing static serving. Lowest route complexity.

### Architecture B: Static artifact plus deterministic builder

Architecture A plus a reusable packaging script and tests. Best balance when generated binary artifacts are accepted in deployment.

### Architecture C: Explicit narrow route plus builder

Route only the exact canonical filename to a validated archive path. Use when static serving demonstrably excludes ZIP files.

### Architecture D: Release-pipeline generation

Build the archive at release/deploy time. Strong but dependent on deployment infrastructure.

### Architecture E: On-demand generation

Generate per request. Rejected by default because it increases runtime complexity and failure surface.

## Preferred decision order

Choose B when the existing static layer can serve the artifact. Choose C only with direct proof that static serving cannot. Add D later only if the repository already has a release pipeline suited to it. Reject E unless the project explicitly requires always-fresh request-time packaging.
