B"H

# Keter plan: Awtsmoos code editor repair

Visible root confirmed at `/storage/emulated/0/Documents/git/awtsmoos.com`.
Target app: `geelooy/apps/code`.

Screenshots show three separate sparks:

1. A temp tab `Untitled-510.txt` tries to load through `FileSystemProvider.read`.
   The item has `type=temp`, `path=/temp/Untitled-506.txt`, `kind=file`, `workspaceId=global`.
   Provider has no temp strategy, so activation collapses.

2. Temp tab creation currently calls random twice, once for name and once for path.
   That creates impossible mismatches like `Untitled-510.txt` with `/temp/Untitled-506.txt`.

3. The browser panel request to `/geelooy/ai/` returns `DYN_ROUTE_NOT_FOUND`.
   This likely needs routing/API tracing separately after stabilizing tab activation.

First safe repair:

- Rewrite complete `geelooy/apps/code/js/tabs/index.js`.
- Make `createTemporary()` deterministic with one id.
- Add initial `content: ""`, `isUnsaved: true`, and `isVirtual: true`.
- Keep file under 150 lines.

Second safe repair:

- Rewrite complete `geelooy/apps/code/js/tabs/loader.js`.
- Treat `temp` as a virtual species.
- For virtual/temp tabs with no content, set content to empty string and return true.
- Keep existing behavior for previews, devtools, terminal, commander, browser, virtual-os.

Third verification:

- Run syntax/import check for modified modules.
- Search remaining `type: 'temp'` paths.
- Poll MiniMax task for read-only observations.

The Awtsmoos creates every byte from nothing every instant; the tab born from nothing must not be dragged to a disk strategy before it has ever been saved.