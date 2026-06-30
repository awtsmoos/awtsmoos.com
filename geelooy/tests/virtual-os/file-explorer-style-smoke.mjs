// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const styles = await import(new URL('os/programs/awtsmoos-file-explorer/styles/index.js', root).href).then(mod => mod.default);
const fileView = read('os/programs/awtsmoos-file-explorer/components/fileView.js');
const iconItem = read('os/programs/awtsmoos-file-explorer/components/iconItem.js');
const detailsRow = read('os/programs/awtsmoos-file-explorer/components/detailsRow.js');
const detailsHeader = read('os/programs/awtsmoos-file-explorer/components/detailsHeader.js');
for (const token of styleNeedles()) assert(styles.includes(token), `explorer unified styles missing ${token}`);
for (const token of componentNeedles()) assert([fileView, iconItem, detailsRow, detailsHeader].some(text => text.includes(token)), `explorer component missing ${token}`);
console.log('B"H file-explorer-style-smoke passed');
function styleNeedles() { return ['--awt-panel','--awt-cyan','backdrop-filter','toolbar-search','file-explorer-body','.icons-view .file-item','details-header','contextMenu','@media(max-width:720px)']; }
function componentNeedles() { return ['data-xp-role','data-xp-frame','aria-selected','xp-badge','xp-status-field','data-column-index']; }
function read(path) { return readFileSync(new URL(path, root), 'utf8'); }
