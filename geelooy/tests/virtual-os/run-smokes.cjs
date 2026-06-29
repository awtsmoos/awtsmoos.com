// B"H
const { spawnSync } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const syntaxFiles = [
  'os/graph/events.js', 'os/graph/watchers.js', 'os/graph/traversal.js', 'os/graph/diff.js', 'os/graph/transaction.js', 'os/graph/registry.js', 'os/graph/osGraphSync.js',
  'os/input/router.js', 'os/windowHandler.js', 'os/process/windowBinding.js',
  'os/vfs/mounts.js', 'os/vfs/permissions.js', 'os/vfs/operations.js', 'os/vfs/registry.js', 'os/vfs/localVirtualAdapter.js', 'os/vfs/tunnelAdapter.js', 'os/vfs/previewAdapter.js', 'os/vfs/mutationEvents.js',
  'os/status/osStatus.js', 'os/status/diagnosticsPopup.js', 'os/ui/toastTags.js', 'os/ui/toastCenter.js', 'os/session/localFileAccess.js', 'os/system.js', 'os/awtsmoosOs.js', 'os/contextMenuManager.js',
  'os/programs/awtsmoos-text/index.js', 'os/programs/awtsmoos-binary-viewer/index.js', 'os/programs/awtsmoos-file-explorer/components/driveShelf.js', 'os/programs/awtsmoos-file-explorer/components/fileView.js', 'os/programs/awtsmoos-file-explorer/utils/mountClass.js', 'os/programs/awtsmoos-file-explorer/utils/dragDrop.js', 'os/programs/advanced-code-editor/index.js', 'os/programs/open-with-selector/index.js', 'os/programs/awtsmoos-diagnostics/index.js', 'os/basicPrograms.js', 'os/startMenu.js', 'os/script.js',
  'scripts/awtsmoos/social/profileDropdown.js', 'os/tunnel/osAccess.js', 'os/tunnel/domSnapshot.js', 'os/tunnel/graphHandlers.js', 'os/tunnel/vfsHandlers.js', 'os/tunnel/desktopHandlers.js', 'os/tunnel/handlers.js',
  'apps/tunnel/agent/lib/virtualOsGraph/watchers.js', 'apps/tunnel/agent/lib/virtualOsGraph/traversal.js', 'apps/tunnel/agent/lib/virtualOsGraph/diff.js', 'apps/tunnel/agent/lib/virtualOsGraph/transaction.js', 'apps/tunnel/agent/lib/virtualOsGraph/registry.js'
];
const smokeTests = [esm('tests/virtual-os/graph-browser-smoke.mjs'), esm('tests/virtual-os/vfs-mount-smoke.mjs'), cjs('tests/virtual-os/server-graph-smoke.cjs'), esm('tests/virtual-os/tunnel-handlers-smoke.mjs'), esm('tests/virtual-os/os-style-sequence-smoke.mjs'), esm('tests/virtual-os/publish-local-file-smoke.mjs'), esm('tests/virtual-os/diagnostics-contract-smoke.mjs')];
for (const file of syntaxFiles) run({ args:['--check', file] });
for (const test of smokeTests) run(test);
console.log('B"H virtual OS syntax and smoke suite passed');
function esm(file) { return { args:['--no-warnings', file] }; }
function cjs(file) { return { args:[file] }; }
function run(test) { const result = spawnSync(process.execPath, test.args, { cwd:root, stdio:'inherit' }); if (result.status !== 0) process.exit(result.status || 1); }
/** B"H: the suite now guards sequence, identity, publish, diagnostics, VFS, graph, and tunnel exposure. */
