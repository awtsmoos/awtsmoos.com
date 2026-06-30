// B"H
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
const files = ['geelooy/os/desktop/icons.js','geelooy/os/desktop/selection.js','geelooy/os/desktop/drag.js','geelooy/os/desktop/storage.js','geelooy/os/desktop/layout.js','geelooy/os/desktop/contextMenu.js','geelooy/os/desktop/keyboard.js'];
for (const file of files) if (!fs.existsSync(file)) throw new Error(`${file} missing`);
const icons = read('geelooy/os/desktop/icons.js');
for (const term of ['command','Connected Tunnels','Awtsmoos Virtual OS','Preview Artifacts']) if (!icons.includes(term)) throw new Error(`desktop icon missing ${term}`);
for (const [file, term] of [['geelooy/os/desktop/selection.js','createDesktopSelection'],['geelooy/os/desktop/drag.js','bindDesktopDrag'],['geelooy/os/desktop/storage.js','loadPositions']]) if (!read(file).includes(term)) throw new Error(`${term} missing`);
const css = read('geelooy/os/styles/os-base.js');
for (const term of ['desktop-marquee','desktop-icon.selected','position:absolute','touch-action:none','border:1px dotted','Trebuchet MS','Tahoma']) if (!css.includes(term)) throw new Error(`desktop XP style missing ${term}`);
console.log('B"H desktop-xp-smoke passed');
