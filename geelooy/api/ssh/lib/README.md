# B"H — SSH Lib (geelooy/api/ssh/lib/)

Plain-data composition root for the SSH route families (see `../README.md`).
Combines four independently built route maps into one declarative surface.

## Files
- `routes.js` — composition root: `buildRoutes(requestVessel)` merges the
  command, file, shell, and virtual route maps.
- `routeSupport.js` / `request.js` / `responses.js` — route context, request
  handling, response shaping.
- `commandRoutes.js` / `commands.js` — remote command routes and implementations.
- `fileRoutes.js` / `fileContentTransport.js` — file/folder/stat/mode/path routes.
- `shellRoutes.js` / `shellSessions.js` / `shellSessionRegistry.js` /
  `shellSessionRecord.js` — living shell sessions and their registry.
- `virtualRoutes.js` — bridges the alias-backed virtual world into the route map.
- `sftpFiles.js` / `sftpTransfer.js` / `sftpRemove.js` — SFTP file operations.
- `client.js` / `callbacks.js` / `posix.js` — outbound SSH client and helpers.
