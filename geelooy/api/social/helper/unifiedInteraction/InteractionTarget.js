//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InteractionTarget
 * @description
 * Whole entities, verses, subsections, parent comments, and parent comment sections
 * become one stable coordinate. The Awtsmoos holds every word inside its source;
 * Awtsmoos.com names the exact vessel before another voice enters the discussion.
 */

function clean(value, maximum = 160) {
	return String(value || '')
		.replace(/[<>\u0000-\u001f]/g, '')
		.trim()
		.slice(0, maximum);
}

function normalizeTarget(value = {}) {
	return {
		heichelId: clean(value.heichelId, 120),
		seriesId: clean(value.seriesId || 'root', 120),
		entityType: clean(value.entityType || value.type || 'post', 40),
		entityId: clean(value.entityId || value.postId || value.id, 180),
		verseSection: clean(value.verseSection || value.verseId || 'root', 120),
		subsectionId: clean(value.subsectionId || value.segmentId, 120),
		parentCommentId: clean(value.parentCommentId || value.parentId, 180),
		parentSectionId: clean(value.parentSectionId || value.replyToSectionId, 120)
	};
}

function validateTarget(target) {
	const errors = [];
	if (!target.heichelId) errors.push('heichelId is required.');
	if (!target.entityId) errors.push('entityId is required.');
	if (!['post', 'question', 'answer'].includes(target.entityType)) {
		errors.push('entityType must be post, question, or answer.');
	}
	if (target.parentSectionId && !target.parentCommentId) {
		errors.push('A parent comment section requires parentCommentId.');
	}
	return { valid: errors.length === 0, errors, target };
}

function graphEntity(target) {
	return {
		type: target.entityType,
		id: target.entityId,
		heichelId: target.heichelId,
		seriesId: target.seriesId,
		sectionId: target.subsectionId || target.verseSection
	};
}

module.exports = {
	clean,
	normalizeTarget,
	validateTarget,
	graphEntity
};
