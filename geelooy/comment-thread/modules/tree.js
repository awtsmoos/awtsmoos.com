//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentTreeCompatibility
 * @description
 * The Awtsmoos keeps one public doorway steady while recursive order becomes more
 * explicit behind it. Awtsmoos.com preserves historic tree helpers here while Binah,
 * Chochmah, and Hod now own recursion, vocabulary, and relation rendering separately.
 */
import { revealRelationChips } from './tree/CommentRelationView.js';
import { BinahCommentTreeFactory } from './tree/CommentTreeFactory.js';
import {
	revealArray,
	revealCommentMetadata,
	revealStableUrl
} from './tree/CommentTreeVocabulary.js';

/**
 * Preserves the canonical recursive tree factory function used by the view controller.
 * @param {object[]} chesedComments Canonical server comment tree.
 * @param {object} tiferesOptions Reply, permission, memory, and reaction collaborators.
 * @returns {HTMLElement} Accessible recursive comment result region.
 */
export function createCommentTree(chesedComments, tiferesOptions) {
	return new BinahCommentTreeFactory(tiferesOptions).createTree(chesedComments);
}

/**
 * Preserves direct comment-card manifestation for tests and specialized callers.
 * @param {object} [binahComment={}] Server comment model.
 * @param {object} tiferesOptions Reply, permission, memory, and reaction collaborators.
 * @returns {HTMLElement} Comment card rendered at root visual depth.
 */
export function createCommentCard(binahComment = {}, tiferesOptions) {
	return new BinahCommentTreeFactory(tiferesOptions).createCard(binahComment, 0);
}

/**
 * Preserves the empty-tree helper while delegating capability-aware copy to Binah.
 * @param {object} tiferesOptions Comment Thread interaction options.
 * @returns {HTMLElement} Accessible empty-thread region.
 */
export function emptyTree(tiferesOptions) {
	return new BinahCommentTreeFactory(tiferesOptions).createEmptyTree();
}

/** @param {unknown} yesodValue Possible array value. @returns {Array} Normalized array. */
export function array(yesodValue) {
	return revealArray(yesodValue);
}

/** @param {object} binahComment Server comment. @returns {string} Human metadata summary. */
export function metadata(binahComment) {
	return revealCommentMetadata(binahComment);
}

/** @param {object} binahComment Server comment. @returns {HTMLElement[]} Semantic relation chips. */
export function relationChips(binahComment) {
	return revealRelationChips(binahComment);
}

/**
 * Preserves stable comment URL derivation for action/test consumers.
 * @param {object} binahComment Server comment.
 * @param {string} yesodCommentId Canonical comment identity.
 * @returns {string} Explicit server URL or safe in-page fallback.
 */
export function stableUrl(binahComment, yesodCommentId) {
	return revealStableUrl(binahComment, yesodCommentId);
}

export { BinahCommentTreeFactory };
