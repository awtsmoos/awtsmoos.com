// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const styles = await import(new URL('os/programs/awtsmoos-file-explorer/styles/index.js', root).href).then(mod => mod.default);
const fileView = read('os/programs/awtsmoos-file-explorer/components/fileView.js');
const iconItem = read('os/programs/awtsmoos-file-explorer/components/iconItem.js');
const detailsRow = read('os/programs/awtsmoos-file-explorer/components/detailsRow.js');
const detailsHeader = read('os/programs/awtsmoos-file-explorer/components/detailsHeader.js');
for (const token of styleNeedles()) assert(styles.includes(token), `explorer XP styles missing ${token}`);
for (const token of componentNeedles()) assert([fileView, iconItem, detailsRow, detailsHeader].some(text => text.includes(token)), `explorer XP component missing ${token}`);
for (const file of guardedSmallFiles()) assertLineBudget(file, 120);
console.log('B"H file-explorer-style-smoke passed');
function styleNeedles() { return ['--awts-xp-cream','--awts-xp-blue-hot','border:2px outset','border:2px inset','Tahoma','xp-badge','xp-status-field','data-xp-frame','semantic-empty-state','.icons-view .file-item','@media(prefers-reduced-motion:reduce)']; }
function componentNeedles() { return ['data-xp-role','data-xp-frame','aria-selected','xp-badge','xp-status-field','data-column-index']; }
function guardedSmallFiles() { return ['os/programs/awtsmoos-file-explorer/styles/main.js','os/programs/awtsmoos-file-explorer/styles/view.js','os/programs/awtsmoos-file-explorer/styles/sidebar.js','os/programs/awtsmoos-file-explorer/components/fileView.js','os/programs/awtsmoos-file-explorer/components/iconItem.js','os/programs/awtsmoos-file-explorer/components/detailsRow.js']; }
function assertLineBudget(path, max) { const count = read(path).split('\n').length; assert(count <= max, `${path} has ${count} lines, over ${max}`); }
function read(path) { return readFileSync(new URL(path, root), 'utf8'); }
