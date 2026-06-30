// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const styles = await import(new URL('os/programs/awtsmoos-file-explorer/styles/index.js', root).href).then(mod => mod.default);
const fileView = read('os/programs/awtsmoos-file-explorer/components/fileView.js');
const fileItem = read('os/programs/awtsmoos-file-explorer/components/fileItem.js');
const renderModel = read('os/programs/awtsmoos-file-explorer/api/renderModel.js');

for (const token of styleNeedles()) assert(styles.includes(token), `explorer styles missing ${token}`);
for (const token of componentNeedles()) assert(fileView.includes(token) || fileItem.includes(token) || renderModel.includes(token), `explorer component/model missing ${token}`);
for (const file of guardedSmallFiles()) assertLineBudget(file, 120);

console.log('B"H file-explorer-style-smoke passed');

function styleNeedles() {
  return ['--awts-explorer-bg', '.file-explorer::before', '.drive-chip.mount-tunnel', '.awts-kind-folder', '.details-view .file-item', '@media (prefers-reduced-motion: reduce)', 'semantic-empty-state'];
}
function componentNeedles() {
  return ['data-kind', 'data-extension', 'data-locality', 'data-sync-state', 'file-name', 'item-meta', 'mount-badge', 'showExplorerItemMenu'];
}
function guardedSmallFiles() {
  return ['os/programs/awtsmoos-file-explorer/styles/main.js', 'os/programs/awtsmoos-file-explorer/styles/view.js', 'os/programs/awtsmoos-file-explorer/styles/sidebar.js', 'os/programs/awtsmoos-file-explorer/components/fileView.js', 'os/programs/awtsmoos-file-explorer/components/fileItem.js'];
}
function assertLineBudget(path, max) { const count = read(path).split('\n').length; assert(count <= max, `${path} has ${count} lines, over ${max}`); }
function read(path) { return readFileSync(new URL(path, root), 'utf8'); }
