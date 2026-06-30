// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
const desktopCss = read('geelooy/os/styles/base/desktop.js');
const iconCss = read('geelooy/os/styles/base/icons.js');
const mobileCss = read('geelooy/os/styles/base/mobile.js');
for (const term of ['--desktop-wallpaper','desktop-search-overlay','data-page-label','data-wallpaper-label']) assert(desktopCss.includes(term), `desktop css missing ${term}`);
for (const term of ['desktop-icon-badge','desktop-locked','transition:transform']) assert(iconCss.includes(term), `icon css missing ${term}`);
for (const term of ['desktop-search-box','prefers-reduced-motion']) assert(mobileCss.includes(term), `mobile css missing ${term}`);
const pages = read('geelooy/os/desktop/pages.js'), wallpaper = read('geelooy/os/desktop/wallpaper.js');
const search = read('geelooy/os/desktop/searchOverlay.js'), diagnostics = read('geelooy/os/desktop/diagnostics.js');
for (const term of ['DESKTOP_PAGES','filterDesktopItems','currentPageLabel']) assert(pages.includes(term), `pages missing ${term}`);
for (const term of ['WALLPAPERS','applyWallpaper(surface, desktop','nextWallpaperTheme']) assert(wallpaper.includes(term), `wallpaper missing ${term}`);
for (const term of ['openDesktopSearch','desktop-search-result','Escape']) assert(search.includes(term), `search missing ${term}`);
for (const term of ['desktopDiagnostics','copyDesktopDiagnostics','selectedCount']) assert(diagnostics.includes(term), `diagnostics missing ${term}`);
console.log('B"H desktop-environment-smoke passed');
