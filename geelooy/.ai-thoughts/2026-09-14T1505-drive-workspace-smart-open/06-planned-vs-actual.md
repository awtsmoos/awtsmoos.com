<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Planned Versus Actual — Drive Workspace Smart Open

## Original plan
The plan was to preserve Drive as the credential-owning component, fetch private bytes through the already-existing authenticated `content=1` entry route, pass only bounded file testimony over the existing same-origin Drive workspace channel, and let the Geelooy OS parent choose the existing program through the established workspace descriptor. No new backend endpoint, VFS path fiction, arbitrary child-selected program, or public-link creation was permitted.

## What was written
- Added a bounded authenticated raw-content reader that reuses Drive authority, sends `no-store`/same-origin fetch testimony, enforces declared and actual 8 MiB limits, and returns raw bytes plus MIME/length.
- Extended the Drive entry resource and API façade with one private-content method.
- Added a shared file-message covenant with path/name/MIME bounds and exact `ArrayBuffer` testimony.
- Added `OPEN_DRIVE_FILE` to the existing Drive workspace channel without changing channel/version/direction law.
- Added same-origin child bridge capability detection and transferable `ArrayBuffer` posting.
- Updated file-open routing so trusted embedded files use the private path while non-embedded Drive retains its existing public browser fallback.
- Added a parent-side launcher that never calls VFS for a Drive server path, awaits the existing artifact detector, builds the existing workspace launch descriptor, and opens the existing OS program.
- Extended the existing host bridge to dispatch the new file event while retaining native-compute behavior and all source/origin/envelope guards.
- Added five focused sub-120-line test modules.

## First-pass correction
The first launcher pass exposed a real integration mistake in tests: `detectWorkspaceArtifact()` is asynchronous. Passing its unresolved Promise to the descriptor caused source content to look binary. The corrected whole-file rewrite awaits the existing detector and the host bridge now catches asynchronous launcher rejection. The initial binary test also expected editable behavior, but current OS policy intentionally marks binary content inspect-only; the test was corrected to preserve that existing policy rather than weaken it.

## Security and privacy outcome
- No Drive credential, API key, bearer token, account identity, or authorization header crosses `postMessage`.
- Child messages cannot name the target `programName`.
- Parent revalidates source window, origin, channel, direction, command, metadata, and byte vessel.
- File transfer is capped at 8 MiB at private-fetch and host-message boundaries.
- Drive server paths are never passed to `os.vfs.read`.
- Trusted private-read failure does not silently publish or open a public link.
- Non-OS Drive behavior keeps its prior public-url browser fallback.

## Planned versus delivered
The planned architecture was delivered without backend expansion and with fewer moving parts than the broad brainstorm: the existing Drive route, embed protocol, artifact detector, launch descriptor, and OS window API were reused directly. No planned security boundary was omitted.
