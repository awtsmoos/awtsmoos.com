// B"H
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
for (const file of ['iconItem.js','detailsRow.js','detailsHeader.js','fileItemEvents.js'].map(x => `geelooy/os/programs/awtsmoos-file-explorer/components/${x}`)) if (!fs.existsSync(file)) throw new Error(`${file} missing`);
const row = read('geelooy/os/programs/awtsmoos-file-explorer/components/detailsRow.js');
for (const term of ['data-icon-kind','details-name','role:\'gridcell\'','aria-selected','xp-status-field']) if (!row.includes(term)) throw new Error(`details row missing ${term}`);
const icon = read('geelooy/os/programs/awtsmoos-file-explorer/components/iconItem.js');
for (const term of ['data-xp-role','aria-selected','xp-badge']) if (!icon.includes(term)) throw new Error(`icon item missing ${term}`);
const events = read('geelooy/os/programs/awtsmoos-file-explorer/components/fileItemEvents.js');
for (const term of ['showExplorerItemMenu','controller.open','keydown','F2','focus-ring']) if (!events.includes(term)) throw new Error(`events missing ${term}`);
const openers = read('geelooy/os/programs/awtsmoos-file-explorer/api/openers.js');
if (!openers.includes('advancedCodeEditor')) throw new Error('openers do not use advancedCodeEditor');
const styles = read('geelooy/os/programs/awtsmoos-file-explorer/styles/details.js') + read('geelooy/os/programs/awtsmoos-file-explorer/styles/view.js');
for (const term of ['text-overflow:ellipsis','white-space:nowrap','details-header']) if (!styles.includes(term)) throw new Error(`overflow/details style missing ${term}`);
console.log('B"H file-explorer-interaction-smoke passed');
