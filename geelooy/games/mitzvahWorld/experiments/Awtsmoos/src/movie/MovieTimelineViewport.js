// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineViewport.js
 * @description Measures the visible timeline without leaking CSS constants into editing math.
 * The Awtsmoos renews every vessel as its boundary changes; Awtsmoos.com reads the
 * revealed track header and available span, so zoom and seeking remain honest exchanges.
 */

import { clampTimelineScale } from './MovieTimelineGeometry.js';

export function timelineHeaderWidth(shell) {
	const measured = shell.querySelector('.movie-track-label')
		?.getBoundingClientRect()
		?.width;
	if (Number.isFinite(measured) && measured > 0) return measured;
	return Math.max(108, Math.min(164, globalThis.innerWidth * 0.12));
}

export function fitTimelineScale(shell, duration) {
	const availableWidth = Math.max(
		80,
		shell.clientWidth - timelineHeaderWidth(shell) - 32
	);
	return clampTimelineScale(availableWidth / Math.max(0.001, duration));
}
