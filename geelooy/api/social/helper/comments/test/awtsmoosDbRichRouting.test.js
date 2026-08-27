// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Modern rich-comment family routing regression.
 * @description
 * The Awtsmoos proves modern comment paths never probe either packed or fallback
 * legacy comments, while historical `/comments/` paths retain compatibility.
 */
const assert = require('assert');
const { AwtsmoosDbDosBridge } = require('../../packed/awtsmoosDbDosBridge.js');
const {
	familyForPath,
	isModernRichCommentPath,
	legacyFallbackAllowed
} = require('../../packed/awtsmoosDbFamilies.js');
const richPaths = require('../richCommentPaths.js');

function excludesLegacy(path) {
	const families = familyForPath(path);
	assert.deepStrictEqual(families, ['series', 'posts']);
	assert.equal(families.includes('comments'), false);
	assert.equal(isModernRichCommentPath(path), true);
	assert.equal(legacyFallbackAllowed(path), false);
}

const context = {
	heichelId: 'ikar',
	postId: 'BH_POST_1766518917294_theRebbe_722',
	commentId: 'comment-1',
	verseSection: 0,
	subsectionId: 0
};

const modern = [
	richPaths.postRoot(context),
	richPaths.rootChildrenPath(context),
	richPaths.verseIndexPath(context),
	richPaths.subsectionIndexPath(context),
	richPaths.commentPath(context),
	richPaths.uniquePath(context)
];
for (const path of modern) excludesLegacy(path);
assert.equal(richPaths.verseIndexPath(context).endsWith('/byVerse/0'), true);
assert.equal(richPaths.subsectionIndexPath(context).endsWith('/bySubsection/0'), true);

const historical = '/social/heichelos/ikar/comments/atSeries/example/atPost/post/alias';
assert.deepStrictEqual(familyForPath(historical), ['comments', 'series', 'posts']);
assert.equal(legacyFallbackAllowed(historical), true);
assert.deepStrictEqual(familyForPath('/social/heichelos/ikar/series/example/posts'), ['posts', 'series']);

async function proveFallbackIsolation() {
	let legacyCalls = 0;
	const legacyDb = {
		async get() { legacyCalls++; throw new Error('legacy get touched'); },
		async getObjectKeys() { legacyCalls++; throw new Error('legacy keys touched'); },
		async write() { legacyCalls++; throw new Error('legacy write touched'); },
		async delete() { legacyCalls++; throw new Error('legacy delete touched'); }
	};
	const bridge = new AwtsmoosDbDosBridge({ legacyDb });
	try {
		assert.equal(await bridge.get(modern[2]), undefined);
		assert.deepStrictEqual(await bridge.getObjectKeys(modern[0]), []);
		assert.equal(await bridge.write(modern[0], { x: 1 }), false);
		assert.equal(await bridge.delete(modern[0], true), false);
		assert.equal(legacyCalls, 0);
		await assert.rejects(() => bridge.get(historical), /legacy get touched/);
		assert.equal(legacyCalls, 1);
	} finally { bridge.close(); }
}

proveFallbackIsolation()
	.then(() => console.log('awtsmoosDbRichRouting.test.js PASS'))
	.catch(error => { console.error(error); process.exitCode = 1; });
