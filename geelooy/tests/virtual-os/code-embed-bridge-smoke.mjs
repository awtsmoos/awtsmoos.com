// B"H
import fs from 'node:fs';
const bridge = 'geelooy/apps/code/js/os-embed-bridge.js';
if (!fs.existsSync(bridge)) throw new Error('/apps/code os embed bridge missing');
const code = fs.readFileSync(bridge, 'utf8');
for (const term of ['awtsmoos-os:open-file','awtsmoos-os:ready','awtsmoos-os:write']) if (!code.includes(term)) throw new Error(`code bridge missing ${term}`);
const vfs = fs.readFileSync('geelooy/os/programs/advanced-code-editor/vfsBridge.js', 'utf8');
for (const term of ['awtsmoos-os:read','awtsmoos-os:write','awtsmoos-os:list']) if (!vfs.includes(term)) throw new Error(`vfs bridge missing ${term}`);
console.log('B"H code-embed-bridge-smoke passed');
