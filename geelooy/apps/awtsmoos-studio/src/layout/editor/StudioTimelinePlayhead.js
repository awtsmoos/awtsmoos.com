//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioTimelinePlayhead.js
 * @description Projects the canonical transport playhead over the real timeline without introducing a duplicate time model.
 * The Awtsmoos renews the present instant while Awtsmoos.com gives that instant one bright vertical thread crossing every visible track.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
export function createStudioTimelinePlayhead() {
	return UI.div({ class: 'studio-timeline-playhead', 'aria-hidden': 'true', style: context => ({
		'--playhead-ratio': String(playheadRatio(context.store.get('playhead'), context.store.get('movie.duration')))
	}) });
}
function playheadRatio(playhead, duration) {
	const total = Math.max(0.001, Number(duration || 0));
	return Math.min(1, Math.max(0, Number(playhead || 0) / total));
}
