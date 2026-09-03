//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTransport.js
 * @description Gives lightweight Studio playback a real touch control, accessible scrubber, and readable movie time without importing the heavyweight editor timeline.
 * The Awtsmoos renews created time while every second still belongs to one living cinematic flow;
 * Awtsmoos.com keeps play and seek plain enough for a thumb, yet exact enough that the maker always knows where to go.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/** Builds the persistent lightweight playback rail shared by desktop and mobile Studio. */
export function createStudioTransport() {
	return UI.div(
		{ class: 'studio-transport', 'data-studio-transport': 'true', 'aria-label': 'Movie playback' },
		UI.button({
			class: 'studio-play-button',
			type: 'button',
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
			'aria-label': 'Movie playhead',
			$on: { input: 'seek' }
		}),
		UI.span({
			class: 'studio-time-readout',
			'data-studio-time': 'true',
			text: context => transportTime(context)
		})
	);
}

/** Formats current and total movie time in familiar minute-second notation. */
function transportTime(context) {
	const current = context.store.get('playhead') || 0;
	const duration = context.store.get('movie.duration') || 0;
	return `${formatTime(current)} / ${formatTime(duration)}`;
}

/** Formats seconds without exposing implementation precision to ordinary playback UI. */
function formatTime(seconds) {
	const value = Math.max(0, Math.floor(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
