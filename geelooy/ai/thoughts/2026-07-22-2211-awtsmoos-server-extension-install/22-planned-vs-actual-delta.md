<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Planned Versus Actual Delta

## Original plan

- Trace the exact public request from filesystem lookup through dynamic fallback.
- Locate and validate the canonical browser-extension source.
- Build a deterministic ZIP whose root directly contains `manifest.json`.
- Give the UI one canonical absolute download URL.
- Document browser-extension installation separately from the optional local relay.
- Add focused regression tests.
- Commit and deploy only the intended files.
- Prove the public bytes match the built artifact.

## Actual implementation

- Confirmed the JSON response arose because the ZIP file did not exist in the deployed public tree.
- Confirmed unknown binary extensions are already served safely as `application/octet-stream`; no broad route was needed.
- Packaged `geelooy/scripts/tricks/extensions/server` into a 15-entry ZIP.
- Added an immutable package contract with URL, source, and artifact paths.
- Rewrote the missing-transport notice with the absolute URL and numbered install order.
- Added a dedicated install guide and four focused tests.
- Committed exactly six files as `2b94610f98594b9fd35a68d896c582999c8520b9`.
- Pushed `main` successfully.
- Discovered the live checkout was blocked by two unrelated unresolved merge files.
- Preserved that merge and its large staged workset by overlaying only the six committed blobs into the production worktree without changing the index.
- Verified the public download byte-for-byte against the committed ZIP.

## Delta resolved

The planned ordinary `git pull` deployment was impossible because production already contained unrelated merge conflicts. The safe replacement was a target-guarded `git archive` overlay from the fetched commit. This changed only the six requested worktree paths, preserved every index entry, and left the two conflict files untouched.

## Remaining external debt

The production checkout still contains an unrelated interrupted merge in:

- `geelooy/apps/tunnel/agent/testing/helpers/transactionalInstaller/installerProcess.cjs`
- `geelooy/apps/tunnel/agent/testing/helpers/transactionalInstaller/testContext.cjs`

That debt did not block the requested URL after the focused overlay, but the general `BH.sh` pull workflow will remain blocked until its owning workstream resolves that merge.
