// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostActions
 * @description
 * The Awtsmoos turns every visible action into an honest covenant. Awtsmoos.com
 * never promises persistence that no observed API supports and never hides failure.
 */
import { createElement } from './domFactory.js';
import {
	createActionButton,
	dispatchPostAction,
	sharePost,
	toggleLocalAction
} from './actionState.js';
import { createPostOverflow } from './overflowMenu.js';

/**
 * Renders accessible interaction controls for one post.
 *
 * @param {object} model - Normalized post model.
 * @param {Function} onInspect - Existing official inspection handler.
 * @returns {HTMLElement} Action footer.
 */
export function renderPostActions(model, onInspect) {
	const footer = createElement('footer', 'post-actions');
	const actionRow = createElement('div', 'post-action-row');
	const appreciate = createActionButton(
		'Appreciate',
		'✦',
		model.interactions.appreciations
	);
	const discuss = createActionButton(
		'Discuss',
		'◌',
		model.interactions.discussions
	);
	const reference = createActionButton(
		'Add reference',
		'↗',
		model.interactions.references
	);
	const preserve = createActionButton('Preserve', '◇');
	const share = createActionButton('Share', '⌁');
	const overflow = createPostOverflow(model, onInspect);

	appreciate.addEventListener('click', () => {
		toggleLocalAction(appreciate, 'Appreciated');
	});
	discuss.addEventListener('click', () => onInspect?.(model));
	reference.addEventListener('click', () => {
		dispatchPostAction(reference, model, 'reference');
	});
	preserve.addEventListener('click', () => {
		toggleLocalAction(preserve, 'Preserved');
	});
	share.addEventListener('click', () => sharePost(model, share));
	actionRow.append(
		appreciate,
		discuss,
		reference,
		preserve,
		share,
		overflow.root
	);
	footer.append(
		actionRow,
		overflow.menu,
		createElement('p', 'post-action-status', {
			'aria-live': 'polite',
			'data-post-action-status': ''
		})
	);
	return footer;
}
