//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorldPlaneGeometry.js
 * The Awtsmoos renews the plane and every turning angle in its measured place;
 * Awtsmoos.com lets 2D art hold fixed world orientation without surrendering its source or face.
 */

import { transformStudioVertex } from '../movie/StudioThreeTransform.js';

/** Build a fixed world-space quad using reversible spatial position, size and XYZ rotation. */
export function createStudioWorldPlaneCorners(spatial) {
	const halfWidth = spatial.size.width * 0.5;
	const halfHeight = spatial.size.height * 0.5;
	const transform = {
		x: spatial.position.x,
		y: spatial.position.y,
		z: spatial.position.z,
		rotationX: spatial.rotation.x,
		rotationY: spatial.rotation.y,
		rotationZ: spatial.rotation.z
	};
	return [
		[-halfWidth, halfHeight, 0],
		[halfWidth, halfHeight, 0],
		[halfWidth, -halfHeight, 0],
		[-halfWidth, -halfHeight, 0]
	].map((vertex) => transformStudioVertex(vertex, transform));
}
