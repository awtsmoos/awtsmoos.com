// B"H
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const registry = read('os/programs/awtsmoos-file-explorer/api/actions/registry.js');
const toolbar = read('os/programs/awtsmoos-file-explorer/components/toolbar.js');
const runner = read('os/programs/awtsmoos-file-explorer/components/toolbar/commandRunner.js');
const definitions = read('os/programs/awtsmoos-file-explorer/components/toolbar/definitions.js');
const controller = read('os/programs/awtsmoos-file-explorer/api/controller.js');
const search = read('os/programs/awtsmoos-file-explorer/components/toolbar/searchBox.js');
const status = read('os/programs/awtsmoos-file-explorer/components/toolbar/statusStrip.js');
const required = ['newFile','newFolder','import','delete','copy','cut','paste','rename','selectAll','clearSelection','open','edit','preview','copyPath','home','up','back','forward','refresh','icons','details','list','tiles','sortName','sortType','sortStatus','filter','tunnels','mounts','connect','disconnect'];
for (const action of required) { assert(registry.includes(`'${action}'`), `registry missing ${action}`); assert(definitions.includes(`'${action}'`), `toolbar missing ${action}`); }
const wiring = [toolbar, runner, controller, search, status].join('\n');
for (const token of ['registerExplorerActions','controller.command.run','dataset.action','buttonAudit','bindToolbarKeyboard','toolbar-search','toolbar-status']) assert(wiring.includes(token), `button wiring missing ${token}`);
for (const token of ['os.vfs.write','os.vfs.mkdir','os.vfs.remove','os.vfs[clip.action','os.vfs.move','refreshRemoteDrives']) assert(allActionText().includes(token), `VFS action hook missing ${token}`);
assert(countFiles('os/programs/awtsmoos-file-explorer/api/actions') >= 25, 'action modules not split enough');
assert(countFiles('os/programs/awtsmoos-file-explorer/components/toolbar') >= 8, 'toolbar modules not split enough');
console.log('B"H file-explorer-button-audit-smoke passed');
function allActionText() { return files('os/programs/awtsmoos-file-explorer/api/actions').map(read).join('\n'); }
function countFiles(dir) { return files(dir).length; }
function files(dir) { const base = new URL(dir, root); return readdirSync(base, { withFileTypes:true }).flatMap(d => d.isFile() && d.name.endsWith('.js') ? [`${dir}/${d.name}`] : []); }
