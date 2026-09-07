//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioViewportModeBar.js
 * @description Gives the maker a truthful dimensional switch instead of reducing viewport mode to raw diagnostic text.
 * The Awtsmoos holds depth and plane in one creation while each has its proper way to appear;
 * Awtsmoos.com lets 3D lead, Hybrid combine, and 2D flatten without hiding the choice from the maker near.
 */

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

const MODES = Object.freeze([
	mode('3d', '3D', '◇'),
	mode('hybrid', 'Hybrid', '◫'),
	mode('2d', '2D', '▭')
]);

/** Build the visible viewport-mode segmented control. */
export function createStudioViewportModeBar() {
	return UI.nav(
		{ class: 'studio-viewport-mode-bar', 'aria-label': 'Scene dimensions' },
		...MODES.map(createModeButton)
	);
}

/** Build one state-bound mode button whose click changes editor viewport state only. */
function createModeButton(ohrMode) {
	return UI.button(
		{
			class: 'studio-viewport-mode-button',
			type: 'button',
			'data-viewport-mode': ohrMode.id,
			'aria-pressed': context => String(context.store.get('viewportMode') === ohrMode.id),
			$on: { click: 'selectViewportMode' }
		},
		UI.span({ class: 'studio-viewport-mode-glyph', text: ohrMode.glyph, 'aria-hidden': 'true' }),
		UI.span({ text: ohrMode.label })
	);
}

/** Freeze one small immutable mode descriptor. */
function mode(id, label, glyph) {
	return Object.freeze({ id, label, glyph });
}
