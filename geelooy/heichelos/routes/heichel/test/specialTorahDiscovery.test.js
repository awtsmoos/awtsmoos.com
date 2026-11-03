//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file specialTorahDiscovery.test.js
 * @description
 * The Awtsmoos proves that public Torah aliases reveal only their rightful source light;
 * Awtsmoos.com keeps Kabbalah whole, Mussar bounded, and language tools useful before the browser takes flight.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { getSpecialTorahDiscovery } = require('../specialTorahDiscovery.js');

function serverWith(items) {
	return {
		fetchAwtsmoos: async () => ({ success: { items } })
	};
}

test('kabbalah exposes every source work as a living-library doorway', async () => {
	const discovery = await getSpecialTorahDiscovery(serverWith([
		{ title: 'עץ חיים', count: 1190 },
		{ title: 'תיקוני זהר', count: 298 }
	]), 'ikar', 'kabbalah');

	assert.equal(discovery.links.length, 2);
	assert.equal(discovery.links[0].title, 'עץ חיים');
	assert.match(discovery.links[0].path, /mawgawl\/sefarim/u);
	assert.match(discovery.links[0].path, /strategy=vector/u);
});

test('mussar filters the shared source domain to the canonical mussar works', async () => {
	const discovery = await getSpecialTorahDiscovery(serverWith([
		{ title: 'מסילת ישרים', count: 90 },
		{ title: 'תניא', count: 500 },
		{ title: 'חובות הלבבות', count: 45 }
	]), 'ikar', 'mussar');

	assert.deepEqual(discovery.links.map(link => link.title), [
		'מסילת ישרים',
		'חובות הלבבות'
	]);
});

test('language tools retain a useful first-paint library search fallback', async () => {
	const discovery = await getSpecialTorahDiscovery(serverWith([]), 'ikar', 'torah-language-tools');
	assert.equal(discovery.links.length, 1);
	assert.equal(discovery.links[0].path, '/mawgawl/sefarim/');
});

test('ordinary heichel series remain owned by generic discovery', async () => {
	assert.equal(await getSpecialTorahDiscovery(serverWith([]), 'other', 'kabbalah'), null);
	assert.equal(await getSpecialTorahDiscovery(serverWith([]), 'ikar', 'encyclopedia'), null);
});
