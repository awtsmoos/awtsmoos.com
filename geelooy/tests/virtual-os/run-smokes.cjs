// B"H
const { spawnSync } = require('child_process');
const path = require('path');
const repoRoot = path.resolve(__dirname, '../../..');
const syntaxFiles = [
  'geelooy/os/graph/events.js', 'geelooy/os/graph/watchers.js', 'geelooy/os/graph/traversal.js', 'geelooy/os/graph/diff.js', 'geelooy/os/graph/transaction.js', 'geelooy/os/graph/registry.js', 'geelooy/os/graph/osGraphSync.js',
  'geelooy/os/input/router.js', 'geelooy/os/windowHandler.js', 'geelooy/os/process/windowBinding.js',
  'geelooy/os/vfs/mounts.js', 'geelooy/os/vfs/permissions.js', 'geelooy/os/vfs/operations.js', 'geelooy/os/vfs/registry.js', 'geelooy/os/vfs/localVirtualAdapter.js', 'geelooy/os/vfs/tunnelAdapter.js', 'geelooy/os/vfs/previewAdapter.js', 'geelooy/os/vfs/mutationEvents.js',
  'geelooy/os/status/osStatus.js', 'geelooy/os/status/diagnosticsPopup.js', 'geelooy/os/ui/toastTags.js', 'geelooy/os/ui/toastCenter.js', 'geelooy/os/session/localFileAccess.js', 'geelooy/os/system.js', 'geelooy/os/awtsmoosOs.js', 'geelooy/os/contextMenuManager.js',
  'geelooy/os/programs/awtsmoos-text/index.js', 'geelooy/os/programs/awtsmoos-binary-viewer/index.js', 'geelooy/os/programs/advanced-code-editor/index.js', 'geelooy/os/programs/open-with-selector/index.js', 'geelooy/os/programs/awtsmoos-diagnostics/index.js',
  'geelooy/os/programs/awtsmoos-command/index.js', 'geelooy/os/programs/awtsmoos-command/commands.js', 'geelooy/os/programs/awtsmoos-command/history.js', 'geelooy/os/programs/awtsmoos-command/renderer.js',
  'geelooy/os/desktop/icons.js', 'geelooy/os/desktop/storage.js', 'geelooy/os/desktop/layout.js', 'geelooy/os/desktop/selection.js', 'geelooy/os/desktop/drag.js', 'geelooy/os/desktop/contextMenu.js', 'geelooy/os/desktop/keyboard.js', 'geelooy/os/desktopSurface.js',
  'geelooy/os/programs/awtsmoos-file-explorer/components/driveShelf.js', 'geelooy/os/programs/awtsmoos-file-explorer/components/fileView.js', 'geelooy/os/programs/awtsmoos-file-explorer/components/fileItem.js', 'geelooy/os/programs/awtsmoos-file-explorer/components/iconItem.js', 'geelooy/os/programs/awtsmoos-file-explorer/components/detailsHeader.js', 'geelooy/os/programs/awtsmoos-file-explorer/components/detailsRow.js', 'geelooy/os/programs/awtsmoos-file-explorer/components/fileItemEvents.js',
  'geelooy/os/programs/awtsmoos-file-explorer/utils/icons.js', 'geelooy/os/programs/awtsmoos-file-explorer/utils/mountClass.js', 'geelooy/os/programs/awtsmoos-file-explorer/utils/dragDrop.js',
  'geelooy/os/programs/awtsmoos-file-explorer/styles/index.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/tokens.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/main.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/navbar.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/sidebar.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/view.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/details.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/badges.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/dialogs.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/driveShelf.js', 'geelooy/os/programs/awtsmoos-file-explorer/styles/responsive.js',
  'geelooy/os/basicPrograms.js', 'geelooy/os/startMenu.js', 'geelooy/os/script.js', 'geelooy/scripts/awtsmoos/social/profileDropdown.js',
  'geelooy/os/tunnel/osAccess.js', 'geelooy/os/tunnel/domSnapshot.js', 'geelooy/os/tunnel/graphHandlers.js', 'geelooy/os/tunnel/vfsHandlers.js', 'geelooy/os/tunnel/desktopHandlers.js', 'geelooy/os/tunnel/handlers.js',
  'geelooy/apps/tunnel/agent/lib/virtualOsGraph/watchers.js', 'geelooy/apps/tunnel/agent/lib/virtualOsGraph/traversal.js', 'geelooy/apps/tunnel/agent/lib/virtualOsGraph/diff.js', 'geelooy/apps/tunnel/agent/lib/virtualOsGraph/transaction.js', 'geelooy/apps/tunnel/agent/lib/virtualOsGraph/registry.js'
];
const smokeTests = [
  esm('geelooy/tests/virtual-os/desktop-xp-smoke.mjs'), esm('geelooy/tests/virtual-os/file-explorer-interaction-smoke.mjs'), esm('geelooy/tests/virtual-os/command-program-smoke.mjs'), esm('geelooy/tests/virtual-os/code-embed-bridge-smoke.mjs'),
  esm('geelooy/tests/virtual-os/graph-browser-smoke.mjs'), esm('geelooy/tests/virtual-os/vfs-mount-smoke.mjs'), cjs('geelooy/tests/virtual-os/server-graph-smoke.cjs'),
  esm('geelooy/tests/virtual-os/tunnel-handlers-smoke.mjs'), esm('geelooy/tests/virtual-os/os-style-sequence-smoke.mjs'), esm('geelooy/tests/virtual-os/file-explorer-icons-smoke.mjs'),
  esm('geelooy/tests/virtual-os/file-explorer-style-smoke.mjs'), esm('geelooy/tests/virtual-os/publish-local-file-smoke.mjs'), esm('geelooy/tests/virtual-os/diagnostics-contract-smoke.mjs')
];
for (const file of syntaxFiles) run({ args:['--check', file] });
for (const test of smokeTests) run(test);
console.log('B"H virtual OS syntax and smoke suite passed');
function esm(file) { return { args:['--no-warnings', file] }; }
function cjs(file) { return { args:[file] }; }
function run(test) { const result = spawnSync(process.execPath, test.args, { cwd:repoRoot, stdio:'inherit', timeout:20000 }); if (result.error) { console.error(result.error.message); process.exit(1); } if (result.status !== 0) process.exit(result.status || 1); }
/** B"H: the suite guards the revived desktop, command, bridge, and explorer vessels. */
