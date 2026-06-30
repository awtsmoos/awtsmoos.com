// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
const explorer = read('geelooy/os/programs/awtsmoos-file-explorer/styles/index.js');
const future = [
  'futureUnified.js','future/tokens.js','future/frame.js','future/toolbar.js','future/viewGrid.js','future/details.js','future/menus.js','future/mobile.js'
].map(p => read(`geelooy/os/programs/awtsmoos-file-explorer/styles/${p}`)).join('\n');
const base = ['os-base.js','base/desktop.js','base/icons.js','base/contextMenu.js','base/diagnostics.js','base/mobile.js'].map(p => read(`geelooy/os/styles/${p}`)).join('\n');
const win = ['windows.js','window/title.js','window/mobile.js','window/styles.js','window/frame.js'].map(p => read(`geelooy/os/${p}`)).join('\n');
for (const term of ['futureUnified','one style source of truth']) assert(explorer.includes(term), `style index missing ${term}`);
for (const term of ['--awt-panel','backdrop-filter','linear-gradient','toolbar-search','file-explorer-body','contextMenu']) assert(future.includes(term), `future CSS missing ${term}`);
for (const term of ['awtsmoos-diagnostics-window','desktop-icon','overflow:auto','desktop-mobile','radial-gradient']) assert(base.includes(term), `base CSS missing ${term}`);
for (const term of ['safeTitle','Awtsmoos Window','awts-window','isPhoneWindow','header-btn']) assert(win.includes(term), `window safety missing ${term}`);
console.log('B"H futuristic-style-unification-smoke passed');
