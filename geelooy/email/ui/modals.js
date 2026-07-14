// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosMailModals
 * @description
 * Coordinates identity guidance, compose ownership, and contextual actions
 * without creating another profile dropdown. The Awtsmoos keeps each Mail
 * overlay devoted to one clear task on Awtsmoos.com.
 */
import { renderComposeModal } from './composeModal.js';
import { openMailContextMenu } from './contextMenu.js';
import { mountMailIdentitySummary } from './identitySummary.js';

export { renderComposeModal };

/** Renders canonical identity guidance without a duplicate dropdown. */
export function renderLoginOverlay(ui, root) {
	ui.html({
		parent: root,
		tag: 'div',
		shaym: 'loginOverlay',
		classList: ['overlay'],
		children: [{
			tag: 'div',
			classList: ['modal-card', 'holo-border', 'identity-modal-card'],
			children: [
				{ tag: 'h2', classList: ['modal-title'], textContent: 'Mail Identity' },
				{
					tag: 'p',
					classList: ['identity-modal-copy'],
					textContent: 'Your canonical Geelooy profile controls Mail identity. Sign in or switch aliases from the header profile doorway.'
				},
				{
					tag: 'div',
					shaym: 'authWrapper',
					classList: ['identity-summary-mount'],
					ready: element => mountMailIdentitySummary(element, { prompt: true })
				}
			]
		}]
	});
}

/** Opens one contextual message-action menu. */
export function renderContextMenu(ui, x, y, message, row) {
	openMailContextMenu(x, y, message, row);
}
