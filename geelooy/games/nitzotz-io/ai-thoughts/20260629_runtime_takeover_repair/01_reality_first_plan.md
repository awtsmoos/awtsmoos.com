B'H

# Runtime Takeover Repair: First Plan

## Goal
Verify and repair Nitzotz.io from actual files and actual browser behavior, not inherited claims.

## Immediate evidence required
1. Git status for game and procedural libraries.
2. File inventory for camera, renderer, renderList, world generation, WebGL, tests.
3. Direct reads of key modules before modifying anything.
4. Existing test execution.
5. Chrome visual verification of local and public URLs with fresh query strings.
6. Console and network/module import inspection.
7. Movement/pulse/absorb scenario screenshots or runtime observations.

## Rules
- No partial file patching.
- Any modified code file must be rewritten as a whole file.
- Prefer smaller modules; avoid files over 120 lines where practical.
- Do not claim complete without browser proof.

## First risk map
- Tunnel may be slow or return gateway timeouts, so use smaller actions and command probes.
- Static tests may pass while visuals fail.
- Local files may not match public deployment.
- Cache may hide new ES module changes.
- Large procedural meshes may pass counts but still dominate visual field.
- Camera obstruction logic may be mathematically valid but visually wrong.

## First execution path
1. Inspect repo structure and status.
2. Read key camera/render/generation files.
3. Run tests.
4. Launch Chrome to local and production URLs.
5. Capture screenshots and logs.
6. Only then decide whether whole-file rewrites are needed.
