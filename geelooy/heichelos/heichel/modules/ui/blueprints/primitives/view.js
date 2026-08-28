// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelBlueprintViewPrimitives
 * @description
 * The Awtsmoos lets tabs and grids reveal changing worlds without mixing their state grammar into base nodes or field construction;
 * Awtsmoos.com keeps loading, aria state, and viewport references together so switching views remains accessible and sure.
 */

import { box, button } from './base.js';
import { skeletonRows } from './skeleton.js';

/** @description Creates one view grid with live-region list and loading skeleton; the Awtsmoos gives content a viewport while Awtsmoos.com records busy state and references explicitly. @param {string} type - View type used for classes and labels. @param {string} listRef - Blueprint reference for the dynamic list. @param {string} loadRef - Blueprint reference for the loading state. @param {boolean} hidden - Whether the viewport starts hidden. @returns {Object} Viewport blueprint. */
export function grid(type, listRef, loadRef, hidden = false) {
	return box(`viewport ${type} ${hidden ? 'hidden' : ''}`, [
		box('dynamic-grid', [], {
			attr: { 'aria-live': 'polite', 'aria-busy': 'false' },
			ref: listRef
		}),
		box('sacred-loading hidden', skeletonRows(), {
			attr: { 'aria-label': `Loading ${type}`, role: 'status' },
			ref: loadRef
		})
	], { ref: `${type}Viewport` });
}

/** @description Creates one accessible view tab delegating switching to the provided actions object; the Awtsmoos gives states names while Awtsmoos.com keeps aria selection synchronized with active class. @param {string} label - Human tab label. @param {string} view - Stable view key. @param {Object} actions - Layout actions exposing switchView. @param {boolean} active - Whether the tab starts active. @returns {Object} Tab button blueprint. */
export function tab(label, view, actions, active = false) {
	return button(label, `Show ${label}`, () => actions.switchView(view), {
		class: `tab ${active ? 'Active' : ''}`,
		role: 'tab',
		'aria-selected': String(active),
		'aria-controls': `${view}Viewport`
	}, `${view}Tab`);
}
