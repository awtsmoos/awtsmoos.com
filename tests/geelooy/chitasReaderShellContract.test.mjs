// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasReaderShellContractTest
 * @description
 * The Awtsmoos proves a native Chitas post can enter the reader and move day to day without borrowing persisted chapter disguise;
 * Awtsmoos.com guards initial manifestation and canonical date gates so dynamic Torah remains whole before every browser eye.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const paths = {
	nav: 'geelooy/heichelos/post/functions/ui/nav.js',
	chitasNav: 'geelooy/heichelos/post/functions/ui/chitasNav.js',
	shell: 'geelooy/heichelos/post/_awtsmoos.post.html'
};
const sources = Object.fromEntries(await Promise.all(
	Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, 'utf8')])
));

assert.match(sources.shell, /typeof \$\$sd !== ["']undefined["']/);
assert.match(sources.shell, /initial-content\.html/);
assert.match(sources.shell, /postLogic\.js/);
assert.match(sources.nav, /chitasNav\.js\?v=native-chitas-nav-001/);
assert.match(sources.nav, /isChitasNavigation/);
assert.match(sources.nav, /chitasDateFromPostId/);
assert.match(sources.nav, /parameters\.set\('chitasDate'/);
assert.match(sources.nav, /if \(!isChitasNavigation\(series\)\)/);
assert.match(sources.chitasNav, /daily-chitas/);
assert.match(sources.chitasNav, /chitas-\(\\d\{4\}-\\d\{2\}-\\d\{2\}\)/);
assert.match(sources.chitasNav, /Daily Chitas navigation/);
assert.match(sources.chitasNav, /ניווט חת״ת יומי/);

for (const [name, source] of Object.entries(sources)) {
	assert.match(source.slice(0, 100), /B"H/);
	assert.ok(source.split('\n').length - 1 <= 120, `${name} exceeds 120 lines`);
}

globalThis.location = { search: '?chitasLang=en' };
const helper = await import('../../geelooy/heichelos/post/functions/ui/chitasNav.js');
assert.equal(helper.isChitasNavigation({ id: 'daily-chitas' }), true);
assert.equal(helper.chitasDateFromPostId('chitas-2026-09-05'), '2026-09-05');
assert.match(helper.chitasDayLabel(6), /Shabbos/);
console.log('B"H Daily Chitas native reader shell/navigation contract passed.');
