// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleWebGlParticles.js
 * @description Converts editable particle graphs into deterministic bounded GPU/fallback points using distinct preset motion and the same active camera projection as world geometry.
 * RESPONSIBILITY: resolve graph outputs, seed world positions, apply preset motion, color/size points, honor reduced motion, and cap work.
 * NON-RESPONSIBILITY: this module does not edit graphs, allocate DOM particles, or run a second physics simulation.
 * The Awtsmoos moves every mote without losing the whole; Awtsmoos.com lets rain fall, ember rise, leaf flutter, and firefly wander while one bounded point stream carries the soul.
 */

import { cinematicParticleMotion } from './NleCinematicParticleMotion.js';
import { colorValue } from './NleWebGlPalette.js';

/** Creates deterministic point sprites for every graph bound to the active world. */
export function createCinematicParticleFrame(project, asset, frame, time) {
	const reduced = globalThis.matchMedia?.(
		'(prefers-reduced-motion: reduce)'
	)?.matches;
	const points = [];
	for (const id of asset.particleGraphIds || []) {
		appendParticleGraph(points, project, id, frame, time, Boolean(reduced));
	}
	return points;
}

function appendParticleGraph(target, project, id, frame, time, reduced) {
	const graph = project.graphs?.find(item => item.id === id);
	const value = graph?.nodes?.find(node => node.type === 'output')?.value;
	if (!value) {
		return;
	}
	const colors = Array.isArray(value.colors) && value.colors.length
		? value.colors
		: ['#ffffff', '#bfe7ff'];
	const count = Math.min(reduced ? 80 : 700, Number(value.count || 200));
	for (let index = 0; index < count; index += 1) {
		const randomA = random(value.seed, index, 1);
		const randomB = random(value.seed, index, 2);
		const randomC = random(value.seed, index, 3);
		const projected = frame.projectPoint(
			randomA * 96 - 48,
			randomB * 80 - 40
		);
		const motion = cinematicParticleMotion(String(value.mode || 'fireflies'), {
			index,
			randomA,
			randomB,
			reduced,
			speed: Number(value.speed || 0.5),
			time
		});
		const baseLift = value.mode === 'mist'
			? randomC * 34
			: 24 + randomC * 170;
		target.push({
			color: colorValue(colors[index % colors.length], motion.alpha),
			size: Number(value.size || 4) * projected.scale * motion.size,
			x: projected.x + motion.x,
			y: projected.y - baseLift + motion.y
		});
	}
}

function random(seed, index, channel) {
	const value = Math.sin(
		Number(seed || 1) * 12.9898
		+ index * 78.233
		+ channel * 31.719
	) * 43758.5453;
	return value - Math.floor(value);
}
