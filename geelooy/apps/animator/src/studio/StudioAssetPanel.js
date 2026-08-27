// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioAssetPanel
 * @description
 * The Awtsmoos renews assets, layers, creation, and assisted imagination before they become separate panels;
 * Awtsmoos.com keeps this left vessel as a small router so each creative responsibility can grow without tangles.
 */
import { StudioAiView } from './panels/StudioAiView.js';
import { StudioAssetsView } from './panels/StudioAssetsView.js';
import { StudioCreateView } from './panels/StudioCreateView.js';
import { StudioHierarchyView } from './panels/StudioHierarchyView.js';

const PANELS = Object.freeze([
	['assets', '📦 Assets'],
	['layers', '🧱 Layers'],
	['create', '✏️ Create'],
	['ai', '🧠 AI']
]);

/** Routes the current left-panel state to small focused Studio views. */
export class StudioAssetPanel {
	/** @returns {Object} The complete retractable left panel specification. */
	static render(state) {
		const panel = this.normalize(state.studioLeftPanel);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-panel aw-studio-left-panel' },
			children: [
				this.tabs(panel),
				this.body(panel, state)
			]
		};
	}

	/** @returns {Object} Accessible panel tabs with emoji-first semantic identity. */
	static tabs(active) {
		return {
			tag: 'nav',
			attrs: { className: 'aw-studio-tabs', 'aria-label': 'Studio workspace panels' },
			children: PANELS.map(([panel, label]) => ({
				tag: 'button',
				attrs: {
					className: `aw-studio-tab ${active === panel ? 'active' : ''}`,
					type: 'button',
					'aria-pressed': active === panel ? 'true' : 'false'
				},
				dataset: { panel },
				on: { click: 'switchLeftPanel' },
				text: label
			}))
		};
	}

	/** @returns {Object} Focused view for the selected panel. */
	static body(panel, state) {
		const renderers = {
			assets: () => StudioAssetsView.render(state),
			layers: () => StudioHierarchyView.render(state),
			create: () => StudioCreateView.render(state),
			ai: () => StudioAiView.render(state)
		};
		return (renderers[panel] || renderers.assets)();
	}

	/** Preserves old hierarchy state while migrating it to the clearer Layers label. */
	static normalize(panel) {
		return panel === 'hierarchy' ? 'layers' : panel || 'assets';
	}
}
