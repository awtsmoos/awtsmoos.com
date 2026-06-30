// B"H
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
const basic = read('geelooy/os/basicPrograms.js');
if (!basic.includes('awtsmoosCommand')) throw new Error('Command program not registered');
const icons = read('geelooy/os/desktop/icons.js');
if (!icons.includes('Command')) throw new Error('Command desktop icon missing');
const commands = read('geelooy/os/programs/awtsmoos-command/commands.js');
const parser = read('geelooy/os/programs/awtsmoos-command/parser.js');
const renderer = read('geelooy/os/programs/awtsmoos-command/renderer.js');
const required = ['help','pwd','ls','ll','tree','cd','mkdir','touch','rm','mv','cp','cat','head','tail','grep','find','stat','open','edit','history','clear','exit','mounts','tunnels','connect','disconnect','reload','refresh','whoami','hostname','date','time','echo','env','read','write','json','preview','search'];
for (const cmd of required) if (!parser.includes(`'${cmd}'`) || !commands.includes(`cmd === '${cmd}'`)) throw new Error(`command missing ${cmd}`);
for (const term of ['os.vfs','vfs().write','mutate(\'mkdir\'','mutate(\'remove\'','vfs()[method]','refreshRemoteDrives','globalThis.location']) if (!commands.includes(term)) throw new Error(`command safety hook missing ${term}`);
for (const term of ['ArrowUp','ArrowDown','ctrlKey','Tab','complete?.','aria-live']) if (!renderer.includes(term)) throw new Error(`renderer interaction missing ${term}`);
console.log('B"H command-program-smoke passed');
