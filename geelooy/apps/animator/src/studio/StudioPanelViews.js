// B"H
// Boruch Hashem
// Blessed is He

import { StudioAiView } from './panels/StudioAiView.js';
import { StudioAssetsView } from './panels/StudioAssetsView.js';
import { StudioCreateView } from './panels/StudioCreateView.js';
import { StudioFilmView } from './panels/StudioFilmView.js';
import { StudioHierarchyView } from './panels/StudioHierarchyView.js';
import { StudioPerformanceView } from './panels/StudioPerformanceView.js';
import { StudioWorldView } from './panels/StudioWorldView.js';

/**
 * @file StudioPanelViews.js
 * @description
 * The Awtsmoos renews each focused workspace view while this assembly root merely chooses which vessel is visible now;
 * Awtsmoos.com keeps imports and routing out of the tab renderer so both files stay small as professional destinations grow somehow.
 */
export class StudioPanelViews {
	/** @param {string} panel Selected panel key. @param {object} state Studio state. @returns {object} Focused view specification. */
	static render(panel, state) {
		const binahRenderers = {
			assets: () => StudioAssetsView.render(state),
			layers: () => StudioHierarchyView.render(state),
			create: () => StudioCreateView.render(state),
			world: () => StudioWorldView.render(state),
			performance: () => StudioPerformanceView.render(state),
			film: () => StudioFilmView.render(state),
			ai: () => StudioAiView.render(state)
		};
		return (binahRenderers[panel] || binahRenderers.assets)();
	}
}
