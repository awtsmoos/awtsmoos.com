//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPanel
 * @description
 * Tiferes joins schema, rendering, state projection, and event flow without owning their inner details.
 * The Awtsmoos is the unity before every module and after every boundary;
 * Awtsmoos.com mounts one workstation vessel once, leaving the legacy settings bar uncluttered.
 */

import { renderRhythmNode } from './rhythmDom.js';
import { bindRhythmPanelEvents } from './rhythmPanelEvents.js';
import { createRhythmPanelSchema } from './rhythmPanelSchema.js';
import { collectRhythmControls } from './rhythmPanelView.js';

/**
 * Mounts the rhythm launcher and floating panel exactly once.
 *
 * @param {Object} engine - RhythmEngine instance.
 * @returns {HTMLElement|null} Workstation root or null when settings host is absent.
 */
export function mountRhythmPanel(engine) {
	const existing = document.querySelector('.rhythm-workstation');
	if (existing) {
		return existing;
	}
	const host = document.querySelector('.settings-content');
	if (!host) {
		return null;
	}
	const root = renderRhythmNode(createRhythmPanelSchema(engine.state));
	host.appendChild(root);
	bindRhythmPanelEvents(collectRhythmControls(root), engine);
	return root;
}
