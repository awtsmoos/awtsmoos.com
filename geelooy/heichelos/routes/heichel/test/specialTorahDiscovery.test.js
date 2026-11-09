//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file specialTorahDiscovery.test.js
 * @description
 * The Awtsmoos proves that public Torah aliases reveal only their rightful source light;
 * Awtsmoos.com keeps Kabbalah whole, Mussar bounded, and language tools useful before the browser takes flight.
 *
 * B"H 2026-11-09: discovery is data-based, not search-based — the search
 * system is gone. Every listed link was verified present in the live library
 * data (packed allPosts index + native series store, 2026-11-09). No test
 * here may invent a series: paths must be real series or posts.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { getSpecialTorahDiscovery } = require('../specialTorahDiscovery.js');

function failingServer() {
	return {
		fetchAwtsmoos: async () => {
			throw new Error('discovery must not call the network');
		}
	};
}

test('kabbalah lists only works verified present in the library data', async () => {
	const discovery = await getSpecialTorahDiscovery(failingServer(), 'ikar', 'kabbalah');

	assert.deepEqual(discovery.links.map(link => link.path), [
		'/heichelos/ikar/series/ayinBeisVolume1',
		'/heichelos/ikar/series/ayinBeisVolume2',
		'/heichelos/ikar/series/tanyaShaarHaYichud',
		'/heichelos/ikar/series/encyclopedia/post/encyclopedia-zohar',
		'/heichelos/ikar/series/encyclopedia/post/encyclopedia-sefer-yetzirah'
	]);
	assert.equal(discovery.links[0].title, 'Ayin Beis, Volume 1 · עין בי״ת, חלק ראשון');
	assert.equal(discovery.links[3].kind, 'post');
	assert.match(discovery.note, /does not yet hold a standalone Kabbalah sefer/u);
});

test('mussar lists no classic mussar sefer because none exists in the data', async () => {
	const discovery = await getSpecialTorahDiscovery(failingServer(), 'ikar', 'mussar');

	assert.deepEqual(discovery.links.map(link => link.path), [
		'/heichelos/ikar/series/tanyaLikkuteiAmarim',
		'/heichelos/ikar/series/tanyaIgeresHaKodesh',
		'/heichelos/ikar/series/tanyaKuntresAcharon'
	]);
	for (const link of discovery.links) {
		assert.doesNotMatch(link.path, /mesillas|chovos|orchos|shaarei-teshuva|nefesh|reishis|derech-hashem/iu);
	}
	assert.match(discovery.note, /None of the classic Mussar sefarim/u);
	assert.match(discovery.note, /Mesillas Yesharim/u);
});

test('language tools retain a useful first-paint library search fallback', async () => {
	const discovery = await getSpecialTorahDiscovery(failingServer(), 'ikar', 'torah-language-tools');
	assert.equal(discovery.links.length, 1);
	assert.equal(discovery.links[0].path, '/mawgawl/sefarim/');
	assert.doesNotMatch(discovery.links[0].description, /finish loading|while .* loading/iu);
});

test('ordinary heichel series remain owned by generic discovery', async () => {
	assert.equal(await getSpecialTorahDiscovery(failingServer(), 'other', 'kabbalah'), null);
	assert.equal(await getSpecialTorahDiscovery(failingServer(), 'ikar', 'encyclopedia'), null);
});
