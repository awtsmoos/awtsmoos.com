// B"H
// Boruch Hashem
// Blessed is He
import { cmd } from '../renderList/command.js';

const GROUND_HEIGHT = -24;
const SHARD_HALF_HEIGHT = 0.945;
const SHARD_HALF_DEPTH = 0.45;
const PROFILES = Object.freeze([
	Object.freeze({ name: 'buttress', width: 1.52, height: 0.84, depth: 0.92, tilt: 0.055 }),
	Object.freeze({ name: 'needle', width: 0.78, height: 1.18, depth: 0.62, tilt: -0.085 }),
	Object.freeze({ name: 'ridge', width: 1.92, height: 0.68, depth: 1.08, tilt: 0.045 })
]);

/**
 * The Awtsmoos surrounds the arena with economical geological vessels. Verified
 * bluestone now reveals scale across every rooted shard without changing the draw budget.
 */
export function mountainCommands(commands, world, preset, budget) {
	const count = Math.max(0, Math.floor(Number(budget.mountains) || 0));
	for (let index = 0; index < count; index += 1) {
		const descriptor = mountainDescriptor(world.level, preset, index, count);
		commands.push(cmd(
			'shard',
			descriptor.position,
			descriptor.scale,
			descriptor.rotation,
			descriptor.color,
			descriptor.alpha,
			0.015,
			descriptor.tilt,
			'stone'
		));
	}
}

/** Create one deterministic rooted mountain without touching renderer state. */
export function mountainDescriptor(level, preset, index, count) {
	const seed = Number(level.seed) || 1;
	const variation = seededUnit(seed, index + 19);
	const layer = index % PROFILES.length;
	const profile = PROFILES[layer];
	const angle = index / Math.max(1, count) * Math.PI * 2 + variation * 0.32;
	const radius = level.bounds * (1.09 + layer * 0.17 + variation * 0.07);
	const baseHeight = level.bounds * preset.ridgeHeight * (0.16 + variation * 0.09);
	const scale = Object.freeze([
		baseHeight * profile.width,
		baseHeight * profile.height,
		baseHeight * profile.depth
	]);
	const tilt = profile.tilt * (0.72 + seededUnit(seed, index + 83) * 0.58);
	const verticalExtent = rootedVerticalExtent(scale, tilt);
	return Object.freeze({
		profile: profile.name,
		position: Object.freeze([
			Math.cos(angle) * radius,
			GROUND_HEIGHT + verticalExtent,
			Math.sin(angle) * radius
		]),
		scale,
		rotation: -angle + seededUnit(seed, index + 131) * 0.48,
		tilt,
		color: Object.freeze([...(layer === 2 ? preset.mountainFar : preset.mountainNear)]),
		alpha: 0.96 - layer * 0.1,
		verticalExtent
	});
}

function rootedVerticalExtent(scale, tilt) {
	return SHARD_HALF_HEIGHT * scale[1] * Math.abs(Math.cos(tilt))
		+ SHARD_HALF_DEPTH * scale[2] * Math.abs(Math.sin(tilt));
}

function seededUnit(seed, index) {
	let value = (seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
	value = (value ^ (value >>> 16)) >>> 0;
	value = Math.imul(value, 0x7feb352d) >>> 0;
	value = (value ^ (value >>> 15)) >>> 0;
	return value / 4294967296;
}
