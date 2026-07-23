<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Remaining Work

## Requested scope

- [x] Capture the failing public HTTP response and headers.
- [x] Find references to the canonical ZIP filename and install URL.
- [x] Locate the extension source and validate its manifest/resource graph.
- [x] Trace static serving and the `DYN_ROUTE_NOT_FOUND` fallback.
- [x] Inspect install scripts, deployment behavior, ignore rules, and tests.
- [x] Select a static deterministic artifact rather than a broad binary route.
- [x] Implement the package contract, builder, notice, guide, and tests.
- [x] Produce a valid ZIP with `manifest.json` at archive root.
- [x] Document the proper browser-extension installation order.
- [x] Keep the optional local relay as a separate installation path.
- [x] Run syntax, build, archive, and focused regression verification.
- [x] Verify local HTTP status, body, and exact artifact bytes.
- [x] Commit and push exactly the intended six files.
- [x] Preserve unrelated local and production work.
- [x] Deploy the exact six commit blobs into the live worktree.
- [x] Verify public HTTP 200, ZIP integrity, size, and SHA-256.
- [x] Compare planned and actual work and resolve the deployment delta.
- [x] Record completion evidence.

## Completion state

The requested scope is closed. The public URL now returns the complete 23,755-byte ZIP instead of dynamic-route JSON.

## External repository debt preserved

Production still has an unrelated interrupted merge in two transactional-installer helper files. It was not created, changed, staged, reset, or resolved by this task. Its owning workstream must close it before the general `BH.sh` pull workflow can resume normally.

## Next action

None inside the requested scope.
