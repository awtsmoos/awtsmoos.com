//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEffectsInspector.js
 * The Awtsmoos renews appearance beyond geometry while Awtsmoos.com gives each selected layer a visible compositing and effect stack;
 * portable filters, glow, opacity, and blend modes pass through canonical metadata into actual Canvas rendering instead of remaining a mockup plaque.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioLayer } from '../../editor/StudioLayerAccess.js';
import { STUDIO_BLEND_MODES, STUDIO_EFFECTS, getStudioEffectDefinition } from '../../effects/StudioEffectCatalog.js';

export function createStudioEffectsInspector() {
	const effectRow = {
		tag: 'div',
		class: 'studio-effect-row',
		children: [
			{ tag: 'button', class: 'studio-effect-toggle', 'data-effect-id': context => context.data.item.id, text: context => context.data.item.enabled === false ? '○' : '●', $on: { click: 'toggleLayerEffect' } },
			{ tag: 'span', class: 'studio-effect-name', text: context => getStudioEffectDefinition(context.data.item.id)?.label || context.data.item.id },
			{ tag: 'input', class: 'studio-effect-value', type: 'number', value: context => context.data.item.value, step: context => getStudioEffectDefinition(context.data.item.id)?.step || 0.05, 'data-effect-id': context => context.data.item.id, $on: { change: 'updateLayerEffect' } },
			{ tag: 'button', class: 'studio-effect-remove', text: '×', 'data-effect-id': context => context.data.item.id, $on: { click: 'removeLayerEffect' } }
		]
	};
	return UI.section(
		{ class: 'studio-inspector-section studio-effects-inspector' },
		UI.strong({ text: 'Effects + Composite' }),
		UI.select({ class: 'studio-blend-mode-select', value: context => selectedLayer(context)?.blendMode || 'source-over', $on: { change: 'updateLayerBlendMode' } }, ...STUDIO_BLEND_MODES.map(mode => UI.option({ value: mode, text: `Blend · ${mode}` }))),
		UI.div({ class: 'studio-effect-add-grid' }, ...STUDIO_EFFECTS.map(effect => UI.button({ class: 'studio-effect-add', text: `+ ${effect.label}`, 'data-effect-id': effect.id, $on: { click: 'addLayerEffect' } }))),
		UI.div({ class: 'studio-effect-stack' }, { ...effectRow, $each: { items: context => selectedLayer(context)?.effects || [] } })
	);
}

function selectedLayer(context) {
	return getStudioLayer(context.store.get('movie'), context.store.get('selectedSceneId'), context.store.get('selectedLayerId'));
}
