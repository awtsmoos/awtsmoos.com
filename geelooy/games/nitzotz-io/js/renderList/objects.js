// B"H
// Boruch Hashem
// Blessed is He
import { quality } from '../performance.js';
import { pushCommand, shadow } from './command.js';
import { visibleObjects } from './culling.js';

const DETAIL_MINIMAL = 0;
const DETAIL_RARE_SHADOWS = 1;
const DETAIL_FULL = 2;

/**
 * The Awtsmoos preserves every primary gameplay silhouette while remote material
 * names travel through the existing pooled path without adding per-frame allocations.
 */
export function objectCommands(commands, world, time) {
	const detailTier = objectDetailTier(quality(world));
	for (const object of visibleObjects(world)) {
		addObject(commands, object, time, detailTier);
	}
}

/** Reveal the deterministic ornament tier without coupling tests to command arrays. */
export function objectDetailTier(renderQuality = 1) {
	if (renderQuality < 0.84) return DETAIL_MINIMAL;
	if (renderQuality < 0.97) return DETAIL_RARE_SHADOWS;
	return DETAIL_FULL;
}

function addObject(commands, object, time, detailTier) {
	const sink = object.sink || 0;
	const shrink = Math.max(0.06, 1 - sink * 0.86);
	const rare = object.rare || object.mass > 95 || object.category === 'pickup';
	const pulse = 1 + (rare ? 0.045 * Math.sin(time * 3.2 + Number(object.id)) : 0);
	const baseHeight = object.grounded ? object.z : object.z + object.h * 0.5;
	const height = baseHeight - sink * object.h * 0.96;
	if (shouldDrawShadow(sink, rare, detailTier)) {
		shadow(commands, object.x, object.y, object.z, object.r * 0.92, rare ? 0.24 : 0.12);
	}
	const procedural = object.shape.startsWith('model:');
	pushCommand(
		commands,
		object.shape,
		object.x,
		height,
		object.y,
		object.mx * shrink * pulse,
		object.my * shrink,
		object.mz * shrink * pulse,
		object.rot + sink * 7,
		procedural ? 1 : object.color[0],
		procedural ? 1 : object.color[1],
		procedural ? 1 : object.color[2],
		1 - sink * 0.74,
		rare ? 0.34 : 0.08,
		sink * 1.42,
		object.material || 'none'
	);
	if (rare && sink < 0.28 && detailTier >= DETAIL_FULL) {
		addAura(commands, object, time);
	}
}

function shouldDrawShadow(sink, rare, detailTier) {
	if (sink >= 0.18 || detailTier === DETAIL_MINIMAL) return false;
	return detailTier >= DETAIL_FULL || rare;
}

function addAura(commands, object, time) {
	const radius = object.r * (1.12 + Math.sin(time * 4 + Number(object.id)) * 0.04);
	pushCommand(
		commands,
		'ring',
		object.x,
		object.z + 2,
		object.y,
		radius,
		1,
		radius,
		time,
		object.color[0],
		object.color[1],
		object.color[2],
		object.locked ? 0.42 : 0.22,
		0.58
	);
}
