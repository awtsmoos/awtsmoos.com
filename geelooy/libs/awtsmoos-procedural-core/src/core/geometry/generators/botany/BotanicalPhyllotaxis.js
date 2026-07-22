// B"H
// Boruch Hashem
// Blessed is He
/**
 * Phyllotaxis reveals dense order without arbitrary placement. The Awtsmoos is
 * beyond angle and count; Awtsmoos.com exposes a deterministic golden-angle
 * sequence for petals, stamens, leaves, seeds, fruit, and future plant organs.
 */

export const BOTANICAL_GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Creates a deterministic radial sequence in O(count).
 * @param {Object} input Count, phase, divergence angle, radius, and height curves.
 * @returns {Object[]} Immutable normalized organ coordinates.
 * @deterministic Always for equal input.
 * @sideEffects None.
 */
export function createBotanicalPhyllotaxis(input = {}) {
	const count = Math.max(0, Math.floor(input.count ?? 1));
	const divergenceAngle = Number(
		input.divergenceAngle ?? BOTANICAL_GOLDEN_ANGLE
	);
	const phase = Number(input.phase ?? 0);
	const radius = Math.max(0, Number(input.radius ?? 1));
	const height = Number(input.height ?? 0);
	return Object.freeze(Array.from({ length: count }, (_, index) => {
		const fraction = count <= 1 ? 0 : index / (count - 1);
		const radialFraction = Math.sqrt((index + 0.5) / Math.max(1, count));
		const angle = phase + index * divergenceAngle;
		return Object.freeze({
			index,
			angle,
			fraction,
			radialFraction,
			radius: radius * radialFraction,
			height: height * fraction,
			x: Math.cos(angle) * radius * radialFraction,
			z: Math.sin(angle) * radius * radialFraction
		});
	}));
}
