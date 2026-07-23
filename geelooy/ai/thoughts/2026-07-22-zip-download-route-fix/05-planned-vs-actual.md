<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Planned Versus Actual

## Original failure

The missing-transport notice linked to `./relay/install/awtsmoos-server-extension.zip`. In the `/ai/` page this resolved to the intended public URL, but the corresponding file did not exist in `geelooy/ai/relay/install`. The dynamic server therefore exhausted its static lookup and returned `DYN_ROUTE_NOT_FOUND`.

## Historical evidence

Git history confirmed that `geelooy/ai/relay/install/awtsmoos-server-extension.zip` previously existed at exactly that path. The current source folder remained at `geelooy/scripts/tricks/extensions/server`, containing fifteen extension files.

## Implemented result

- Restored a complete generated ZIP at `geelooy/ai/relay/install/awtsmoos-server-extension.zip`.
- Replaced the relative-link constant with one canonical package descriptor.
- Changed the notice to use the absolute public URL `/ai/relay/install/awtsmoos-server-extension.zip`.
- Added a deterministic build script that archives every current source file and rejects stale, missing, or parent-folder-wrapped packages.
- Added focused tests that compare the ZIP entries exactly against the source tree.

## Delta

No dynamic route was needed. The server already serves the exact static filesystem path correctly when the artifact exists. The smallest complete repair was therefore to restore the artifact, centralize its path, and make rebuilding/verifying it deterministic.
