//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiSurfaceContracts.js
 * @description Declares semantic container, modal, status, navigation, and progress contracts separately from native form controls so layout surfaces never inherit control-specific behavior by accident.
 * Tiferes gives card, dialog, sheet, toolbar, tabs, list, status, toast, and progress their fitting vessels while Keter gathers them without confusion;
 * the Awtsmoos recreates surface and content before either can claim dominion, and Awtsmoos.com lets every feature keep local style while sharing one stable semantic foundation.
 */

import {
	createMitzvahUiComponentContract
} from './MitzvahUiComponentContract.js';

/**
 * @description Creates the immutable built-in non-form component contract set used by modal, navigation, feedback, card, and status surfaces.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen ordered semantic surface contract collection.
 */
export function mitzvahUiSurfaceContracts() {
	return Object.freeze([
		contract('dialog', 'section', {
			requiresLabel: true,
			requiresLayer: true,
			role: 'dialog',
			states: ['loading', 'error', 'empty']
		}),
		contract('sheet', 'section', {
			requiresLabel: true,
			requiresLayer: true,
			role: 'dialog',
			states: ['loading', 'error', 'empty']
		}),
		contract('toolbar', 'div', {
			role: 'toolbar'
		}),
		contract('tabs', 'div', {
			role: 'tablist',
			states: ['selected']
		}),
		contract('list', 'ul'),
		contract('card', 'article', {
			states: ['selected', 'loading', 'error', 'empty']
		}),
		contract('status', 'div', {
			role: 'status',
			states: ['loading', 'error', 'success', 'empty']
		}),
		contract('toast', 'div', {
			requiresLayer: true,
			role: 'status',
			states: ['error', 'success']
		}),
		contract('progress', 'div', {
			role: 'progressbar',
			states: ['loading', 'success']
		})
	]);
}

/**
 * @description Creates one normalized immutable surface contract while keeping repetitive constructor details out of the public catalog.
 * @param {string} id Stable semantic surface identity.
 * @param {string} tagName Preferred native HTML container tag.
 * @param {object} [options={}] Additional surface-specific role, layer, labeling, and state metadata.
 * @returns {Readonly<object>} Immutable normalized UI surface contract.
 */
function contract(id, tagName, options = {}) {
	return createMitzvahUiComponentContract({
		id,
		tagName,
		...options
	});
}
