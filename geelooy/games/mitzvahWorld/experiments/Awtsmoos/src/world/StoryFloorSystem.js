// B"H

/**
 * Describes the one stairwell opening shared by both the upper floor and the
 * stair run. No second calculation is permitted to invent a different hole.
 */
export function stairwellOpening(specification, level) {
	const interiorWidth = specification.width - specification.wallT * 2;
	const interiorDepth = specification.depth - specification.wallT * 2;
	const width = Math.min(4.2, Math.max(3.4, interiorWidth * 0.12));
	const depth = Math.min(5.2, Math.max(4.2, interiorDepth * 0.18));
	const centerX = -interiorWidth * 0.27 + (level - 1) * 2;
	const centerZ = -interiorDepth * 0.18;
	return {
		centerX,
		centerZ,
		width,
		depth,
		xMin: centerX - width / 2,
		xMax: centerX + width / 2,
		zMin: centerZ - depth / 2,
		zMax: centerZ + depth / 2
	};
}

/**
 * Fills the complete clear interior footprint with four slab bands around the
 * shared stairwell opening. The result reaches every inner wall while leaving
 * a real collision void for the ascending player.
 */
export function createStoryFloorPieces({ spec, material, level, box }) {
	const y = spec.floorY + level * spec.storyHeight;
	const width = spec.width - spec.wallT * 2;
	const depth = spec.depth - spec.wallT * 2;
	const opening = stairwellOpening(spec, level);
	const pieces = [];
	const leftWidth = opening.xMin + width / 2;
	const rightWidth = width / 2 - opening.xMax;
	const frontDepth = depth / 2 - opening.zMax;
	const backDepth = opening.zMin + depth / 2;
	if (leftWidth > 0.1) {
		pieces.push(box(
			`${spec.id}-story-${level + 1}-left`,
			material,
			spec,
			-width / 2 + leftWidth / 2,
			y,
			0,
			leftWidth,
			0.2,
			depth,
			true
		));
	}
	if (rightWidth > 0.1) {
		pieces.push(box(
			`${spec.id}-story-${level + 1}-right`,
			material,
			spec,
			opening.xMax + rightWidth / 2,
			y,
			0,
			rightWidth,
			0.2,
			depth,
			true
		));
	}
	if (frontDepth > 0.1) {
		pieces.push(box(
			`${spec.id}-story-${level + 1}-front`,
			material,
			spec,
			opening.centerX,
			y,
			opening.zMax + frontDepth / 2,
			opening.width,
			0.2,
			frontDepth,
			true
		));
	}
	if (backDepth > 0.1) {
		pieces.push(box(
			`${spec.id}-story-${level + 1}-back`,
			material,
			spec,
			opening.centerX,
			y,
			-depth / 2 + backDepth / 2,
			opening.width,
			0.2,
			backDepth,
			true
		));
	}
	return pieces;
}
