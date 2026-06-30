// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
const modules = ['modes','layout','storage','shortcuts','pages','wallpaper','badges','searchOverlay','templates','diagnostics','lockMode','accessibility','notifications','iconNode','environment'];
for (const name of modules) assert(fs.existsSync(`geelooy/os/desktop/${name}.js`), `${name} module missing`);
const modes = read('geelooy/os/desktop/modes.js');
const layout = read('geelooy/os/desktop/layout.js');
const storage = read('geelooy/os/desktop/storage.js');
const surface = read('geelooy/os/desktopSurface.js');
const icons = read('geelooy/os/desktop/icons.js');
const menu = read('geelooy/os/desktop/contextMenu.js');
for (const term of ['grid','free','office','nextDesktopMode','modeLabel']) assert(modes.includes(term), `modes missing ${term}`);
for (const term of ['getDesktopMode','office','free','snap','clamp','avoidCollisions']) assert(layout.includes(term), `layout missing ${term}`);
for (const term of ['desktop:icon-positions','getDesktopMode','phone']) assert(storage.includes(term), `storage missing ${term}`);
for (const term of ['addDesktopShortcut','prepareDesktopSurface','createDesktopIconNode','bindDesktopAccessibility']) assert(surface.includes(term), `surface missing ${term}`);
for (const term of ['loadShortcuts','pinAllPages','badge','page']) assert(icons.includes(term), `icons missing ${term}`);
for (const term of ['Search desktop','Wallpaper:','Copy Desktop Diagnostics','Install developer template','Lock desktop']) assert(menu.includes(term), `menu missing ${term}`);
console.log('B"H desktop-modes-shortcuts-smoke passed');
