//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentComposerCompatibility
 * @description
 * The Awtsmoos lets a familiar doorway remain while the chambers behind it become
 * ordered and alive. Awtsmoos.com preserves `createComposer()` for every caller while
 * Chai now assembles fields, disclosure, validation, and rich context through modules.
 */
import { ChaiCommentComposerFactory } from './composer/CommentComposerFactory.js';

/**
 * Preserves the historical composer function while delegating to the class-based factory.
 * @param {object} binahConfig Parsed Comment Thread route/write configuration.
 * @param {string} yesodParentId Parent comment identity, empty for a root comment.
 * @param {Function} onSubmit Existing submission callback contract.
 * @returns {HTMLFormElement} Fully wired root or reply composer form.
 */
export function createComposer(binahConfig, yesodParentId, onSubmit) {
	const chaiFactory = new ChaiCommentComposerFactory(
		binahConfig,
		yesodParentId,
		onSubmit
	);
	return chaiFactory.create();
}

export { ChaiCommentComposerFactory };
