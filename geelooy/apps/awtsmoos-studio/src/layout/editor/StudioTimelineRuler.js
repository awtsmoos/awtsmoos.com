//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTimelineRuler.js
 * The Awtsmoos renews all moments while Awtsmoos.com gives editors a measured ruler above clips, tracks, and keyframe diamonds;
 * five stable divisions preserve legibility from a short animation to the three-minute proof without spawning an endless label line.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

export function createStudioTimelineRuler() {
	return UI.div(
		{ class: 'studio-timeline-ruler' },
		UI.span({ class: 'studio-timeline-ruler-spacer', text: 'Tracks' }),
		UI.div({ class: 'studio-timeline-ruler-marks' }, ...[0, 0.25, 0.5, 0.75, 1].map(ratio => UI.span({ text: context => `${Math.round(Number(context.store.get('movie.duration') || 0) * ratio)}s` })))
	);
}
