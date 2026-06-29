// B"H
import { readFileSync } from 'fs';
const read = p => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const checks = [
  ['os/session/localFileAccess.js', ['/fileSystem/makeFile', 'binaryData', 'FormData', 'URLSearchParams', 'metadataFor', 'file.publish', 'pendingOperations', 'readFile?']],
  ['os/system.js', ['os?.vfs?.write', 'file.save', 'showToast']],
  ['os/contextMenuManager.js', ['os.vfs.read', 'os.vfs.move', 'os.vfs.remove', 'os.vfs[os.clipboard.action', 'publishLocalFile']],
  ['os/programs/awtsmoos-file-explorer/components/fileView.js', ['os.vfs.list', 'os.vfs.read', 'mountBadge', 'data-path']],
  ['os/programs/awtsmoos-file-explorer/utils/dragDrop.js', ['os.vfs.move', 'processNativeFiles']],
  ['os/status/osStatus.js', ['openDiagnosticsPopup', 'data-diagnostics', 'renderStatusPill(status, os)']],
  ['os/ui/toastCenter.js', ['progress', 'detailsNode', 'toast-count']],
  ['os/awtsmoosOs.js', ['file.open', 'file.close', 'remote.refresh', 'recentMutations', 'pendingOperations']],
  ['os/vfs/mutationEvents.js', ['file.write', 'file.mkdir', 'file.remove', 'mount.mount', 'mount.unmount']],
  ['os/programs/awtsmoos-diagnostics/index.js', ['Process manager', 'Graph event stream', 'Mounted adapters', 'Taskbar state']],
  ['scripts/awtsmoos/social/profileDropdown.js', ['awtsmoosLogin', 'awtsmoosLogout', 'awtsmoosAliasChange']],
  ['os/script.js', ['alias.change', 'login', 'logout']]
];
for (const [file, needles] of checks) { const body = read(file); for (const needle of needles) assert(body.includes(needle), `${file} missing ${needle}`); }
assert(!read('os/system.js').includes('os?.db.Koysayv'), 'System.save must not write DB directly');
assert(!read('os/contextMenuManager.js').includes('os.db'), 'context menu must not use os.db directly');
assert(!read('os/programs/awtsmoos-file-explorer/components/fileView.js').includes('os.db'), 'file view must not use os.db directly');
console.log('B"H os-style-sequence-smoke passed');
function assert(condition, message) { if (!condition) throw new Error(message); }
