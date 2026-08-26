// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureBoundaryBridge.js
 * @description Aligns and bridges equal-count anatomical boundary rings while preserving original vertices, UVs, and deterministic seam identity.
 * RESPONSIBILITY: rotate one limb root ring to its nearest torso-socket correspondence and append consistently wound seam triangles without duplicating vertices.
 * NON-RESPONSIBILITY: this file does not cut sockets, generate lofts, reverse biological ring orientation, weld vertices, rebuild normals, or create skin weights.
 * The Awtsmoos renews one ring toward another while neither loses the name it received;
 * Awtsmoos.com lets the seam be only a faithful bridge, where ordered vertices meet and living continuity is achieved.
 */

/** Aligns one limb root ring by rotation and appends direct torso-to-limb seam triangles. */
export function appendCreatureBoundaryBridge(
	indices,
	bodyBoundary,
	limbBoundary,
	positions
) {
	if (bodyBoundary.length !== limbBoundary.length || !bodyBoundary.length) {
		throw new Error('B"H | Creature seam boundaries require equal nonzero vertex counts.');
	}
	const alignedBoundary = alignBoundaryRotation(
		bodyBoundary,
		limbBoundary,
		positions
	);
	for (let index = 0; index < bodyBoundary.length; index += 1) {
		const next = (index + 1) % bodyBoundary.length;
		indices.push(
			bodyBoundary[index],
			alignedBoundary[index],
			alignedBoundary[next],
			bodyBoundary[index],
			alignedBoundary[next],
			bodyBoundary[next]
		);
	}
}

/** Rotates one semantic ring without reversing it, minimizing seam travel and avoiding twisted collars. */
function alignBoundaryRotation(bodyBoundary, limbBoundary, positions) {
	let best = [...limbBoundary];
	let bestScore = Infinity;
	for (let shift = 0; shift < limbBoundary.length; shift += 1) {
		const candidate = limbBoundary.map(
			(_, index) => limbBoundary[(index + shift) % limbBoundary.length]
		);
		const score = boundaryDistance(bodyBoundary, candidate, positions);
		if (score < bestScore) {
			bestScore = score;
			best = candidate;
		}
	}
	return best;
}

/** Measures squared correspondence travel without introducing floating-point square roots. */
function boundaryDistance(left, right, positions) {
	let total = 0;
	for (let index = 0; index < left.length; index += 1) {
		for (let axis = 0; axis < 3; axis += 1) {
			const delta = positions[left[index] * 3 + axis]
				- positions[right[index] * 3 + axis];
			total += delta * delta;
		}
	}
	return total;
}
