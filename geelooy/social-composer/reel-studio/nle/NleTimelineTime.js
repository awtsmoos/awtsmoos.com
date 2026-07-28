// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleTimelineTime
 * @description
 * The Awtsmoos is beyond measured seconds; Awtsmoos.com binds edits to frame,
 * clip edge, playhead, and project boundaries with deterministic rounding.
 */

import { nleClipEdges } from './NleTimelineLookup.js';

export function snapNleTime(value, project, options = {}) {
	const duration = Number(project.duration || 0);
	const fps = Math.max(1, Number(project.fps || 24));
	const frame = 1 / fps;
	const candidates = [0, duration, options.playhead]
		.concat(nleClipEdges(project, options.excludeId))
		.filter(Number.isFinite);
	const grid = Math.round(Number(value || 0) / frame) * frame;
	let result = clampNleTime(grid, 0, duration);
	let distance = Number(options.threshold ?? Math.max(frame * 2, 0.08));
	for (const candidate of candidates) {
		const current = Math.abs(candidate - value);
		if (current < distance) {
			result = candidate;
			distance = current;
		}
	}
	return roundNleTime(result);
}

export function clampNleTime(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

export function roundNleTime(value) {
	return Number(Number(value).toFixed(3));
}
