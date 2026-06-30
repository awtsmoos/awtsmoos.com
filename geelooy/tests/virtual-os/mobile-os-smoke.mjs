// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
const basic = read('geelooy/scripts/awtsmoos/ui/basic.js');
for (const term of ['validAttribute','isNode','appendChildren','setAttributes','Node']) assert(basic.includes(term), `basic helper missing ${term}`);
const surface = read('geelooy/os/desktopSurface.js');
for (const term of ['applySafeArea','mobileClass','bindLongPress','isTap','bindRelayout','isMobileDesktop']) assert(surface.includes(term), `desktop surface mobile hook missing ${term}`);
const layout = read('geelooy/os/desktop/layout.js');
for (const term of ['metrics(surface)','pointForIndex','m.cols','m.cellW','m.cellH']) assert(layout.includes(term), `mobile layout missing ${term}`);
const drag = read('geelooy/os/desktop/drag.js');
const overlay = read('geelooy/os/desktop/selectionOverlay.js');
for (const term of ['isMobileDesktop(surface)','createMarquee','event.cancelable','savePositions(positions, drag.mobile)']) assert(drag.includes(term), `mobile drag missing ${term}`);
assert(overlay.includes('desktop-marquee'), 'selection overlay missing desktop-marquee');
const css = ['geelooy/os/styles/os-base.js','geelooy/os/styles/base/mobile.js','geelooy/os/styles/base/desktop.js','geelooy/os/styles/base/icons.js'].map(read).join('\n');
for (const term of ['desktop-mobile','100svh','--desktop-safe-top','touch-action:none','-webkit-tap-highlight-color','desktop-marquee{display:none','min-width:42px']) assert(css.includes(term), `mobile CSS missing ${term}`);
const explorerCss = ['geelooy/os/programs/awtsmoos-file-explorer/styles/future/mobile.js','geelooy/os/programs/awtsmoos-file-explorer/styles/future/toolbar.js'].map(read).join('\n');
for (const term of ['pointer:coarse','grid-template-columns:repeat(4','toolbar-search','min-height:42px','-webkit-overflow-scrolling:touch']) assert(explorerCss.includes(term), `mobile Explorer CSS missing ${term}`);
console.log('B"H mobile-os-smoke passed');
