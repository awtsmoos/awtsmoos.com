// B"H
/** Verifies the shared UI helper is browser-native, modular, and game-free. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const files = [
	'geelooy/scripts/awtsmoos/ui/index.js',
	'geelooy/scripts/awtsmoos/ui/core/registry.js',
	'geelooy/scripts/awtsmoos/ui/core/elementOptions.js',
	'geelooy/scripts/awtsmoos/ui/core/children.js',
	'geelooy/scripts/awtsmoos/ui/core/actions.js'
];
const sources = Object.fromEntries(files.map(file => [file, readFileSync(file, 'utf8')]));
const entry = sources[files[0]];

for (const [file, source] of Object.entries(sources)) {
	assert.ok(source.includes('B"H'), `${file} missing B"H header`);
	assert.ok(source.split('\n').length <= 120, `${file} exceeds 120 lines`);
	assert.ok(!source.includes('/games/'), `${file} must not import game code`);
}
for (const token of ['html(options', 'setHtml(element', 'getHtml(shaym', 'htmlAction(options', '$h(options', '$ha(options', '$g(shaym', 'peula(']) {
	assert.ok(entry.includes(token), `UI compatibility surface missing ${token}`);
}
for (const module of ['./core/actions.js', './core/children.js', './core/elementOptions.js', './core/registry.js']) {
	assert.ok(entry.includes(module), `UI entry missing ${module}`);
}
console.log('B"H uiContract.test passed');
