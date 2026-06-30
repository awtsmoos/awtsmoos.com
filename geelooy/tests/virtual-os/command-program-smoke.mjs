// B"H
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
const basic = read('geelooy/os/basicPrograms.js');
if (!basic.includes('awtsmoosCommand')) throw new Error('Command program not registered');
const icons = read('geelooy/os/desktop/icons.js');
if (!icons.includes('Command')) throw new Error('Command desktop icon missing');
const commands = read('geelooy/os/programs/awtsmoos-command/commands.js');
for (const cmd of ['help','pwd','ls','cd','open','clear','whoami','tunnels','read']) if (!commands.includes(cmd)) throw new Error(`command missing ${cmd}`);
console.log('B"H command-program-smoke passed');
