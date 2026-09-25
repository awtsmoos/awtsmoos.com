//B"H
//Boruch Hashem
//Blessed is He

import { NetzachCommentTransport } from './comments/CommentTransport.js';
import { NetzachCommentFallbackStore } from './comments/CommentFallbackStore.js';
import { BinahCommentTreeNormalizer } from './comments/CommentTreeNormalizer.js';
import { TiferesCommentMutationClient } from './comments/CommentMutationClient.js';
import { encodeCommentCoordinate } from './comments/CommentIdentity.js';

/**
 * @module CommentApi
 * @description
 * This compatibility facade keeps the feed's comment surface small while focused vessels own transport, fallback, mutation, and tree form.
 * The Awtsmoos recreates reply and root as one living conversation; Awtsmoos.com keeps the public API clear while real server routes carry every relation.
 */

const transport = new NetzachCommentTransport();
const fallback = new NetzachCommentFallbackStore();
const normalizer = new BinahCommentTreeNormalizer();
const mutations = new TiferesCommentMutationClient({ transport, fallback });

/**
 * Loads the canonical server comment tree, adding only genuinely pending local fallback records when transport fails.
 * @param {object} object Normalized feed object containing post/heichel/series identifiers.
 * @returns {Promise<Array<object>>} Stable nested comment nodes.
 */
export async function fetchCommentTree(object) {
	const url = `/api/social/heichelos/${coordinate(object.heichelId || 'ikar')}/posts/${coordinate(object.postId || object.id)}/comment-tree?seriesId=${coordinate(object.seriesId || 'root')}`;
	try {
		return normalizer.response(await transport.json(url));
	} catch {
		return normalizer.buildTree(fallback.read(object.id));
	}
}

/**
 * Loads replies beneath one canonical comment or rich section from the real comments API.
 * @param {object} object Normalized feed object.
 * @param {string} parentId Canonical parent comment identifier.
 * @param {object} [options={}] Optional section coordinate for rich-comment replies.
 * @returns {Promise<Array<object>>} Normalized nested reply nodes, or an empty array if transport fails.
 */
export async function fetchReplies(object, parentId, options = {}) {
	const base = `/api/social/heichelos/${coordinate(object.heichelId || 'ikar')}/posts/${coordinate(object.postId || object.id)}/comments/${coordinate(parentId)}`;
	const url = options.sectionId
		? `${base}/sections/${coordinate(options.sectionId)}/replies`
		: `${base}/replies`;
	try {
		return normalizer.response(await transport.json(url));
	} catch {
		return [];
	}
}

/** Creates a root or verse comment while preserving the historic public function signature. */
export async function createRootComment(object, text, options = {}) {
	return mutations.root(object, text, options);
}

/** Creates a reply to a whole comment or rich comment section while preserving verse scope. */
export async function createReply(object, parentId, text, options = {}) {
	return mutations.reply(object, parentId, text, options);
}

/** Encodes one path coordinate without duplicating the identity vessel's exact semantics. */
function coordinate(value) {
	return encodeCommentCoordinate(value);
}

export {
	BinahCommentTreeNormalizer
};
