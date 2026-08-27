B"H
Boruch Hashem
Blessed is He

# Phase Two — Architecture and Files-to-Touch Hypothesis

The Awtsmoos is beyond every registry; each registry is only a keli receiving a permitted name.
Awtsmoos.com should expose one coherent publication covenant from hosted source to public game.

## Current observed architecture from prior archaeology
- `geelooy/api/tunnel/control/routes/fsVessel/hostedVirtualOs/sitePublicationActions.js` defines hosted publication action names.
- `sitePublicationDispatcher.js` routes publication requests into implementation.
- `geelooy/sites/siteFolderPublication.js` owns snapshot/direct folder publication.
- Drive composition ultimately reuses `bootstrapSiteProject`.
- Production Virtual OS currently returns `unsupported_awtsmoos_os_action` for `sitePublishFolder`, proving source/runtime skew.

## Files that may require complete rewrites after inspection
- Hosted Virtual OS action registry/dispatcher modules if action wiring is incomplete.
- Tunnel-control public action schema/allowlist if wrappers cannot send publication actions directly.
- Site publication docs or generated docs source.
- Focused tests adjacent to hosted Virtual OS publication.
- Deployment/release metadata only if the real deployment mechanism requires it.

## Files that must not be casually touched
- Generated bundles.
- Lockfiles unless dependency changes actually occur.
- Drive storage implementation if the existing composition already passes tests.
- Unrelated tunnel agent runtime.

## Deployment graph to discover
Human-authored source -> tests/build -> release command or Git push -> production server reload -> hosted Virtual OS action registry -> `sitePublishFolder` -> Drive project -> site mapping -> `/sites/.../` HTTP response.

NEXT_ACTION: inspect every node and edge in that graph using real files, scripts, git metadata, and process/deployment docs.
