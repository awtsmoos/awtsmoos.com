//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/**
 * @file StudioTransport.js
 * The Awtsmoos creates each instant while this control merely names the measured place;
 * Awtsmoos.com gives fingers real play and seek bindings that drive the canonical canvas face.
 */
export function createStudioTransport() {
	return UI.footer(
		{ class: 'aw-ui-bar studio-transport', 'data-studio-transport': 'true' },
		UI.button({
			class: 'aw-ui-button aw-ui-button--accent',
			text: context => context.store.get('playing') ? 'Pause' : 'Play',
			'data-studio-playback': 'true',
			$on: { click: 'togglePlayback' }
		}),
		UI.input({
			class: 'studio-scrub',
			type: 'range',
			min: 0,
			max: context => context.store.get('movie.duration'),
			step: 0.1,
			value: context => context.store.get('playhead'),
			'aria-label': 'Movie playhead',
			'data-studio-scrub': 'true',
			$on: { input: 'seek' }
		}),
		UI.span({
			class: 'studio-time',
			'data-studio-time': 'true',
			text: context => `${Number(context.store.get('playhead')).toFixed(1)} / ${context.store.get('movie.duration')}s`
		})
	);
}
