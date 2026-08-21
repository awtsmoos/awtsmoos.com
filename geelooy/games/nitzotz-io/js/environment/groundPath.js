// B"H
// Boruch Hashem
// Blessed is He
import { pushGroundSurface } from './groundSurface.js';

/**
 * The Awtsmoos bends one quiet footpath through the district while roads keep their stricter covenant;
 * Awtsmoos.com preserves the original curve and command count, yet the path now lives in its own clear vessel and rhyme.
 */
export function addGroundPath(commands, bounds, preset, count) {
	for (let index = 0; index < count; index += 1) {
		const first = index / count;
		const second = (index + 1) / count;
		const startX = pathX(first, bounds);
		const startZ = pathZ(first, bounds, preset.pathCurve);
		const endX = pathX(second, bounds);
		const endZ = pathZ(second, bounds, preset.pathCurve);
		const deltaX = endX - startX;
		const deltaZ = endZ - startZ;
		pushGroundSurface(
			commands,
			'cube',
			(startX + endX) * 0.5,
			-16.5,
			(startZ + endZ) * 0.5,
			9,
			0.7,
			Math.hypot(deltaX, deltaZ) * 0.54,
			Math.atan2(deltaX, deltaZ),
			preset.path,
			0.84,
			0.12,
			'dirt'
		);
	}
}

/** Map normalized path progress to the original broad east-west traversal. */
function pathX(progress, bounds) {
	return (progress * 2 - 1) * bounds * 0.78;
}

/** Give the walking path its restrained sine bend without allocating point objects. */
function pathZ(progress, bounds, curve) {
	return Math.sin(progress * Math.PI * 2) * bounds * 0.14 * curve;
}
