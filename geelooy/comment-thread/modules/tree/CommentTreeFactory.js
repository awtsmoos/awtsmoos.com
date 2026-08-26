//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentTreeFactory
 * @description
 * Binah gives recursive order to many human voices without letting depth become visual
 * exile. The Awtsmoos contains root and branch in one indivisible truth; Awtsmoos.com
 * records depth explicitly so every nested reply remains readable, bounded, and alive.
 *
 * RESPONSIBILITY: Manifest recursive Comment Thread cards and their visible descendants.
 * NON-RESPONSIBILITY: Transport, mutation, and route-level lifecycle belong elsewhere.
 */
import { createCommentReactionRail } from '../CommentReaction.js';
import { createCommentUniversalActions } from '../CommentUniversalActions.js';
import { createElement as el } from '../dom.js';
import { createMedia, createPreview } from '../media.js';
import { revealRelationChips } from './CommentRelationView.js';
import {
	revealArray,
	revealCommentId,
	revealCommentMetadata,
	revealStableUrl
} from './CommentTreeVocabulary.js';

export class BinahCommentTreeFactory {
	/**
	 * Creates a recursive view factory around immutable interaction options.
	 * @param {object} tiferesOptions Reply, memory, reaction, and permission callbacks.
	 * @param {Document} [malchusDocument=document] Document used for action manifestation.
	 */
	constructor(tiferesOptions, malchusDocument = document) {
		this.tiferesOptions = tiferesOptions;
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Creates the top-level result region or an honest empty-thread state.
	 * @param {object[]} chesedComments Canonical server comment tree.
	 * @returns {HTMLElement} Accessible comment-result section.
	 */
	createTree(chesedComments) {
		if (!chesedComments.length) {
			return this.createEmptyTree();
		}
		return el('section', {
			className: 'comment-tree',
			attrs: { 'aria-label': 'Comment results' }
		}, chesedComments.map(comment => this.createCard(comment, 0)));
	}

	/**
	 * Creates one comment card and recursively manifests its descendants.
	 * @param {object} [binahComment={}] Server comment model.
	 * @param {number} [yesodDepth=0] Zero-based visual recursion depth.
	 * @returns {HTMLElement} Comment article containing content, actions, media, and replies.
	 */
	createCard(binahComment = {}, yesodDepth = 0) {
		const yesodCommentId = revealCommentId(binahComment);
		const malchusReplySlot = el('div', { className: 'comment-reply-slot' });
		const tiferesUrl = revealStableUrl(binahComment, yesodCommentId);
		const chesedReplies = revealArray(binahComment.replies);
		const gevurahDeleted = Boolean(binahComment.deleted);
		const yesodAttributes = this.revealCardAttributes(yesodCommentId, yesodDepth);
		const chaiReactionRail = gevurahDeleted
			? null
			: createCommentReactionRail(
				yesodCommentId,
				this.tiferesOptions.reactionContext
			);
		const tiferesActions = gevurahDeleted
			? null
			: this.createActions(binahComment, tiferesUrl, malchusReplySlot, yesodCommentId);
		return el('article', {
			className: `comment-card${gevurahDeleted ? ' comment-tombstone' : ''}`,
			attrs: yesodAttributes
		}, [
			el('div', { className: 'comment-meta', text: revealCommentMetadata(binahComment) }),
			el('div', { className: 'comment-content', text: this.revealContent(binahComment) }),
			el('div', { className: 'commentRelationList' }, revealRelationChips(binahComment)),
			el('div', { className: 'comment-media' }, revealArray(binahComment.assets).map(createMedia)),
			el('div', { className: 'comment-preview-grid' }, revealArray(binahComment.previews).map(createPreview)),
			chaiReactionRail,
			tiferesActions,
			malchusReplySlot,
			this.createReplies(chesedReplies, yesodDepth + 1)
		].filter(Boolean));
	}

	/** @returns {HTMLElement} Honest empty-thread state preserving current write capability. */
	createEmptyTree() {
		const tiferesCopy = this.tiferesOptions.canWrite
			? 'This real thread is empty. You may begin it above.'
			: 'This real thread is empty.';
		return el('section', { className: 'comment-tree', attrs: { 'aria-label': 'Comment results' } }, [
			el('article', { className: 'comment-card state' }, [
				el('h2', { text: 'No comments yet' }),
				el('p', { text: tiferesCopy })
			])
		]);
	}

	/** @returns {HTMLElement} Recursive reply region with explicit next-depth state. */
	createReplies(chesedReplies, yesodDepth) {
		return el('div', {
			className: 'comment-replies',
			attrs: { 'data-thread-depth': String(yesodDepth) }
		}, chesedReplies.map(reply => this.createCard(reply, yesodDepth)));
	}

	/** @returns {object} Stable accessibility/data attributes for one comment card. */
	revealCardAttributes(yesodCommentId, yesodDepth) {
		return {
			...(yesodCommentId ? { id: yesodCommentId, 'data-comment-id': yesodCommentId } : {}),
			tabindex: '-1',
			'data-thread-depth': String(yesodDepth)
		};
	}

	/** @returns {HTMLElement} Canonical universal actions for one non-deleted comment. */
	createActions(binahComment, tiferesUrl, malchusReplySlot, yesodCommentId) {
		return createCommentUniversalActions({
			document: this.malchusDocument,
			comment: binahComment,
			url: tiferesUrl,
			canReply: this.tiferesOptions.canWrite,
			onRemember: this.tiferesOptions.onRemember,
			onReply: () => this.tiferesOptions.onReply(malchusReplySlot, yesodCommentId)
		});
	}

	/** @returns {string} Visible content or honest tombstone copy. */
	revealContent(binahComment) {
		return binahComment.deleted
			? 'This comment was gathered back into silence.'
			: String(binahComment.content || binahComment.audioNoteText || '');
	}
}
