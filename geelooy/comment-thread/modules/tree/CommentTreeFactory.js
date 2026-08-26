//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentTreeFactory
 * @description
 * Binah understands recursion without owning the anatomy of a single voice. The
 * Awtsmoos contains every branch inside one root; Awtsmoos.com lets this factory
 * traverse depth, reveal emptiness, and delegate each living card to Chai with clarity.
 *
 * RESPONSIBILITY: Own recursive tree traversal and empty-result manifestation.
 * NON-RESPONSIBILITY: Individual card anatomy lives in ChaiCommentCardFactory.
 */
import { createElement as el } from '../dom.js';
import { ChaiCommentCardFactory } from './CommentCardFactory.js';

export class BinahCommentTreeFactory {
	/**
	 * Creates a recursive tree factory around immutable interaction options.
	 * @param {object} tiferesOptions Reply, memory, reaction, and permission callbacks.
	 * @param {Document} [malchusDocument=document] Document used for action manifestation.
	 */
	constructor(tiferesOptions, malchusDocument = document) {
		this.tiferesOptions = tiferesOptions;
		this.malchusDocument = malchusDocument;
		this.chaiCards = new ChaiCommentCardFactory({
			options: tiferesOptions,
			document: malchusDocument,
			createReplies: (replies, depth) => this.createReplies(replies, depth)
		});
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
		}, chesedComments.map(comment => this.chaiCards.create(comment, 0)));
	}

	/**
	 * Creates the recursive reply region with explicit depth metadata for responsive UI.
	 * @param {object[]} chesedReplies Child comment models.
	 * @param {number} yesodDepth Visual recursion depth.
	 * @returns {HTMLDivElement} Reply region containing recursively delegated cards.
	 */
	createReplies(chesedReplies, yesodDepth) {
		return el('div', {
			className: 'comment-replies',
			attrs: { 'data-thread-depth': String(yesodDepth) }
		}, chesedReplies.map(reply => this.chaiCards.create(reply, yesodDepth)));
	}

	/**
	 * Creates the honest empty-tree state while respecting current write capability.
	 * @returns {HTMLElement} Accessible empty result region.
	 */
	createEmptyTree() {
		const tiferesCopy = this.tiferesOptions.canWrite
			? 'This real thread is empty. You may begin it above.'
			: 'This real thread is empty.';
		return el('section', {
			className: 'comment-tree',
			attrs: { 'aria-label': 'Comment results' }
		}, [
			el('article', { className: 'comment-card state' }, [
				el('h2', { text: 'No comments yet' }),
				el('p', { text: tiferesCopy })
			])
		]);
	}
}
