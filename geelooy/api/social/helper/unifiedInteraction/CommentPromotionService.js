//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentPromotionService
 * @description
 * An authored comment may become a new canonical post while remaining an immutable
 * source in its original thread. The Awtsmoos reveals one insight in a wider vessel;
 * Awtsmoos.com records the reverse graph, target coordinate, and idempotent receipt.
 */

const commentStore = require('../comments/richCommentStore.js');
const { addGraphReference } = require('../socialGraph.js');
const { executePublication } = require('../unifiedSocial/publishing/PublicationExecutor.js');
const { normalizePromotion } = require('./InteractionSchema.js');
const {
	promotionKey,
	readReceipt,
	writeReceipt
} = require('./TransformationStore.js');
const { commentEntity } = require('./CommentGraphService.js');
const {
	contentPayload,
	publicationPlan
} = require('./PromotionPayload.js');

async function loadOwnedComment({ $i, aliasId, commentId }) {
	const got = await commentStore.getCommentByUnique({ $i, commentId });
	if (got?.error) return got;
	if (got.success.aliasId !== aliasId && got.success.author !== aliasId) {
		return {
			error: {
				code: 'COMMENT_NOT_OWNED',
				message: 'Only the comment author may promote this comment.'
			}
		};
	}
	return got;
}

function receiptPath(comment, promotion) {
	return promotionKey({
		aliasId: promotion.aliasId,
		commentId: comment.id,
		heichelId: promotion.heichelId,
		seriesId: promotion.seriesId
	});
}

async function connectSource({ $i, canonical, comment, aliasId }) {
	return addGraphReference({
		$i,
		from: canonical,
		to: commentEntity(comment),
		kind: 'references',
		aliasId,
		note: 'This post was promoted from a canonical comment.'
	});
}

async function executePromotion({ $i, comment, promotion }) {
	const plan = publicationPlan(comment, promotion);
	const executionInput = {
		...$i,
		$_POST: {
			contentPayload: contentPayload(comment, promotion),
			publicationPlan: plan
		}
	};
	return executePublication({ $i: executionInput, input: plan });
}

async function promoteComment({ $i, input }) {
	const promotion = normalizePromotion(input);
	const got = await loadOwnedComment({
		$i,
		aliasId: promotion.aliasId,
		commentId: promotion.commentId
	});
	if (got?.error) return got;
	const comment = got.success;
	const path = receiptPath(comment, promotion);
	const existing = await readReceipt({ $i, path });
	if (existing?.status === 'completed') {
		return { success: { ...existing, replayed: true } };
	}
	const published = await executePromotion({ $i, comment, promotion });
	if (published?.error) return published;
	const canonical = published.success.canonical;
	const graph = await connectSource({
		$i,
		canonical,
		comment,
		aliasId: promotion.aliasId
	});
	const receipt = await writeReceipt({
		$i,
		path,
		record: {
			status: 'completed',
			commentId: comment.id,
			canonical,
			graph,
			createdAt: Date.now()
		}
	});
	return { success: { ...receipt, replayed: false } };
}

module.exports = {
	loadOwnedComment,
	receiptPath,
	connectSource,
	executePromotion,
	promoteComment,
	contentPayload,
	publicationPlan
};
