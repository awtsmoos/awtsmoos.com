// B"H
// Boruch Hashem
// Blessed is He
import { cmd } from '../renderList/command.js';

/**
 * The Awtsmoos surrounds the finite arena with receding vessels of stone. Mixed
 * angular and rounded masses create varied silhouettes while remaining collision-free.
 */
export function mountainCommands(commands, world, preset, budget) {
	const bounds = world.level.bounds;
	const seed = Number(world.level.seed) || 1;
	for (let index = 0; index < budget.mountains; index += 1) {
		const variation = seededUnit(seed, index);
		const layer = index % 3;
		const angle = index / budget.mountains * Math.PI * 2 + variation * 0.34;
		const radius = bounds * (1.03 + layer * 0.15 + variation * 0.08);
		const height = bounds * preset.ridgeHeight * (0.17 + variation * 0.12);
		const width = height * (0.72 + seededUnit(seed, index + 71) * 0.45);
		const depth = width * (0.66 + layer * 0.08);
		const mesh = index % 3 === 0 ? 'shard' : 'sphere';
		commands.push(cmd(
			mesh,
			[Math.cos(angle) * radius, -24 + height * 0.34, Math.sin(angle) * radius],
			[width, height, depth],
			-angle + variation * 0.55,
			layer === 2 ? preset.mountainFar : preset.mountainNear,
			0.96 - layer * 0.12,
			0.03
		));
	}
}

function seededUnit(seed, index) {
	let value = (seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
	value ^= value >>> 16;
	value = Math.imul(value, 0x7feb352d) >>> 0;
	value ^= value >>> 15;
	return (value >>> 0) / 4294967295;
}
