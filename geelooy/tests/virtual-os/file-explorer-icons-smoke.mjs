// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const iconsUrl = new URL('os/programs/awtsmoos-file-explorer/utils/icons.js', root);
const sidebar = read('os/programs/awtsmoos-file-explorer/components/sidebar.js');
const fileView = read('os/programs/awtsmoos-file-explorer/components/fileView.js');
const icons = read('os/programs/awtsmoos-file-explorer/utils/icons.js');
const mod = await import(iconsUrl.href);

assert.match(sidebar, /\.\.\/utils\/icons\.js/, 'sidebar must import the served icon route');
assert.match(fileView, /\.\.\/utils\/icons\.js/, 'file view must import the served icon route');
assert.match(icons, /awts-icon/, 'icon helper must expose stable styled classes');
assert.equal(typeof mod.getChevronIcon, 'function');
assert.equal(typeof mod.getIconForName, 'function');
assert.match(mod.getIconForName('index.html'), /awts-icon-html/);
assert.match(mod.getIconForName('style.css'), /awts-icon-css/);
assert.match(mod.getIconForName('script.js'), /awts-icon-js/);
assert.match(mod.getIconForName('desktop.folder', true), /awts-icon-folder/);

console.log('B"H file-explorer-icons-smoke passed');

function read(path) { return readFileSync(new URL(path, root), 'utf8'); }
