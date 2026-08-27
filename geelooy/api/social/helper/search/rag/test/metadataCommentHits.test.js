// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file metadataCommentHits.test.js
 * @description
 * Meluket translation metadata becomes a bounded, precisely coordinated comment
 * without opening the mutable comment database.
 */

const assert = require('node:assert/strict');
const { hydrateSearch } = require('../hydrate.js');
const {
	metadataComment,
	translatedMetadataRow
} = require('../metadataCommentHits.js');

function hit(row) {
	return { score: 0.8, row };
}

const meluketRow = {
	id: 'meluket:row-1',
	seriesId: 'אדר_meluket',
	postId: 'post-1',
	aliasId: 'meluket_translation_en',
	commentIds: ['comment-1', 'comment-2'],
	verseStart: '2',
	firstSubSection: 7,
	title: 'Meluket Maamar',
	text: 'The incense offering reveals a translated line comment.'
};

assert.equal(translatedMetadataRow(meluketRow), true);
assert.equal(translatedMetadataRow({ aliasId: 'rashi' }), false);
const comment = metadataComment(meluketRow);
assert.equal(comment.found, true);
assert.equal(comment.source, 'meluketTranslationMetadata');
assert.deepEqual(comment.row.commentIds, ['comment-1', 'comment-2']);
assert.equal(comment.row.verseSection, '2');
assert.equal(comment.row.subsectionId, 7);
assert.equal(comment.row.subSection, 7);
assert.equal(comment.row.content, meluketRow.text);

(async () => {
	const defaultResult = await hydrateSearch({
		hits: [hit(meluketRow), hit({ id: 'ordinary', text: 'Plain source' })],
		query: 'incense offering',
		limit: 2,
		includeComments: false,
		includeMetadataComments: true,
		maxRows: 12,
		timings: {}
	});
	assert.equal(defaultResult.hydrated[0].comments.length, 1);
	assert.equal(defaultResult.hydrated[1].comments, undefined);
	assert.equal(defaultResult.commentHits.length, 1);
	assert.equal(defaultResult.commentHits[0].source, 'meluketTranslationMetadata');

	const disabled = await hydrateSearch({
		hits: [hit(meluketRow)],
		query: 'incense offering',
		limit: 1,
		includeComments: false,
		includeMetadataComments: false,
		maxRows: 12,
		timings: {}
	});
	assert.equal(disabled.hydrated[0].comments, undefined);
	assert.deepEqual(disabled.commentHits, []);

	const explicit = await hydrateSearch({
		$i: { db: null },
		hits: [hit(meluketRow)],
		query: 'incense offering',
		limit: 1,
		includeComments: true,
		includeMetadataComments: true,
		maxRows: 12,
		timings: {}
	});
	assert.equal(explicit.hydrated[0].comments.length, 1);
	assert.equal(explicit.commentHits.length, 1);
	console.log('metadataCommentHits.test passed');
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
