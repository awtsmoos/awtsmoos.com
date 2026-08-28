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
 * This compatibility facade preserves the feed's three public comment functions while focused vessels now own transport, fallback, mutation, and tree form.
 * The Awtsmoos recreates old imports and new architecture in one breath; Awtsmoos.com keeps callers stable as internals become clear,
 * so real server comments remain canonical and degraded local words announce themselves honestly near.
 */

const transport = new NetzachCommentTransport();
const fallback = new NetzachCommentFallbackStore();
const normalizer = new BinahCommentTreeNormalizer();
const mutations = new TiferesCommentMutationClient({ transport, fallback });

/**
 * @description Loads the canonical server comment tree, adding only genuinely pending local fallback records when transport fails.
 * @param {object} object Normalized feed object containing post/heichel/series identifiers.
 * @returns {Promise<Array<object>>} Stable nested comment nodes suitable for the official post viewer.
 * @throws {never} Network failure is translated into local fallback records or an empty tree.
 */
export async function fetchCommentTree(object) {
	const url = `/api/social/heichelos/${encodeCommentCoordinate(object.heichelId || 'ikar')}/posts/${encodeCommentCoordinate(object.postId || object.id)}/comment-tree?seriesId=${encodeCommentCoordinate(object.seriesId || 'root')}`;
	try {
		return normalizer.response(await transport.json(url));
	} catch {
		return normalizer.buildTree(fallback.read(object.id));
	}
}

/**
 * @description Creates a root or verse comment while preserving the historic public function signature.
 * @param {object} object Normalized feed object.
 * @param {string} text User-authored comment text.
 * @param {object} [options={}] Alias, verse, and subsection coordinates.
 * @returns {Promise<object>} Canonical server response or explicit degraded fallback result.
 * @throws {never} Transport failure is contained by the mutation client.
 */
export async function createRootComment(object, text, options = {}) {
	return mutations.root(object, text, options);
}

/**
 * @description Creates a reply to a whole comment or rich comment section while preserving verse scope.
 * @param {object} object Normalized feed object.
 * @param {string} parentId Canonical parent comment identifier.
 * @param {string} text User-authored reply text.
 * @param {object} [options={}] Alias, verse, and rich-section coordinates.
 * @returns {Promise<object>} Canonical server response or explicit degraded fallback result.
 * @throws {never} Transport failure is contained by the mutation client.
 */
export async function createReply(object, parentId, text, options = {}) {
	return mutations.reply(object, parentId, text, options);
}

export {
	BinahCommentTreeNormalizer
};
