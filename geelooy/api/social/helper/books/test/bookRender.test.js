// B"H
// Boruch Hashem
// Blessed is He
/** @file Printable book renderer contract. */
const assert = require('assert');
const { buildBook } = require('../bookBuilder.js');
const { parse } = require('../options.js');

const posts = {
	p1: {
		title: 'כותרת',
		dayuh: { sections: [['שלום', 'עולם'], ['עוד מקור']] }
	},
	p2: {
		title: 'Second Teaching',
		sections: [{
			verseSection: '0',
			segments: [{ content: 'מקור שני', order: 0, options: { sourceSubsection: 0 } }]
		}]
	}
};
const translations = {
	p1: [
		{ content: 'Peace', verseSection: '0', dayuh: { subSection: 1 } },
		{ content: 'world', verseSection: '0', dayuh: { subSection: 2 } },
		{ content: 'More source', verseSection: '1', dayuh: { subSection: 1 } }
	],
	p2: []
};
const source = {
	async post(heichel, series, postId) { return posts[postId]; },
	async translations(heichel, series, postId) { return translations[postId]; }
};
const node = {
	id: 'demoSeries',
	name: 'Demo Volume',
	postIds: ['p1', 'p2'],
	children: [],
	path: [{ id: 'demoSeries', name: 'Demo Volume' }]
};

async function run() {
	const english = await buildBook({
		source,
		heichelId: 'ikar',
		node,
		options: parse({ language: 'english', fontPt: 18 }),
		nested: false
	});
	assert.equal(english.manifest.renderedPosts, 1);
	assert.equal(english.manifest.missingTranslations, 1);
	assert.match(english.html, /^<!doctype html>/);
	assert.match(english.html, /size: 6in 9in/);
	assert.match(english.html, /<h2>Contents<\/h2>/);
	assert.match(english.html, /Source index/);
	assert.match(english.html, /English translation coverage appendix/);
	assert.match(english.html, /Peace world/);
	assert.doesNotMatch(english.html, /שלום|עולם|מקור שני/);
	const sizes = [...english.html.matchAll(/font-size:\s*([\d.]+)pt/g)].map(match => Number(match[1]));
	assert.ok(sizes.length > 0);
	assert.ok(Math.max(...sizes) <= 18);

	const bilingual = await buildBook({
		source,
		heichelId: 'ikar',
		node: { ...node, postIds: ['p1'] },
		options: parse({ language: 'bilingual', fontPt: 11.5 }),
		nested: false
	});
	assert.match(bilingual.html, /שלום/);
	assert.match(bilingual.html, /Peace/);
	assert.match(bilingual.html, /class="bilingual-segment"/);
	console.log('bookRender.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
