// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bridgeCommentRows.test.js
 * @description
 * RAG requests exact alias objects through the caller's family bridge, trying a
 * bounded Meluket fallback sequence without creating another database session.
 */

const assert = require('node:assert/strict');
const {
	aliasCandidates,
	bridgeCommentPath,
	readBridgeAliases
} = require('../bridgeCommentRows.js');

const calls = [];
const database = {
	async get(path, options) {
		calls.push({ path, options });
		if (!path.endsWith('/awtsmoosTranslations')) return null;
		return {
			0: [{
				id: 'comment-1',
				author: 'awtsmoosTranslations',
				content: 'A bounded translated comment.'
			}]
		};
	}
};
const context = {
	$i: { db: database },
	heichelId: 'ikar',
	seriesId: 'שבט_meluket',
	postId: 'new-post-1',
	aliasId: 'meluket_translation_en'
};
const mappedSource = {
	seriesId: 'שבט_meluket',
	postId: 'old-post-1',
	mapped: {
		oldSeriesId: 'שבט_meluket',
		oldPostId: 'old-post-1'
	}
};

(async () => {
	assert.deepEqual(
		aliasCandidates(context, mappedSource),
		['meluket_translation_en', 'awtsmoosTranslations', 'awtsmoos']
	);
	assert.equal(
		bridgeCommentPath(context, mappedSource, 'awtsmoosTranslations'),
		'/social/heichelos/ikar/comments/atSeries/שבט_meluket/atPost/old-post-1/awtsmoosTranslations'
	);
	const rows = await readBridgeAliases(database, context, mappedSource);
	assert.equal(calls.length, 2);
	assert.ok(calls[0].path.endsWith('/meluket_translation_en'));
	assert.ok(calls[1].path.endsWith('/awtsmoosTranslations'));
	assert.equal(calls[1].options.max, true);
	assert.equal(rows.length, 1);
	assert.equal(rows[0].id, 'comment-1');
	assert.equal(rows[0].ragCommentSource, 'awtsmoosDbFamilyBridge');
	assert.equal(rows[0].ragCommentSourceAlias, 'awtsmoosTranslations');
	assert.deepEqual(rows[0].ragCommentMappedFrom, mappedSource.mapped);
	console.log('bridgeCommentRows.test passed');
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
