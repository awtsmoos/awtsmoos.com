<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Final Plan — Private Drive Bytes Into Existing OS Intelligence

## Call stack
1. User clicks a file row; `YesodEntryActionRouter.route('open', entry)` receives canonical metadata.
2. Existing folder action router gets first opportunity; folders continue navigating.
3. For an unhandled file, `openDriveFile` is attempted only when the same-origin Geelooy OS embed contract is present.
4. The router asks `api.entries.content(entry.path)` for authenticated private bytes.
5. `DrivePrivateContent` asserts the connection, builds existing encoded entry route with `content=1`, reuses transport auth headers, requests `no-store`/same-origin, validates HTTP status, early Content-Length and final byteLength.
6. Drive sends only `{path,name,mimeType,byteLength,content}` through the existing Drive workspace envelope.
7. Parent bridge validates source window, origin, channel/source/target/kind/type, then normalizes the file testimony again.
8. `fileLauncher` detects artifact identity from supplied content, calls `createWorkspaceLaunchDescriptor`, and opens the existing program through `os.addWindow` without touching VFS.
9. Outside the trusted embed, router preserves current `window.open(publicUrl(...))` fallback.

## Verification
- syntax + exact header/tab/<120 source law for every touched/new JS/test
- focused private-content tests
- shared file-payload normalizer tests
- child bridge tests
- host launch/rejection tests
- existing `driveWorkspaceBridge.test.mjs`
- Drive contract tests if present
- `git diff --check` limited to this wave
- full reread and planned-vs-actual ledger
