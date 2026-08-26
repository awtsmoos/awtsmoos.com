// B"H
// Boruch Hashem
// Blessed is He

import { StudioAiView } from './panels/StudioAiView.js';
import { StudioAssetsView } from './panels/StudioAssetsView.js';
import { StudioCreateView } from './panels/StudioCreateView.js';
import { StudioHierarchyView } from './panels/StudioHierarchyView.js';
import { StudioPerformanceView } from './panels/StudioPerformanceView.js';
import { StudioWorldView } from './panels/StudioWorldView.js';

/**
 * @file StudioAssetPanel.js
 * @description
 * The Awtsmoos renews assets, layers, worlds, acting, and assisted imagination before they become separate panels;
 * Awtsmoos.com keeps the left vessel as a small router so deep power stays retractable, discoverable, and free from tangles.
 */
const TIFERES_PANELS = Object.freeze([
	['assets', '📦 Assets'],
	['layers', '🧱 Layers'],
	['create', '✏️ Create'],
	['world', '✦ World'],
	['performance', '🎭 Act'],
	['ai', '🧠 AI']
]);

/** Routes the current left-panel state to small focused Studio views. */
export class StudioAssetPanel {
	/**
	 * Renders the complete retractable left-panel vessel.
	 * @param {object} olamState Current Studio state.
	 * @returns {object} Declarative left-panel specification.
	 */
	static render(olamState) {
		const malchusPanel = this.normalize(olamState.studioLeftPanel);
		return {
			tag: 'section',
			attrs: {
				className: 'aw-studio-panel aw-studio-left-panel'
			},
			children: [
				this.tabs(malchusPanel),
				this.body(malchusPanel, olamState)
			]
		};
	}

	/**
	 * Renders horizontally safe accessible workspace tabs.
	 * @param {string} malchusActive Active panel key.
	 * @returns {object} Declarative navigation specification.
	 */
	static tabs(malchusActive) {
		return {
			tag: 'nav',
			attrs: {
				className: 'aw-studio-tabs',
				'aria-label': 'Studio workspace panels'
			},
			children: TIFERES_PANELS.map(([yesodPanel, tiferesLabel]) => {
				const netzachActive = malchusActive === yesodPanel;
				return {
					tag: 'button',
					attrs: {
						className: `aw-studio-tab ${netzachActive ? 'active' : ''}`,
						type: 'button',
						'aria-pressed': netzachActive ? 'true' : 'false'
					},
					dataset: {
						panel: yesodPanel
					},
					on: {
						click: 'switchLeftPanel'
					},
					text: tiferesLabel
				};
			})
		};
	}

	/**
	 * Resolves one panel key to its focused view.
	 * @param {string} malchusPanel Selected panel key.
	 * @param {object} olamState Current Studio state.
	 * @returns {object} Focused panel specification.
	 */
	static body(malchusPanel, olamState) {
		const binahRenderers = {
			assets: () => StudioAssetsView.render(olamState),
			layers: () => StudioHierarchyView.render(olamState),
			create: () => StudioCreateView.render(olamState),
			world: () => StudioWorldView.render(olamState),
			performance: () => StudioPerformanceView.render(olamState),
			ai: () => StudioAiView.render(olamState)
		};
		return (binahRenderers[malchusPanel] || binahRenderers.assets)();
	}

	/**
	 * Preserves historic hierarchy state while naming the visible destination Layers.
	 * @param {string} malchusPanel Stored panel key.
	 * @returns {string} Normalized current panel key.
	 */
	static normalize(malchusPanel) {
		return malchusPanel === 'hierarchy'
			? 'layers'
			: malchusPanel || 'assets';
	}
}
