// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChitasReaderShellContractTest
 * @description
 * The Awtsmoos proves Daily Chitas enters the current server-manifested reader while day navigation keeps its native name;
 * Awtsmoos.com guards the fifth runtime, sixth reader garment, and second social gate so stale caches cannot veil the Torah flame.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const paths = {
	nav: 'geelooy/heichelos/post/functions/ui/nav.js',
	chitasNav: 'geelooy/heichelos/post/functions/ui/chitasNav.js',
	shell: 'geelooy/heichelos/post/_awtsmoos.post.html'
};
const sources = Object.fromEntries(await Promise.all(
	Object.entries(paths).map(async ([key, path]) => [
		key,
		await readFile(path, 'utf8')
	])
));

assert.match(sources.shell, /initialContentHtml/);
assert.match(sources.shell, /postSemanticHead/);
assert.match(sources.shell, /id="realPost"/);
assert.match(sources.shell, /postLogic\.js\?v=reader-runtime-005/);
assert.match(sources.shell, /main\.css\?v=reader-chitas-006/);
assert.match(sources.shell, /register\.js\?v=reader-social-002/);
assert.match(sources.shell, /critical-shell\.css\?v=reader-mobile-005/);
assert.doesNotMatch(sources.shell, /postLogic\.js\?v=reader-runtime-004/);
assert.doesNotMatch(sources.shell, /main\.css\?v=reader-chitas-005/);
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
	assert.match(source.slice(0, 140), /B"H/);
	assert.ok(
		source.split('\n').length - 1 <= 120,
		`${name} exceeds 120 lines`
	);
}

globalThis.location = {
	search: '?chitasLang=en'
};
const helper = await import(
	'../../geelooy/heichelos/post/functions/ui/chitasNav.js'
);
assert.equal(helper.isChitasNavigation({ id: 'daily-chitas' }), true);
assert.equal(
	helper.chitasDateFromPostId('chitas-2026-09-05'),
	'2026-09-05'
);
assert.match(helper.chitasDayLabel(6), /Shabbos/);
console.log('B"H Daily Chitas second-generation reader shell/navigation contract passed.');
