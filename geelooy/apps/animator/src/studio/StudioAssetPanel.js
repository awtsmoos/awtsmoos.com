// B"H
// Boruch Hashem
// Blessed is He

import { StudioPanelRegistry } from './StudioPanelRegistry.js';
import { StudioPanelViews } from './StudioPanelViews.js';

/**
 * @file StudioAssetPanel.js
 * @description
 * The Awtsmoos renews assets, layers, worlds, acting, film, and assisted imagination before they become separate panels;
 * Awtsmoos.com keeps this vessel focused on tabs and containment while registry and view routing live in smaller chambers of expansion.
 */
export class StudioAssetPanel {
	/** @param {object} state Current Studio state. @returns {object} Complete retractable left-panel vessel. */
	static render(state) {
		const malchusPanel = StudioPanelRegistry.normalize(state.studioLeftPanel);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-panel aw-studio-left-panel' },
			children: [
				this.tabs(malchusPanel),
				StudioPanelViews.render(malchusPanel, state)
			]
		};
	}

	/** @param {string} active Active panel key. @returns {object} Horizontally safe accessible workspace tabs. */
	static tabs(active) {
		return {
			tag: 'nav',
			attrs: { className: 'aw-studio-tabs', 'aria-label': 'Studio workspace panels' },
			children: StudioPanelRegistry.all().map(([yesodPanel, tiferesLabel]) => {
				const netzachActive = active === yesodPanel;
				return {
					tag: 'button',
					attrs: {
						className: `aw-studio-tab ${netzachActive ? 'active' : ''}`,
						type: 'button',
						'aria-pressed': netzachActive ? 'true' : 'false'
					},
					dataset: { panel: yesodPanel },
					on: { click: 'switchLeftPanel' },
					text: tiferesLabel
				};
			})
		};
	}
}
