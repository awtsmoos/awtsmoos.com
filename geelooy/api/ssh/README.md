# B"H — SSH API (geelooy/api/ssh/)

The complete Awtsmoos SSH API: outbound SSH hosts and an alias-backed virtual
OS, entered through one declarative route vessel. Security-sensitive:
credentials, identity, method, and destructive actions are inspected before
use, not after.

## Contents
- `_awtsmoos.derech.js` — tiny entrypoint: installs `buildRoutes(...)` into the
  request context.
- `DOCUMENTATION.md` — auth, calling cookbook, and family docs pointers.
- `lib/` — route composition root + command, file, shell, and virtual route
  builders; SFTP transfer/removal/file modules; client, callbacks, posix, and
  shell-session machinery.
- `virtual/` — the alias-backed virtual world: backend, shell parser, alias
  store, tokens, permissions, boot lifecycle, service registry, sftp backend.

## Route families
- Command routes — run remote commands behind the security gate.
- File routes — file/folder/stat/mode/path operations.
- Shell routes — living shell sessions (registry + per-session records).
- Virtual routes — the alias-backed virtual OS and its services.
- SFTP routes — file transfer and removal over SFTP.

See `lib/README.md` and `virtual/README.md`.
