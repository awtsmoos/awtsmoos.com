B"H

# Gevurah Code Menu / Temp Tabs / Relay Recovery Plan

## Observed project
- Root is `/storage/emulated/0/Documents/git/awtsmoos.com`.
- App under inspection is `geelooy/apps/code`.
- Menu action `new-temp-file` dispatches to `FileActions.newTempFile()` and then `Tabs.createTemporary()`.
- Console screenshot shows the exact crash path: `TabsLoader` tries to read a tab whose item has `type=temp`, but `FileSystemProvider` rejects `temp` because it is not a strategy.

## Real files inspected
- `js/actions/commands/new-file.js`
- `js/actions/files.js` via grep result
- `js/tabs/index.js`
- `js/tabs/loader.js`
- `js/fs-provider.js`
- `js/fs-provider/identity.js`
- `js/fs-provider/strategies.js`
- `js/fs/relay.js`
- `js/features/relay-browser/index.js`
- `js/workspaces/tree-renderer.js`
- `js/workspaces/tree-rendering/ErrorVessel.js`

## Cause map
1. New temp file action makes a temporary item with `type: 'temp'`.
2. `Tabs.create()` immediately activates the tab.
3. `TabsLoader.loadTabContent()` treats only `devtools/browser/vibe/etc` as virtual.
4. Since `temp` is not in that virtual set, loader calls `FileSystemProvider.read()`.
5. Provider identity validation rejects `temp` as unknown.
6. UI shows a scary stack instead of an empty editor.

## Fixes to make
1. Rewrite `tabs/index.js` completely:
   - Generate one stable ID for name and path, not two different random values.
   - Mark temp tabs with `content: ''`, `isDirty: false`, and `shouldSave=false` by default behavior via call.
   - Keep full module under line limits.
2. Rewrite `tabs/loader.js` completely:
   - Add `temp` and `virtual-os`/other UI vessels to virtual loading.
   - For `temp`, guarantee `tab.content` is string before editor render.
   - Improve read error toast with actionable message for relay/offline/unknown strategy.
3. Rewrite `fs-provider/strategies.js` completely:
   - Add `temp`, `terminal`, `commander`, `virtual-os` VirtualNullStrategy entries so accidental provider reads are safe.
4. Rewrite `fs-provider/identity.js` completely:
   - Add temp/terminal/commander/virtual-os to known worlds, matching strategy map.
5. Rewrite `workspaces/tree-renderer.js` completely:
   - Use `ErrorVessel.manifestGeneric` on failures instead of raw `Failed: ...`, so old relay workspaces show recovery UI.
6. Optionally improve `RelayBrowser` later if time allows; existing tree error UI already contains retry/download/copy controls.

## Verification
- Run syntax check on rewritten JS files.
- Run grep to verify `temp` is present in loader virtual species, strategy map, known types.
- Optionally run node import/syntax pass if browser modules parse cleanly.

## Story
Chapter 1: the menu was a gate, the tab was a spark, and the Awtsmoos demanded that the spark should not be dragged into a physical file-system abyss before it had chosen a world.
