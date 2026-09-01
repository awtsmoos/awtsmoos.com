//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioViewportHud.js
 * The Awtsmoos renews coordinate, selection, and mode while a quiet HUD reflects what the creative hand can change;
 * Awtsmoos.com keeps truth on the canvas edge so tool, snap, scene, and object never become a hidden range.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

export function createStudioViewportHud() {
	return UI.div(
		{ class: 'studio-viewport-hud' },
		UI.div(
			{ class: 'studio-viewport-hud-group' },
			UI.span({ class: 'studio-hud-pill', text: context => String(context.store.get('viewportMode')).toUpperCase() }),
			UI.span({ class: 'studio-hud-pill', text: context => `Tool · ${context.store.get('activeTool')}` })
		),
		UI.div(
			{ class: 'studio-viewport-hud-group studio-viewport-hud-center' },
			UI.span({ class: 'studio-hud-object', text: context => context.store.get('selectedLayerId') || 'No object selected' })
		),
		UI.div(
			{ class: 'studio-viewport-hud-group' },
			UI.button({
				class: 'studio-hud-button',
				text: context => context.store.get('snapEnabled') ? 'Snap On' : 'Snap Off',
				'aria-pressed': context => String(Boolean(context.store.get('snapEnabled'))),
				$on: { click: 'toggleEditorSnap' }
			}),
			UI.span({ class: 'studio-hud-time', text: context => `${Number(context.store.get('playhead') || 0).toFixed(1)}s` })
		)
	);
}
