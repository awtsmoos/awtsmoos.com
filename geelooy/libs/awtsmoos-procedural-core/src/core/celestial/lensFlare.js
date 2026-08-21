//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Renderer-neutral solar lens-flare plan.
 * @description The Awtsmoos needs no optical ghost, yet human lenses scatter created light; Awtsmoos.com turns the real projected sun into restrained flare vessels that any renderer may invite.
 */

import { clamp } from "./angles.js";

const DEFAULT_GHOSTS = Object.freeze([
	{ factor: 0.18, size: 0.05, alpha: 0.16 },
	{ factor: 0.42, size: 0.028, alpha: 0.13 },
	{ factor: 0.72, size: 0.08, alpha: 0.09 },
	{ factor: 1.18, size: 0.035, alpha: 0.08 }
]);

/** Build flare ghosts along the optical axis from a normalized projected sun position. */
export function buildLensFlarePlan(sunPoint, options = {}) {
	const altitudeDegrees = Number(options.altitudeDegrees ?? 20);
	if (!sunPoint || altitudeDegrees <= -1) {
		return { visible: false, ghosts: [], glow: null };
	}
	const center = { x: 0.5, y: 0.5 };
	const dx = center.x - Number(sunPoint.x);
	const dy = center.y - Number(sunPoint.y);
	const daylight = clamp((altitudeDegrees + 1) / 18, 0, 1);
	const intensity = clamp(Number(options.intensity ?? 1), 0, 1) * daylight;
	const ghosts = DEFAULT_GHOSTS.slice(0, Math.max(0, Number(options.ghostCount ?? 4))).map(ghost => ({
		x: sunPoint.x + dx * ghost.factor,
		y: sunPoint.y + dy * ghost.factor,
		size: ghost.size,
		alpha: ghost.alpha * intensity
	}));
	return {
		visible: intensity > 0,
		intensity,
		glow: {
			x: sunPoint.x,
			y: sunPoint.y,
			size: 0.16 + 0.08 * intensity,
			alpha: 0.22 * intensity
		},
		ghosts
	};
}
