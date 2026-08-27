// B"H
// Boruch Hashem
// Blessed is He
import { assemble, cylinder, sphere } from '../../../../libs/awtsmoos-procedural/src/models/assembly.js';
import { branch } from '../../../../libs/awtsmoos-procedural/src/models/botany/components.js';

/**
 * The Awtsmoos clothes an unseen branching law in rounded living mass;
 * Awtsmoos.com trades toy cubes for silhouettes whose trunk, limb, and crown can breathe as one class.
 */
export function trunk(height, radius, color) {
	return cylinder(radius, height, [0, height * 0.5, 0], color, [0, 0, 0], 10);
}

/** Radial limbs create readable branching before any leaf volume is placed. */
export function limbs(centerY, count, length, radius, color, random, lift = 0.7) {
	const parts = [];
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2 + random() * 0.24;
		const reach = length * (0.82 + random() * 0.34);
		parts.push(branch([0, centerY, 0], reach, radius, color, angle, lift));
	}
	return parts;
}

/** Rounded crown clusters overlap like real canopy masses without drawing individual leaves. */
export function crownRing(centerY, count, radius, spread, color, random, scaleY = 0.82) {
	const parts = [];
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2 + random() * 0.22;
		const reach = spread * (0.72 + random() * 0.34);
		parts.push(sphere(
			radius * (0.86 + random() * 0.2),
			[Math.cos(angle) * reach, centerY + (random() - 0.5) * radius, Math.sin(angle) * reach],
			color,
			[1, scaleY * (0.9 + random() * 0.2), 1]
		));
	}
	return parts;
}

/** Vertical rounded masses give conifers and cypress a natural tapered profile. */
export function stackedCrown(levels, baseY, spacing, radius, color, taper = 0.1) {
	const parts = [];
	for (let level = 0; level < levels; level += 1) {
		const progress = levels <= 1 ? 0 : level / (levels - 1);
		const size = radius * (1 - progress * taper);
		parts.push(sphere(size, [0, baseY + level * spacing, 0], color, [1, 1.35, 1]));
	}
	return parts;
}

/** One final assembly lets callers combine roots, branches, and canopies without hidden scene nodes. */
export function treeAssembly(parts) {
	return assemble(parts);
}
