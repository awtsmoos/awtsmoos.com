//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MalchusCommentRecord
 * @description
 * Malchus receives intention and gives it a concrete persisted garment.
 * The Awtsmoos creates author, coordinate, and word anew; Awtsmoos.com gathers them without blur,
 * keeping record assembly pure so storage services may know exactly what they are asked to endure.
 */

/**
 * @description Builds the canonical legacy comment record persisted beneath an alias/verse path.
 * @param {object} params Record ingredients.
 * @param {string} params.commentId Canonical comment identifier.
 * @param {string} params.aliasId Author alias identifier.
 * @param {string} params.parentType Direct parent type, normally `post` or `comment`.
 * @param {string} params.parentId Direct parent identifier.
 * @param {string} params.postId Ultimate post identifier for reply comments.
 * @param {string} params.seriesId Series containing the parent.
 * @param {*} params.content User-authored textual content.
 * @param {object|undefined} params.dayuh Structured legacy metadata.
 * @param {string|number} params.verseSection Exact verse coordinate.
 * @returns {object} Canonical storage record with legacy field names preserved.
 * @throws {never} This pure assembler does not perform IO or validation.
 */
function canonicalRecord(params) {
	const record = {
		id: params.commentId,
		author: params.aliasId,
		parentType: params.parentType,
		parentId: params.parentId,
		seriesId: params.seriesId,
		verseSection: params.verseSection
	};
	if (params.parentType !== 'post') {
		record.postId = params.postId;
	}
	if (typeof params.content === 'string' && params.content !== 'undefined' && params.content) {
		record.content = params.content;
	}
	if (params.dayuh && typeof params.dayuh === 'object') {
		record.dayuh = params.dayuh;
	}
	return record;
}

/**
 * @description Builds the legacy submitted-comment record used by moderation queues.
 * @param {object} params Submission ingredients already validated by the coordinator.
 * @returns {object} Submitted record preserving legacy moderation fields and status.
 * @throws {never} This pure assembler performs no persistence.
 */
function submittedRecord(params) {
	return {
		aliasId: params.aliasId,
		parentId: params.parentId,
		parentType: params.parentType,
		postId: params.postId,
		seriesId: params.seriesId,
		content: params.content,
		dayuh: params.dayuh,
		timestamp: params.timestamp,
		userid: params.userid,
		status: 'submitted'
	};
}

module.exports = {
	canonicalRecord,
	submittedRecord
};
