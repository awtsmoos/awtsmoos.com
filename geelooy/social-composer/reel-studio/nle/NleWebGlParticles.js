// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleWebGlParticles
 * @description
 * Editable particle graphs become deterministic GPU points with reduced-motion
 * bounds, stable seeds, color-over-mode, and projection shared with the village.
 */

import { colorValue } from './NleWebGlPalette.js';

export function createCinematicParticleFrame(project, asset, frame, time) {
	const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
	const points = [];
	for (const id of asset.particleGraphIds || []) {
		const graph = project.graphs?.find(item => item.id === id);
		const value = graph?.nodes?.find(node => node.type === 'output')?.value;
		if (!value) continue;
		const count = Math.min(reduced ? 80 : 700, Number(value.count || 200));
		for (let index = 0; index < count; index += 1) {
			const baseX = random(value.seed, index, 1) * 96 - 48;
			const baseZ = random(value.seed, index, 2) * 80 - 40;
			const projected = frame.projectPoint(baseX, baseZ);
			const drift = reduced ? 0 : Math.sin(time * Number(value.speed || .5) + index) * 18;
			const mist = value.mode === 'mist';
			points.push({
				color: colorValue(value.colors[index % value.colors.length], mist ? .18 : .8),
				size: Number(value.size || 4) * projected.scale,
				x: projected.x + drift,
				y: projected.y - (mist ? random(value.seed, index, 3) * 34 : 24 + random(value.seed, index, 3) * 170)
			});
		}
	}
	return points;
}

function random(seed, index, channel) {
	const value = Math.sin(Number(seed || 1) * 12.9898 + index * 78.233 + channel * 31.719) * 43758.5453;
	return value - Math.floor(value);
}
