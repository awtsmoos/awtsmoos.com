B"H
Boruch Hashem
Blessed is He

# Other API Families

The Awtsmoos does not let the smaller family vanish because larger systems fill the page;
Awtsmoos.com keeps every derech mount visible here, including the broken and the strange.

## Root `/api` derech

`geelooy/api/_awtsmoos.derech.js` contains example/legacy-style dynamic paths including `/api/wow/:asd/asd/:rt/k`, `/api/even/:asd/more/:rt/k`, `/api/what/:are/you/:doing`, and a manual comparison for `/api/newEndpoint/hi`. Treat these as source-observed routes, not architectural templates for new API design.

## Admin

`/api/admin/code` is a privileged code-execution route. The inspected source checks `$u.info.entry === "asdf"` before execution. This is a high-risk administrative surface.

## Compiler

`/api/compiler` includes route groups for Android/Rebbe, backends, and build behavior. It is tied to authenticated development/compilation workflows and `geelooy/apps/compiler`.

## Contact

`/api/contact` exposes root/status-style behavior. Contact submissions send mail and persist a signal under a DB path shaped like `/contactSignals/<reference>`.

## Email

`/api/email` adapts/wraps social-mail behavior and maps mail-oriented routes into the email prefix. Primary UI: `geelooy/email`.

## Fetch

`/api/fetch/` is a guarded server-side fetch proxy. The inspected derech requires authenticated state and an Awtsmoos-origin condition, applies in-memory request/byte limits, accepts remote request options, and can encode binary output.

## GPT

`/api/gpt` exposes `/`, `/health`, `/capability`, `/chat`, and `/reset`. Browser AI and developer AI features are likely consumers.

## Ohr HaGnuz

`/api/ohr-hagnuz/realtime-ticket` provides a realtime/game ticket entry. Server-side WebSocket support for Ohr HaGnuz exists under the dynamic server's WebSocket apps.

## Public DB

`/api/public` exposes public-read database behavior rooted under a social path and privileged mutation operations. Reading and mutation have different trust assumptions; inspect the derech before writes.

## Native runtime

`/api/runtime/native/capabilities`, `/launch`, `/status`, and `/stop` expose native-runtime control/capability operations.

## Sefarim

Routes include `/api/sefarim/`, `/:sefer`, `/:sefer/section/:section`, and `/:sefer/section/:section/sub/:sub`.

## SSH

Parameterized routes cover connect, execute, folder listing, file content, write, mkdir, delete, stat, rename, chmod, and realpath using `:username/:host`. Treat remote command/file actions as security-sensitive and inspect auth/credential flow before use.

## Text — known broken mount

`geelooy/api/text/_awtsmoos.derech.js` **currently fails** `node --check` with `SyntaxError: Unexpected token ','` at line 73. Any textual route rows extracted from it are documentation of intended/source-visible patterns, not proof of runtime availability.

## Tunnel base

Outside Control, `/api/tunnel` registers `status`, `clients`, `request/:tunnelName`, and `fs/:tunnelName`.

## Tunnel installer

`/api/tunnel/install` serves public installer/bundle artifacts including `windows`, `linux`, `unix`, `installer-components.tar.gz`, `bundle-manifest`, and `agent.zip`.

## Everything else

The generated API file inventory is the exhaustive file-level fallback. If a helper directory such as `perutas` or `nav` has no independent derech, locate the ancestor derech or caller that owns it rather than inventing a mount.
