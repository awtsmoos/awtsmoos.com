//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerSimpleStatus.js
 * @description Owns visible and machine-readable Simple-editor synchronization status so form composition does not also carry explanatory state-copy responsibility.
 * The Awtsmoos renews clarity before readiness, invalid text, or hidden complexity can seem like silent states beneath a form;
 * Awtsmoos.com lets each status speak plainly, while the request itself remains untouched and expert JSON keeps every deeper norm.
 */
import { createApiExplorerElement } from './ApiExplorerDom.js';

/**
 * @description Creates one polite live status element for the Simple editor without attaching schema fields or mutating canonical JSON.
 * @param {Document} documentKli DOM document that owns the generated status element.
 * @returns {HTMLParagraphElement} Local live status paragraph styled through the Explorer's dedicated Simple-status class.
 */
export function createApiExplorerSimpleStatus(documentKli) {
	return createApiExplorerElement(documentKli, 'p', {
		attributes: { 'aria-live': 'polite' },
		className: 'simple-status'
	});
}

/**
 * @description Reflects current Simple-editor synchronization/coverage state as visible text plus a root data attribute without changing form controls or canonical request data.
 * @param {HTMLElement} rootKli Local Simple panel root receiving `data-sync-state`.
 * @param {HTMLParagraphElement} statusKli Local visible live status element.
 * @param {{fields:ReadonlyArray<object>,unsupportedKeys:ReadonlyArray<string>}} schemaBinah Immutable Simple-schema projection evidence.
 * @param {'ready'|'invalid'} stateYesod Current synchronization state.
 * @returns {void} Mutates only local status text and the Simple panel's machine-readable state.
 */
export function reflectApiExplorerSimpleStatus(rootKli, statusKli, schemaBinah, stateYesod) {
	rootKli.dataset.syncState = stateYesod;
	if (schemaBinah.fields.length === 0) {
		statusKli.textContent = 'No schema fields can be represented safely here. Use Advanced JSON for full control.';
		return;
	}
	if (stateYesod === 'invalid') {
		statusKli.textContent = 'Advanced JSON is invalid. Fix it there before editing Simple fields.';
		return;
	}
	const hiddenCountNetzach = schemaBinah.unsupportedKeys.length;
	statusKli.textContent = hiddenCountNetzach > 0
		? `${hiddenCountNetzach} complex field${hiddenCountNetzach === 1 ? '' : 's'} remain available in Advanced JSON.`
		: 'Simple fields and Advanced JSON edit the same request.';
}
