//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InteractionRoutes
 * @description
 * Rich comments, post references, and comment promotion cross one live alias gate.
 * The Awtsmoos joins every speaker to every destination; Awtsmoos.com proves the
 * acting alias before native comment or publication services receive the request.
 */

const {
	withVerifiedAlias,
	aliasFromRequest
} = require('../unifiedSocial/permissions/RouteAuthorization.js');
const { createInteractionComment } = require('./CommentInteractionService.js');
const {
	promoteComment,
	loadOwnedComment,
	contentPayload,
	publicationPlan
} = require('./CommentPromotionService.js');
const { normalizePromotion } = require('./InteractionSchema.js');

async function create({ $i }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: verified => createInteractionComment({
			$i,
			verified,
			input: { ...($i.$_POST || {}), aliasId }
		})
	});
}

async function embedPost({ $i, postId }) {
	const aliasId = aliasFromRequest($i);
	const body = $i.$_POST || {};
	const reference = {
		kind: 'post',
		type: body.sourceType || 'post',
		id: postId,
		heichelId: body.sourceHeichelId,
		seriesId: body.sourceSeriesId || 'root',
		sectionId: body.sourceSectionId || '',
		label: body.sourceLabel || `Post ${postId}`
	};
	return withVerifiedAlias({
		$i,
		aliasId,
		action: verified => createInteractionComment({
			$i,
			verified,
			input: {
				...body,
				aliasId,
				references: [reference]
			}
		})
	});
}

async function previewPromotion({ $i, commentId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: async () => {
			const promotion = normalizePromotion({
				...($i.$_POST || $i.$_GET || {}),
				aliasId,
				commentId
			});
			const got = await loadOwnedComment({ $i, aliasId, commentId });
			if (got?.error) return got;
			return {
				success: {
					comment: got.success,
					contentPayload: contentPayload(got.success, promotion),
					publicationPlan: publicationPlan(got.success, promotion)
				}
			};
		}
	});
}

async function promote({ $i, commentId }) {
	const aliasId = aliasFromRequest($i);
	return withVerifiedAlias({
		$i,
		aliasId,
		action: () => promoteComment({
			$i,
			input: { ...($i.$_POST || {}), aliasId, commentId }
		})
	});
}

module.exports = {
	create,
	embedPost,
	previewPromotion,
	promote
};
