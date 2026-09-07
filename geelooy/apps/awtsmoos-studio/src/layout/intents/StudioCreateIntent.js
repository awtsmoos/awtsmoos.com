//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCreateIntent.js
 * @description Presents one truthful native-world grid and one compact 2D add-on grid without abusing AwtsmoosUI repetition semantics.
 * The Awtsmoos calls mountain, water, Chossid, camera, and light into ordered vessels before a flat title joins their view;
 * Awtsmoos.com keeps one grid as one grid, while every real button crosses the canonical command path so visible choice and movie truth stay true.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

export const STUDIO_WORLD_CREATE_ITEMS = Object.freeze([
	item('Terrain', '⛰', 'terrain3d'),
	item('Water', '≋', 'water3d'),
	item('World', '◎', 'world3d'),
	item('Camera', '◉', 'camera'),
	item('Chossid', '♙', 'character3d'),
	item('Light', '☀', 'light3d')
]);

export const STUDIO_TWO_D_ADDON_ITEMS = Object.freeze([
	item('Text', 'T', 'text'),
	item('Caption', 'CC', 'caption'),
	item('Shape', '□', 'shape2d'),
	item('Overlay', '▱', 'overlay')
]);

/** Create the contextual phone-first Create sheet from commands already backed by canonical movie state. */
export function createStudioCreateIntent() {
	return UI.section(
		{
			class: 'studio-intent-body studio-create-intent',
			hidden: context => context.store.get('primaryIntent') !== 'create'
		},
		UI.div({ class: 'studio-create-title', text: createTitle }),
		UI.div(
			{
				class: 'studio-intent-action-grid studio-world-action-grid',
				hidden: context => context.store.get('viewportMode') === '2d'
			},
			...STUDIO_WORLD_CREATE_ITEMS.map(createQuickButton)
		),
		UI.div({
			class: 'studio-intent-subheading studio-two-d-addon-heading',
			text: context => context.store.get('viewportMode') === '2d' ? 'Create in 2D' : '2D Add-ons'
		}),
		UI.div(
			{ class: 'studio-intent-action-grid studio-two-d-addon-grid' },
			...STUDIO_TWO_D_ADDON_ITEMS.map(createQuickButton)
		),
		UI.div({ class: 'studio-intent-subheading', text: 'Scene starters' }),
		UI.div(
			{ class: 'studio-intent-template-track' },
			createTemplateButton()
		)
	);
}

/** Name the creation context according to the dimensional view currently chosen. */
function createTitle(context) {
	return context.store.get('viewportMode') === '2d' ? 'Create in 2D' : 'Create in 3D';
}

/** Build one explicit canonical create-command button so the surrounding grid is never repeated. */
function createQuickButton(ohrItem) {
	return UI.button(
		{
			class: 'studio-intent-action-button',
			type: 'button',
			'data-command-type': 'create',
			'data-command-value': ohrItem.kind,
			$on: { click: 'executeStudioCommand' }
		},
		UI.span({ class: 'studio-intent-action-glyph', text: ohrItem.glyph, 'aria-hidden': 'true' }),
		UI.span({ text: ohrItem.label })
	);
}

/** Repeat only the template button node, leaving one track container in the rendered DOM. */
function createTemplateButton() {
	return UI.button(
		{
			class: 'studio-intent-template-button',
			type: 'button',
			$each: { items: context => context.store.get('templates') },
			'data-template-id': context => context.data.item.id,
			$on: { click: 'loadTemplate' }
		},
		UI.strong({ text: context => context.data.item.title }),
		UI.span({ text: context => context.data.item.category })
	);
}

/** Freeze one compact label/glyph/kind descriptor used only at definition time. */
function item(label, glyph, kind) {
	return Object.freeze({ label, glyph, kind });
}
