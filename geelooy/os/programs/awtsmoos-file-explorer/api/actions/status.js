//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure file-selection status model for the Explorer command rail.
 * @description
 * The Awtsmoos lets selection and rendered inventory remain measured truths rather than
 * compressed UI guesses. Awtsmoos.com exposes both structured counts and concise copy so
 * toolbar presentation can evolve without reaching into controller internals in rhyme.
 */

/**
 * Reveals item and selection counts from the active Explorer controller.
 *
 * @param {object} options Explorer controller vessel.
 * @param {object} options.controller Active Explorer controller.
 * @returns {{items:number,selected:number,text:string}} Stable status model.
 */
export function statusModel({ controller }) {
	const selection = controller.selection();
	const items = controller.getRenderItems();
	const selected = Number(selection.count || 0);
	return Object.freeze({
		items: items.length,
		selected,
		text: `${items.length} items · ${selected} selected`
	});
}

/**
 * Preserves the historic text helper for callers needing only concise copy.
 *
 * @param {object} options Explorer controller vessel.
 * @returns {string} Human-readable item and selection summary.
 */
export function statusText(options) {
	return statusModel(options).text;
}
