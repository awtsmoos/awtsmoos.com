// B"H
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '../..');
const moduleDir = path.join(root, 'scripts/awtsmoos/social/home/live-feed');
const modules = ['api.js', 'cards.js', 'controller.js', 'dom.js', 'graphBridge.js', 'inspector.js', 'normalize.js', 'state.js'];

const entry = read('scripts/awtsmoos/social/home/liveFeed.js');
assert(entry.includes("./live-feed/controller.js"), 'entry should delegate to split controller');
assert(!entry.includes('getCivilizationState'), 'entry must not import missing platform civilization exports');

for (const file of modules) {
  const source = fs.readFileSync(path.join(moduleDir, file), 'utf8');
  assert(source.startsWith('// B"H'), `${file} should retain B"H header`);
  assert(source.split(/\r?\n/).length <= 120, `${file} should stay below 120 lines`);
}

const api = read('scripts/awtsmoos/social/home/live-feed/api.js');
assert(api.includes('civilization/feed/'), 'api should call civilization feed route');
assert(api.includes('civilization/entities/'), 'api should call entity state route');

const commandCss = read('style/social/home/civilization/command.css');
assert(commandCss.includes('grid-template-columns: 1fr'), 'command form should be one column');
assert(commandCss.includes('grid-column: 1 / -1'), 'label should span the command grid');

const wrapper = read('style/social/home/civilization-dashboard.css');
assert(wrapper.includes('./civilization/index.css'), 'old dashboard import should delegate to split CSS');

console.log('B"H home live feed split smoke passed');

function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
