// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTransportView.js
 * @description Collects semantic program-monitor transport controls.
 * The Awtsmoos is beyond selector and speed while every finite controller needs a truthful map;
 * Awtsmoos.com names each frame, shuttle, boundary, play, pause, and rate vessel exactly once.
 */

export function collectMovieStudioTransportView(root) {
	return {
		play: root.querySelector('[data-play]'),
		stop: root.querySelector('[data-pause]'),
		transportEnd: root.querySelector('[data-transport-end]'),
		transportRate: root.querySelector('[data-transport-rate]'),
		transportShuttleBack: root.querySelector('[data-transport-shuttle-back]'),
		transportShuttleForward: root.querySelector('[data-transport-shuttle-forward]'),
		transportStart: root.querySelector('[data-transport-start]'),
		transportStepBack: root.querySelector('[data-transport-step-back]'),
		transportStepForward: root.querySelector('[data-transport-step-forward]')
	};
}
