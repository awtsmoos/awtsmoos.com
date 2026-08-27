//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file schema.test.js
 * @description
 * Exact target coordinates, reply sections, media manifests, and canonical
 * references are normalized without arbitrary HTML or local blobs. The Awtsmoos
 * gives every response one place while Awtsmoos.com proves the bounded request law.
 */

const assert = require('assert');
const {
	normalizeTarget,
	validateTarget,
	graphEntity
} = require('../InteractionTarget.js');
const {
	normalizeCommentInput,
	validateCommentInput,
	normalizePromotion
} = require('../InteractionSchema.js');

const target = normalizeTarget({
	heichelId: 'study',
	seriesId: 'lessons',
	entityType: 'post',
	entityId: 'teaching-one',
	verseSection: 'verse-one',
	subsectionId: 'word-one',
	parentCommentId: 'comment-one',
	parentSectionId: 'comment-section-one'
});
assert.equal(validateTarget(target).valid, true);
assert.deepEqual(graphEntity(target), {
	type: 'post',
	id: 'teaching-one',
	heichelId: 'study',
	seriesId: 'lessons',
	sectionId: 'word-one'
});
assert.equal(validateTarget(normalizeTarget({
	heichelId: 'study',
	entityId: 'p1',
	parentSectionId: 'orphan-section'
})).valid, false);

const input = normalizeCommentInput({
	aliasId: 'teacher',
	target,
	content: '<A reply>\u0000 with context',
	assets: [{
		id: 'voice-one',
		type: 'audio',
		mime: 'audio/webm',
		publicPath: '/assets/voice-one'
	}],
	references: [{
		kind: 'post',
		type: 'post',
		id: 'source-one',
		heichelId: 'archive',
		seriesId: 'root'
	}]
});
assert.equal(validateCommentInput(input).valid, true);
assert.equal(input.content, 'A reply with context');
assert.equal(input.assets[0].id, 'voice-one');
assert.equal(input.references[0].id, 'source-one');
const promotion = normalizePromotion({
	aliasId: 'teacher',
	commentId: 'comment-one',
	title: '<New post>',
	heichelId: 'study',
	seriesId: 'lessons',
	visibility: 'unknown'
});
assert.equal(promotion.title, 'New post');
assert.equal(promotion.visibility, 'public');
console.log('unifiedInteraction schema.test passed');
