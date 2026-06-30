// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const status = read('os/status/diagnosticsPopup.js');
const os = read('os/awtsmoosOs.js');
const diag = read('os/programs/awtsmoos-diagnostics/index.js');

for (const needle of statusNeedles()) assert.match(status, needle.pattern, needle.message);
for (const needle of developerNeedles()) assert(diag.includes(needle), `developer diagnostics missing ${needle}`);
for (const needle of graphNeedles()) assert(os.includes(needle), `OS graph event path missing ${needle}`);

assertNoBrokenNewlineEscapes(status);
console.log('B"H diagnostics-contract-smoke passed');

function statusNeedles() {
  return ['Local IndexedDB', 'Alias', 'Login status', 'Tunnel status', 'Mounted drives', 'Graph statistics', 'Last sync', 'Pending operations']
    .map(text => ({ pattern: new RegExp(escapeRegExp(text)), message: `diagnostics popup missing ${text}` }));
}

function developerNeedles() {
  return ['Process manager', 'Graph event stream', 'Mounted adapters', 'VFS registry', 'Drive registry', 'Recent mutations', 'Taskbar state'];
}

function graphNeedles() {
  return ['file.open', 'file.close', 'remote.refresh', 'explorer.refresh', 'recordVfsMutation'];
}

function assertNoBrokenNewlineEscapes(source) {
  assert(!source.includes("join('\\n\n')"), 'diagnostics popup split a quoted newline join across source lines');
  assert(!source.includes('objects\n${graphHistory.length} recent events'), 'diagnostics popup split graph statistics across source lines');
  assert.match(source, /join\('\\n'\)/, 'diagnostics popup must join visible evidence lines with escaped newlines');
}

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
