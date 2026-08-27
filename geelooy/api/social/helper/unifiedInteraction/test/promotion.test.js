//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file promotion.test.js
 * @description
 * Comment text, transcript, media, sections, exact coordinate, and deterministic
 * destination become a new post payload without mutating the source. The Awtsmoos
 * reveals one insight widely while Awtsmoos.com proves provenance and idempotency.
 */

const assert = require('assert');
const {
	commentDocument,
	contentPayload,
	publicationPlan,
	promotedSections
} = require('../PromotionPayload.js');
const { promotionKey } = require('../TransformationStore.js');

const comment = {
	id: 'comment-one',
	aliasId: 'teacher',
	heichelId: 'archive',
	seriesId: 'root',
	postId: 'source-post',
	verseSection: 'verse-one',
	subsectionId: 'word-one',
	content: 'A small comment becomes a wider teaching.',
	audioNoteText: 'Optional voice transcript.',
	assets: [{ id: 'voice-one', type: 'audio', publicPath: '/voice-one' }],
	sections: [{
		id: 'section-one',
		title: 'Further thought',
		content: 'A nested comment section.',
		assets: []
	}],
	createdAt: 12345
};
const promotion = {
	aliasId: 'teacher',
	title: 'A Wider Teaching',
	summary: 'Promoted with source evidence.',
	heichelId: 'study',
	seriesId: 'lessons',
	visibility: 'public',
	idempotencyKey: ''
};
assert.equal(commentDocument(comment).blocks.length, 2);
assert.equal(promotedSections(comment)[0].title, 'Further thought');
const payload = contentPayload(comment, promotion);
assert.equal(payload.title, 'A Wider Teaching');
assert.equal(payload.rootAssets[0].id, 'voice-one');
assert.equal(payload.provenance.type, 'commentPromotion');
assert.equal(payload.provenance.commentId, 'comment-one');
assert.equal(payload.provenance.subsectionId, 'word-one');
const plan = publicationPlan(comment, promotion);
assert.equal(plan.primary.heichelId, 'study');
assert.equal(plan.primary.seriesId, 'lessons');
assert.match(plan.idempotencyKey, /comment-promotion:comment-one:study:lessons/);
assert.match(promotionKey({
	aliasId: 'teacher',
	commentId: 'comment-one',
	heichelId: 'study',
	seriesId: 'lessons'
}), /commentPromotions/);
console.log('unifiedInteraction promotion.test passed');
