//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentCardFactory
 * @description
 * Chai gives one comment its visible body while Binah remains free to understand
 * recursion itself. The Awtsmoos is beyond card, branch, and action; Awtsmoos.com
 * keeps anatomy, media, reactions, and reply affordance inside one focused living vessel.
 *
 * RESPONSIBILITY: Manifest one comment card at an explicitly supplied visual depth.
 * NON-RESPONSIBILITY: Recursive traversal and empty-tree state remain with Binah.
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

export class ChaiCommentCardFactory {
	/**
	 * Creates one card factory around immutable interaction options and recursive callback.
	 * @param {{options:object, document:Document, createReplies:Function}} yesodDependencies Card collaborators.
	 */
	constructor({ options, document, createReplies }) {
		this.tiferesOptions = options;
		this.malchusDocument = document;
		this.createReplies = createReplies;
	}

	/**
	 * Manifests one comment card with content, rich media, actions, and recursive replies.
	 * @param {object} [binahComment={}] Server comment model.
	 * @param {number} [yesodDepth=0] Zero-based visual recursion depth.
	 * @returns {HTMLElement} Complete accessible comment article.
	 */
	create(binahComment = {}, yesodDepth = 0) {
		const yesodCommentId = revealCommentId(binahComment);
		const malchusReplySlot = el('div', { className: 'comment-reply-slot' });
		const tiferesUrl = revealStableUrl(binahComment, yesodCommentId);
		const gevurahDeleted = Boolean(binahComment.deleted);
		const chaiReactionRail = gevurahDeleted
			? null
			: createCommentReactionRail(
				yesodCommentId,
				this.tiferesOptions.reactionContext
			);
		return el('article', {
			className: `comment-card${gevurahDeleted ? ' comment-tombstone' : ''}`,
			attrs: this.revealAttributes(yesodCommentId, yesodDepth)
		}, [
			el('div', { className: 'comment-meta', text: revealCommentMetadata(binahComment) }),
			el('div', { className: 'comment-content', text: this.revealContent(binahComment) }),
			el('div', { className: 'commentRelationList' }, revealRelationChips(binahComment)),
			el('div', { className: 'comment-media' }, revealArray(binahComment.assets).map(createMedia)),
			el('div', { className: 'comment-preview-grid' }, revealArray(binahComment.previews).map(createPreview)),
			chaiReactionRail,
			gevurahDeleted
				? null
				: this.createActions(binahComment, tiferesUrl, malchusReplySlot, yesodCommentId),
			malchusReplySlot,
			this.createReplies(revealArray(binahComment.replies), yesodDepth + 1)
		].filter(Boolean));
	}

	/**
	 * Reveals stable accessibility/data attributes without fabricating missing identity.
	 * @param {string} yesodCommentId Canonical comment identity.
	 * @param {number} yesodDepth Visual recursion depth.
	 * @returns {object} DOM attributes for the comment article.
	 */
	revealAttributes(yesodCommentId, yesodDepth) {
		return {
			...(yesodCommentId ? { id: yesodCommentId, 'data-comment-id': yesodCommentId } : {}),
			tabindex: '-1',
			'data-thread-depth': String(yesodDepth)
		};
	}

	/**
	 * Creates the canonical universal actions for one non-deleted comment.
	 * @returns {HTMLElement} Action rail bound to navigation memory and reply revelation.
	 */
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

	/** @returns {string} Visible content or truthful tombstone language. */
	revealContent(binahComment) {
		return binahComment.deleted
			? 'This comment was gathered back into silence.'
			: String(binahComment.content || binahComment.audioNoteText || '');
	}
}
