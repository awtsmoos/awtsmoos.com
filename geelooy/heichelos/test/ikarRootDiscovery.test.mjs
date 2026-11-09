//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const createShellRenderer = require('../routes/heichel/shell.js');
const {
	getIkarRootDiscovery
} = require('../routes/heichel/ikarRootDiscovery.js');
const {
	getSpecialTorahDiscovery
} = require('../routes/heichel/specialTorahDiscovery.js');

function mockTemplateRenderer(capture) {
	return async function render(path, vars = {}) {
		if (path.endsWith('/semantic/fallback.html')) {
			capture.discovery = vars.discovery;
			capture.semantic = vars.semantic;
			return '<div data-semantic-fallback></div>';
		}
		if (path.endsWith('/semantic/head.html')) return '<title>Ikar</title>';
		if (path.endsWith('/_awtsmoos.heichel.html')) {
			return JSON.stringify({
				links: vars.discovery?.links?.map(link => link.path) || []
			});
		}
		return '<div></div>';
	};
}

test('canonical Ikar root discovery has nine unique permanent series doors', () => {
	const discovery = getIkarRootDiscovery();
	assert.equal(discovery.links.length, 9);
	assert.equal(new Set(discovery.links.map(link => link.path)).size, 9);
	assert.ok(discovery.links.every(link => link.kind === 'series'));
	assert.ok(discovery.links.every(link => link.path.startsWith('/heichelos/ikar/series/')));
	assert.ok(discovery.links.some(link => link.path.endsWith('/daily-chitas')));
	assert.ok(discovery.links.length >= 8, 'server search threshold must remain satisfied');
});

// B"H 2026-11-09: every card carries a real measured count — sections from
// the live subSeries registration, posts from the packed ∪ native exact
// union (verified 2026-11-09; whole-ikar union 15,438). A stale count must
// fail here, not lie on the page. Re-census when library content changes.
test('every Ikar root card carries a real measured count', () => {
	const byPath = new Map(
		getIkarRootDiscovery().links.map(link => [link.path, link.count])
	);
	assert.equal(byPath.size, 9);
	for (const [path, count] of byPath) {
		assert.equal(typeof count, 'string', `${path} needs a count`);
		assert.ok(count.trim().length > 0, `${path} count must not be empty`);
	}
	assert.equal(byPath.get('/heichelos/ikar/series/theWrittenTorah'), '39 books · 929 chapters');
	assert.equal(byPath.get('/heichelos/ikar/series/theOralTorah'), '7 sections · no posts yet');
	assert.equal(byPath.get('/heichelos/ikar/series/chassidus'), '21 sections · 3,759 posts');
	assert.equal(byPath.get('/heichelos/ikar/series/halacha'), '10 sections · no posts yet');
	assert.equal(byPath.get('/heichelos/ikar/series/midrash'), '1 section · 20 posts');
	assert.equal(byPath.get('/heichelos/ikar/series/kabbalah'), '5 works');
	assert.equal(byPath.get('/heichelos/ikar/series/mussar'), '3 works');
	assert.equal(byPath.get('/heichelos/ikar/series/torah-language-tools'), 'Translation hub & search');
	assert.equal(byPath.get('/heichelos/ikar/series/daily-chitas'), '4 portions · every day');
});

// B"H 2026-11-09: the kabbalah/mussar counts are the works their pages list
// via specialTorahDiscovery (no standalone Kabbalah/Mussar series exists in
// ikar). If that list changes, the card count must change with it.
test('kabbalah and mussar card counts match the works their pages list', async () => {
	const kabbalah = await getSpecialTorahDiscovery({}, 'ikar', 'kabbalah');
	const mussar = await getSpecialTorahDiscovery({}, 'ikar', 'mussar');
	assert.equal(kabbalah.links.length, 5);
	assert.equal(mussar.links.length, 3);
	const byPath = new Map(
		getIkarRootDiscovery().links.map(link => [link.path, link.count])
	);
	assert.equal(byPath.get('/heichelos/ikar/series/kabbalah'), `${kabbalah.links.length} works`);
	assert.equal(byPath.get('/heichelos/ikar/series/mussar'), `${mussar.links.length} works`);
});

test('canonical Ikar root renders without any public API request', async () => {
	let fetchCalls = 0;
	const capture = {};
	const shell = createShellRenderer({
		async fetchAwtsmoos() {
			fetchCalls += 1;
			throw new Error('Ikar root must not reach the network');
		},
		$ga: mockTemplateRenderer(capture)
	});
	const html = await shell.renderHeichelShell('ikar', 'root');
	const rendered = JSON.parse(html);
	assert.equal(fetchCalls, 0);
	assert.equal(capture.discovery.links.length, 9);
	assert.equal(rendered.links.length, 9);
	assert.ok(capture.semantic, 'semantic model should still be produced');
});

test('non-root Heichel still retains live public discovery', async () => {
	let fetchCalls = 0;
	const shell = createShellRenderer({
		async fetchAwtsmoos(path) {
			fetchCalls += 1;
			if (path.includes('/subSeries')) return [];
			if (path.includes('/posts/details')) return [];
			return { name: 'Other Heichel' };
		},
		$ga: mockTemplateRenderer({})
	});
	await shell.renderHeichelShell('other-zero-api-proof', 'root');
	assert.ok(fetchCalls >= 3, 'non-root shell should retain live metadata and discovery');
});

test('Ikar root hero states the true shape: nine sections, not a heichel count', async () => {
	const capture = {};
	const shell = createShellRenderer({
		async fetchAwtsmoos() {
			throw new Error('Ikar root must not reach the network');
		},
		$ga: mockTemplateRenderer(capture)
	});
	await shell.renderHeichelShell('ikar', 'root');
	assert.match(capture.semantic.description, /nine sections/);
	assert.doesNotMatch(capture.semantic.description, /18 heichelos/);
});

// B"H 2026-11-09: the stored midrash prateem promises "Midrash Rabbah and
// its commentaries" but the library holds exactly one section (Rashi on
// Bereshit Rabbah, 20 posts). The shell corrects the copy at render.
test('midrash page description names only the one section that exists', async () => {
	const capture = {};
	const shell = createShellRenderer({
		async fetchAwtsmoos(path) {
			if (path.includes('/subSeries')) return [];
			if (path.includes('/posts/details')) return [];
			if (path.includes('/alias/')) return { name: 'The Entire Torah' };
			if (path.includes('/series/midrash')) {
				return {
					prateem: {
						id: 'midrash',
						name: 'Midrash',
						description: 'Midrashic literature - Midrash Rabbah and its commentaries.',
						author: 'awtsmoos'
					}
				};
			}
			return null;
		},
		$ga: mockTemplateRenderer(capture)
	});
	await shell.renderHeichelShell('ikar', 'midrash');
	assert.match(capture.semantic.description, /Rashi on Bereshit Rabbah/);
	assert.doesNotMatch(capture.semantic.description, /and its commentaries/);
});
