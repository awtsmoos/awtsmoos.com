<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Phase One — Boundless Drive Workspace Smart Open

The Awtsmoos renews every byte without confusing its vessel; Awtsmoos.com should let one private Drive file become the correct OS workspace window without leaking authority, creating a public link, or pretending a server path is a VFS path.

## Goal
When Drive is embedded in Geelooy OS, opening a private file should privately fetch its bytes through the existing authenticated Drive entry route and hand only bounded file testimony to the existing same-origin workspace channel. The parent OS remains the authority that classifies the file and selects editor, preview, binary viewer, or executable inspection vessel.

## Existing truths to preserve
- Folder `open` stays internal Drive navigation.
- Non-OS Drive keeps the current public-url browser fallback.
- `GET /drive/:alias/entry/:path?content=1` already provides authenticated private raw content with metering, MIME, Content-Length, range support, and `private, no-store`.
- `KeterDriveTransport` already owns connection/auth headers.
- The Drive workspace message channel already validates same-origin source, direction, kind, source id, target id, and channel id.
- `createWorkspaceLaunchDescriptor` already maps file kinds to mature OS programs.
- Drive paths are server-backed and must never be passed into `os.vfs.read`.
- Credentials/auth headers never cross `postMessage`.

## Broad implementation possibilities
- Add a raw-content method to the entry resource using existing transport authority.
- Split raw content fetching into a dedicated API helper if the resource file approaches 120 lines.
- Add one additive `OPEN_DRIVE_FILE` event constant to the existing command covenant.
- Put file-payload normalization in its own small shared module so runtime recipe law stays readable.
- Bound path/name/MIME lengths and bytes.
- Choose a conservative maximum postMessage transfer size; 8 MiB gives editors/previews room without turning iframe messaging into a bulk-transfer pipe.
- Reject a declared Content-Length above the bound before reading the body.
- Re-check actual ArrayBuffer length after download.
- Transfer ArrayBuffer as a transferable when available so bytes are moved rather than duplicated.
- Parent validates the file payload again before any window opens.
- Parent computes descriptor/program itself; child cannot name `programName`.
- Parent detects artifact identity from content using existing workspace detection utility.
- Parent opens with `os.addWindow` directly from supplied content, never VFS.
- Executable-looking Drive content follows existing descriptor intent/host rules; no arbitrary execution command is accepted from child.
- Add small tests for payload normalization, raw fetch, child bridge, and parent launch/rejection.
- Keep every new/touched JS/test source under 120 lines with exact blessing header and tabs.
