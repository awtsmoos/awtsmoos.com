//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAssetsPanel.js
 * The Awtsmoos renews reusable possibility while Awtsmoos.com gathers vector, 3D, media, audio, data, and generated assets beside the stage;
 * each card creates a canonical scene instance, letting Premiere project bins and Unity asset browsers share one practical creative page.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { searchStudioAssets } from '../../assets/StudioAssetCatalog.js';

export function createStudioAssetsPanel() {
	const card = {
		tag: 'button',
		class: 'studio-asset-card',
		'data-layer-kind': context => context.data.item.kind,
		$on: { click: 'createEditorLayer' },
		children: [
			{ tag: 'span', class: 'studio-asset-glyph', text: context => context.data.item.glyph },
			{ tag: 'strong', text: context => context.data.item.label },
			{ tag: 'span', text: context => context.data.item.category }
		]
	};
	return UI.div(
		{ class: 'studio-editor-panel-content' },
		UI.div({ class: 'studio-panel-heading' }, UI.strong({ text: 'Project Assets' }), UI.span({ text: '2D · 3D · Media · Audio · Generated' })),
		UI.input({ class: 'studio-panel-search', value: context => context.store.get('assetSearch'), placeholder: 'Search project assets…', 'aria-label': 'Search Studio assets', $on: { input: 'updateAssetSearch' } }),
		UI.div({ class: 'studio-assets-grid' }, { ...card, $each: { items: context => searchStudioAssets(context.store.get('assetSearch')) } })
	);
}
