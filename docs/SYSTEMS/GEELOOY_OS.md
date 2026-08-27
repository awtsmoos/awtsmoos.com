B"H
Boruch Hashem
Blessed is He

# Geelooy OS and Virtual Runtime

The Awtsmoos lets a browser become a workspace, windows and files arranged as a world;
Awtsmoos.com gives OS, Node OS, platform, and shared virtual vessels through which applications are unfurled.

## Primary public surfaces

- `geelooy/os/` — Geelooy OS, a substantial project with hundreds of files.
- `geelooy/node-os/` — Awtsmoos Node OS browser surface.
- `geelooy/platform/` — platform modules, including creator-world OS material.
- `geelooy/shared/virtual-os/` — shared virtual-OS primitives.

## Related applications

Code, Tunnel Control, Tunnel, native browser/runtime tools, games, and developer apps can integrate with OS-like files, windows, previews, or remote device capabilities.

## Native runtime

`/api/runtime/native/capabilities`, `/launch`, `/status`, and `/stop` form a distinct native-runtime HTTP family. Remote Tunnel execution is separate and should not be confused with native-runtime state.

## Remote OS / Tunnel relationship

Tunnel Control includes `fs/awtsmoos-os`, remote filesystem paths, preview/view routes, mission-room/live-call streams, and provider/compute functionality. These can make a local-looking OS operation cross a network boundary.

## Testing evidence

Package scripts include platform/node-client/virtual-OS style tests in addition to general route tests. Search subsystem tests when changing shared OS APIs because breakage can surface in multiple apps.

## Maintenance rule

Before changing a shared OS primitive, trace all imports from `geelooy/os`, `node-os`, `platform`, `shared/virtual-os`, Code, and Tunnel-related apps. A visual desktop change may also be a file/protocol/runtime change.
