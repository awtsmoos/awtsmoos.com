// B"H
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '../../..');
const fixedSyntax = [
  'geelooy/os/graph/events.js','geelooy/os/graph/watchers.js','geelooy/os/graph/traversal.js','geelooy/os/graph/diff.js','geelooy/os/graph/transaction.js','geelooy/os/graph/registry.js','geelooy/os/graph/osGraphSync.js',
  'geelooy/os/input/router.js','geelooy/os/windowHandler.js','geelooy/os/process/windowBinding.js','geelooy/os/vfs/mounts.js','geelooy/os/vfs/permissions.js','geelooy/os/vfs/operations.js','geelooy/os/vfs/registry.js','geelooy/os/vfs/localVirtualAdapter.js','geelooy/os/vfs/tunnelAdapter.js','geelooy/os/vfs/previewAdapter.js','geelooy/os/vfs/mutationEvents.js',
  'geelooy/os/status/osStatus.js','geelooy/os/status/diagnosticsPopup.js','geelooy/os/ui/toastTags.js','geelooy/os/ui/toastCenter.js','geelooy/os/session/localFileAccess.js','geelooy/os/system.js','geelooy/os/awtsmoosOs.js','geelooy/os/contextMenuManager.js','geelooy/os/basicPrograms.js','geelooy/os/startMenu.js','geelooy/os/script.js','geelooy/scripts/awtsmoos/social/profileDropdown.js',
  'geelooy/os/tunnel/osAccess.js','geelooy/os/tunnel/domSnapshot.js','geelooy/os/tunnel/graphHandlers.js','geelooy/os/tunnel/vfsHandlers.js','geelooy/os/tunnel/desktopHandlers.js','geelooy/os/tunnel/handlers.js','geelooy/apps/tunnel/agent/lib/virtualOsGraph/watchers.js','geelooy/apps/tunnel/agent/lib/virtualOsGraph/traversal.js','geelooy/apps/tunnel/agent/lib/virtualOsGraph/diff.js','geelooy/apps/tunnel/agent/lib/virtualOsGraph/transaction.js','geelooy/apps/tunnel/agent/lib/virtualOsGraph/registry.js'
];
const syntaxFiles = [...fixedSyntax, ...jsFiles('geelooy/os/programs/awtsmoos-command'), ...jsFiles('geelooy/os/desktop'), 'geelooy/os/desktopSurface.js', ...jsFiles('geelooy/os/programs/awtsmoos-file-explorer')];
const smokeTests = ['desktop-xp-smoke.mjs','file-explorer-interaction-smoke.mjs','file-explorer-button-audit-smoke.mjs','command-program-smoke.mjs','code-embed-bridge-smoke.mjs','graph-browser-smoke.mjs','vfs-mount-smoke.mjs','server-graph-smoke.cjs','tunnel-handlers-smoke.mjs','os-style-sequence-smoke.mjs','file-explorer-icons-smoke.mjs','file-explorer-style-smoke.mjs','publish-local-file-smoke.mjs','diagnostics-contract-smoke.mjs'];
for (const file of [...new Set(syntaxFiles)]) run({ args:['--check', file] });
for (const file of smokeTests) run(file.endsWith('.cjs') ? { args:[`geelooy/tests/virtual-os/${file}`] } : { args:['--no-warnings', `geelooy/tests/virtual-os/${file}`] });
console.log('B"H virtual OS syntax and smoke suite passed');
function jsFiles(dir) { const abs = path.join(repoRoot, dir); if (!fs.existsSync(abs)) return []; return fs.readdirSync(abs, { withFileTypes:true }).flatMap(d => { const rel = path.join(dir, d.name); return d.isDirectory() ? jsFiles(rel) : d.isFile() && d.name.endsWith('.js') ? [rel] : []; }); }
function run(test) { const result = spawnSync(process.execPath, test.args, { cwd:repoRoot, stdio:'inherit', timeout:20000 }); if (result.error) { console.error(result.error.message); process.exit(1); } if (result.status !== 0) process.exit(result.status || 1); }
/** B"H: the suite now dynamically guards split Explorer action and toolbar modules. */
