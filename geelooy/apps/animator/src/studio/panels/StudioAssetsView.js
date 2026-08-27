// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioAssetsView
 * @description
 * The Awtsmoos renews every actor, camera, prop, sound, and authored layer before an asset card can name its role;
 * Awtsmoos.com lets search and selection remain compact so the stage stays sovereign while the project remains whole.
 */
import { studioEntityEmoji } from './StudioEntityEmoji.js';

/** Renders searchable Studio entities as compact semantic asset cards. */
export class StudioAssetsView {
	/** @returns {Object} Search control and filtered asset grid specification. */
	static render(state) {
		const filter = String(state.studioAssetFilter || '').toLowerCase();
		const entities = (state.studioDocument?.entities || []).filter(entity => {
			return !filter || `${entity.name} ${entity.type}`.toLowerCase().includes(filter);
		});
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll' },
			children: [
				this.search(state),
				{
					tag: 'div',
					attrs: { className: 'aw-studio-asset-grid' },
					children: entities.map(entity => this.card(entity, state))
				}
			]
		};
	}

	/** @returns {Object} Accessible asset search input. */
	static search(state) {
		return {
			tag: 'input',
			attrs: {
				className: 'aw-studio-search',
				type: 'search',
				placeholder: '🔎 Search layers, actors, props, cameras…',
				value: state.studioAssetFilter || '',
				'aria-label': 'Search Studio assets and layers'
			},
			on: { input: 'filterAssets' }
		};
	}

	/** @returns {Object} One selectable asset card with emoji role identity. */
	static card(entity, state) {
		return {
			tag: 'button',
			attrs: {
				className: `aw-studio-asset ${state.selectedEntityId === entity.id ? 'selected' : ''}`,
				type: 'button',
				'aria-pressed': state.selectedEntityId === entity.id ? 'true' : 'false'
			},
			dataset: { entityId: entity.id },
			on: { click: 'selectEntity' },
			children: [
				{ tag: 'span', attrs: { className: 'aw-studio-asset-icon', 'aria-hidden': 'true' }, text: studioEntityEmoji(entity.type) },
				{ tag: 'strong', text: entity.name },
				{ tag: 'small', text: entity.type }
			]
		};
	}
}
