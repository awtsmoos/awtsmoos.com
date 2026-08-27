//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PromotionPayload
 * @description
 * A comment's text, transcript, media, sections, and original coordinate become a
 * new post payload without mutating the source. The Awtsmoos reveals one thought
 * through a larger vessel while Awtsmoos.com preserves every strand of provenance.
 */

function paragraph(id, text, order, type = 'paragraph') {
	return {
		id,
		type,
		text,
		segments: [{ text, marks: [] }],
		order
	};
}

function commentDocument(comment) {
	const blocks = [];
	if (comment.content) {
		blocks.push(paragraph('promoted-comment-root', comment.content, 0));
	}
	if (comment.audioNoteText) {
		blocks.push(paragraph(
			'promoted-comment-transcript',
			comment.audioNoteText,
			blocks.length,
			'callout'
		));
	}
	return { version: 1, blocks };
}

function promotedSections(comment) {
	return (comment.sections || []).map((section, index) => ({
		id: section.id,
		verseSection: section.id,
		title: section.title,
		document: {
			version: 1,
			blocks: [paragraph(`${section.id}-block`, section.content, 0)]
		},
		assets: section.assets || [],
		subsections: [],
		commentsEnabled: true,
		order: index
	}));
}

function contentPayload(comment, promotion) {
	return {
		aliasId: promotion.aliasId,
		heichelId: promotion.heichelId,
		seriesId: promotion.seriesId,
		postKind: 'post',
		presentationKind: 'post',
		title: promotion.title || comment.content.slice(0, 120) || 'Promoted comment',
		summary: promotion.summary || `Promoted from comment ${comment.id}.`,
		rootDocument: commentDocument(comment),
		rootAssets: comment.assets || [],
		sections: promotedSections(comment),
		commentsEnabled: true,
		visibility: promotion.visibility,
		provenance: {
			type: 'commentPromotion',
			commentId: comment.id,
			heichelId: comment.heichelId,
			postId: comment.postId,
			verseSection: comment.verseSection,
			subsectionId: comment.subsectionId,
			createdAt: comment.createdAt
		}
	};
}

function publicationPlan(comment, promotion) {
	return {
		version: 1,
		idempotencyKey: promotion.idempotencyKey
			|| `comment-promotion:${comment.id}:${promotion.heichelId}:${promotion.seriesId}`,
		aliasId: promotion.aliasId,
		contentKind: 'post',
		primary: {
			heichelId: promotion.heichelId,
			seriesId: promotion.seriesId,
			kind: 'canonical'
		},
		secondary: [],
		source: {},
		visibility: promotion.visibility
	};
}

module.exports = {
	paragraph,
	commentDocument,
	promotedSections,
	contentPayload,
	publicationPlan
};
