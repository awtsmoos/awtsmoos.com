<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Phase Two — Exact File Map and Twenty Improvements

## Expected files
1. `geelooy/apps/drive/js/api/DrivePrivateContent.js` — new authenticated raw-byte reader.
2. `geelooy/apps/drive/js/api/BeriahEntriesResource.js` — delegate `content(path)` to the reader.
3. `geelooy/shared/embed/driveWorkspaceFile.js` — new shared max-size/payload normalization law.
4. `geelooy/shared/embed/driveWorkspaceCommands.js` — additive `OPEN_DRIVE_FILE` constant/export only; keep runtime recipe contract focused.
5. `geelooy/apps/drive/js/osBridge.js` — generic envelope sender plus `openDriveFile`.
6. `geelooy/apps/drive/js/orchestration/YesodEntryActionRouter.js` — embedded private-file open before browser fallback.
7. `geelooy/os/programs/drive-workspace/fileLauncher.js` — content-aware descriptor/window builder.
8. `geelooy/os/programs/drive-workspace/bridge.js` — dispatch the two supported event types.
9. Small focused tests, each below 120 lines.

## Twenty improvements
1. Use one shared `MAX_DRIVE_WORKSPACE_BYTES` constant.
2. Reject Content-Length above the cap before `arrayBuffer()`.
3. Reject actual body byteLength above the cap afterward.
4. Reject empty files only if current target program cannot represent them; otherwise allow zero-byte text.
5. Bound path to 2048 characters.
6. Bound filename to 512 characters.
7. Bound MIME to 256 characters.
8. Reject NULs in textual metadata.
9. Require `ArrayBuffer` payload testimony at parent boundary.
10. Never accept child-supplied program names.
11. Preserve `cache: 'no-store'` and `credentials: 'same-origin'` on fetch.
12. Reuse transport auth headers instead of reimplementing API-key/bearer logic.
13. Preserve request correlation header via transport.
14. Return structured `{content, mimeType, byteLength, path, name}` testimony from Drive API.
15. Transfer the buffer to parent when browser supports transfer list.
16. If not embedded, do not fetch private bytes just to open externally.
17. If embedded bridge rejects because environment is not trusted, preserve current public-url fallback.
18. If private fetch itself fails, surface the existing Drive guarded error instead of silently publishing/opening a public link.
19. Parent calls existing artifact detector before descriptor creation.
20. Parent returns/records launch testimony for focused tests without exposing OS internals to child.
