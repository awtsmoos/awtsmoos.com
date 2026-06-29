// B"H
import { readFileSync } from 'fs';
const status = read('os/status/diagnosticsPopup.js');
const os = read('os/awtsmoosOs.js');
const diag = read('os/programs/awtsmoos-diagnostics/index.js');
for (const needle of ['Local IndexedDB', 'Alias', 'Login status', 'Tunnel status', 'Mounted drives', 'Graph statistics', 'Last sync', 'Pending operations']) assert(status.includes(needle), `diagnostics popup missing ${needle}`);
for (const needle of ['Process manager', 'Graph event stream', 'Mounted adapters', 'VFS registry', 'Drive registry', 'Recent mutations', 'Taskbar state']) assert(diag.includes(needle), `developer diagnostics missing ${needle}`);
for (const needle of ['file.open', 'file.close', 'remote.refresh', 'explorer.refresh', 'recordVfsMutation']) assert(os.includes(needle), `OS graph event path missing ${needle}`);
console.log('B"H diagnostics-contract-smoke passed');
function read(path) { return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
