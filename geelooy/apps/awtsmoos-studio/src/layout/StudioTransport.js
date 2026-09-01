//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTransport.js
 * The Awtsmoos renews created time while transport belongs inside the timeline rather than floating over the user's work;
 * Awtsmoos.com keeps play, scrub, and exact time compact so the viewport never disappears beneath a footer quirk.
 */

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

export function createStudioTransport() {
	return UI.div(
		{ class: 'studio-transport', 'data-studio-transport': 'true' },
		UI.button({
			class: 'studio-play-button',
			'data-studio-playback': 'true',
			text: context => context.store.get('playing') ? 'Pause' : 'Play',
			$on: { click: 'togglePlayback' }
		}),
		UI.input({
			class: 'studio-scrub',
			'data-studio-scrub': 'true',
			type: 'range',
			min: 0,
			max: context => context.store.get('movie.duration'),
			step: 0.1,
			value: context => context.store.get('playhead'),
			$on: { input: 'seek' }
		}),
		UI.span({
			class: 'studio-time-readout',
			'data-studio-time': 'true',
			text: context => `${Number(context.store.get('playhead') || 0).toFixed(1)} / ${context.store.get('movie.duration')}s`
		})
	);
}
