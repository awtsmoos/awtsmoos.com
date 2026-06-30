// B"H
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
for (const file of ['iconItem.js','detailsRow.js','detailsHeader.js','fileItemEvents.js'].map(x => `geelooy/os/programs/awtsmoos-file-explorer/components/${x}`)) if (!fs.existsSync(file)) throw new Error(`${file} missing`);
const row = read('geelooy/os/programs/awtsmoos-file-explorer/components/detailsRow.js');
for (const term of ['data-icon-kind','details-name','role:\'gridcell\'']) if (!row.includes(term)) throw new Error(`details row missing ${term}`);
const item = read('geelooy/os/programs/awtsmoos-file-explorer/components/fileItem.js');
for (const term of ['data-kind','data-path','data-sync-state','data-locality']) if (!item.includes(term)) throw new Error(`file item missing ${term}`);
const events = read('geelooy/os/programs/awtsmoos-file-explorer/components/fileItemEvents.js');
for (const term of ['showExplorerItemMenu','controller.open','keydown']) if (!events.includes(term)) throw new Error(`events missing ${term}`);
const openers = read('geelooy/os/programs/awtsmoos-file-explorer/api/openers.js');
if (!openers.includes('advancedCodeEditor')) throw new Error('openers do not use advancedCodeEditor');
const styles = read('geelooy/os/programs/awtsmoos-file-explorer/styles/details.js') + read('geelooy/os/programs/awtsmoos-file-explorer/styles/view.js');
for (const term of ['text-overflow:ellipsis','white-space:nowrap','details-header']) if (!styles.includes(term)) throw new Error(`overflow/details style missing ${term}`);
console.log('B"H file-explorer-interaction-smoke passed');
