//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentInteractionService
 * @description
 * Verified rich interactions delegate to the native comment tree after media and
 * target validation. The Awtsmoos joins voice, video, reply, verse, and reference;
 * Awtsmoos.com keeps one canonical comment store beneath every richer doorway.
 */

const commentStore = require('../comments/richCommentStore.js');
const {
	normalizeCommentInput,
	validateCommentInput
} = require('./InteractionSchema.js');
const { validateInteractionAssets } = require('./InteractionMedia.js');
const { graphEntity } = require('./InteractionTarget.js');
const {
	nativeLink,
	connectReferences
} = require('./CommentGraphService.js');

function validationError(validation) {
	return {
		error: {
			code: 'INVALID_INTERACTION',
			message: 'The interaction is incomplete.',
			details: validation.errors
		}
	};
}

function mediaError(media) {
	return {
		error: {
			code: 'INVALID_INTERACTION_MEDIA',
			message: 'One or more media manifests are invalid.',
			details: media.errors
		}
	};
}

function commentPost(normalized, media) {
	const target = normalized.target;
	return {
		aliasId: normalized.aliasId,
		content: normalized.content,
		audioNoteText: normalized.audioNoteText,
		mood: normalized.mood,
		verseSection: target.verseSection,
		subsectionId: target.subsectionId,
		parentSectionId: target.parentSectionId,
		assets: media.assets,
		links: normalized.references.map(nativeLink)
	};
}

async function createInteractionComment({ $i, verified, input }) {
	const normalized = normalizeCommentInput(input);
	const validation = validateCommentInput(normalized);
	if (!validation.valid) return validationError(validation);
	const media = await validateInteractionAssets({
		$i,
		aliasId: normalized.aliasId,
		assets: normalized.assets
	});
	if (!media.valid) return mediaError(media);
	const target = normalized.target;
	const created = await commentStore.createComment({
		$i: { ...$i, $_POST: commentPost(normalized, media) },
		userid: verified.userid,
		heichelId: target.heichelId,
		postId: target.entityId,
		seriesId: target.seriesId,
		parentId: target.parentCommentId,
		parentSectionId: target.parentSectionId,
		aliasId: normalized.aliasId
	});
	if (created?.error) return created;
	return {
		success: {
			comment: created.success,
			target: graphEntity(target),
			graph: await connectReferences({
				$i,
				comment: created.success,
				references: normalized.references
			})
		}
	};
}

module.exports = {
	validationError,
	mediaError,
	commentPost,
	createInteractionComment
};
