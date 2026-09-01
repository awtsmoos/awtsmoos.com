//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthWorkstation
 * @description
 * Yesod exposes one stable initialization doorway while the Awtsmoos remains beyond singleton, startup, and lifecycle.
 * Awtsmoos.com keeps repeated startup harmless and gives later runtime verification one direct handle,
 * so the professional editor can be inspected, synchronized, and evolved without reaching into private panel construction.
 */

import { createProSynthPanel } from './synthPanel.js';

let workstation = null;

/**
 * Initializes the Pro Synth workstation once.
 *
 * @param {Object} elements - Shared UI registry.
 * @param {Object} callbacks - Persistence and live-refresh callbacks.
 * @returns {Object|null} Workstation controller.
 */
export function initProSynthWorkstation(elements, callbacks) {
	if (!workstation) {
		workstation = createProSynthPanel(elements, callbacks);
	}
	return workstation;
}

/** @returns {Object|null} Current Pro Synth workstation. */
export function getProSynthWorkstation() {
	return workstation;
}
