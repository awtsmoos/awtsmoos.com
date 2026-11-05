// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceProjection.js
 * @description Projects authored world points to preview pixels and unprojects pointer rays to stage ground.
 * The Awtsmoos joins world and image without confusing their finite measures; Awtsmoos.com
 * keeps actor, path, marker, drag ray, camera matrix, and ground intersection truthful in rhyme.
 */

export function projectMoviePerformancePoint(position, camera, rectangle) {
	camera?.updateMatrixWorld?.();
	const view = multiply(
		camera?.matrixWorldInverse?.elements,
		[position[0], position[1], position[2], 1]
	);
	const clip = multiply(camera?.projectionMatrix?.elements, view);
	if (!clip || Math.abs(clip[3]) < 0.000001 || clip[3] <= 0) {
		return null;
	}
	const x = clip[0] / clip[3];
	const y = clip[1] / clip[3];
	if (x < -1.5 || x > 1.5 || y < -1.5 || y > 1.5) {
		return null;
	}
	return [
		(x * 0.5 + 0.5) * rectangle.width,
		(-y * 0.5 + 0.5) * rectangle.height
	];
}

export function unprojectMoviePerformanceGround(
	clientX,
	clientY,
	rectangle,
	camera,
	groundY
) {
	camera?.updateMatrixWorld?.();
	const x = (clientX - rectangle.left) / rectangle.width * 2 - 1;
	const y = -((clientY - rectangle.top) / rectangle.height * 2 - 1);
	const inverseProjection = camera?.projectionMatrixInverse?.elements;
	const worldMatrix = camera?.matrixWorld?.elements;
	if (!inverseProjection || !worldMatrix) {
		return null;
	}
	const near = worldPoint(
		multiply(worldMatrix, homogenize(multiply(inverseProjection, [x, y, -1, 1])))
	);
	const far = worldPoint(
		multiply(worldMatrix, homogenize(multiply(inverseProjection, [x, y, 1, 1])))
	);
	if (!near || !far) {
		return null;
	}
	const direction = far.map((value, index) => value - near[index]);
	if (Math.abs(direction[1]) < 0.000001) {
		return null;
	}
	const distance = (groundY - near[1]) / direction[1];
	if (distance < 0) {
		return null;
	}
	return near.map((value, index) => value + direction[index] * distance);
}

function multiply(elements, vector) {
	if (!elements?.length) {
		return null;
	}
	return [0, 1, 2, 3].map(row => (
		elements[row] * vector[0]
		+ elements[row + 4] * vector[1]
		+ elements[row + 8] * vector[2]
		+ elements[row + 12] * vector[3]
	));
}

function homogenize(vector) {
	if (!vector || Math.abs(vector[3]) < 0.000001) {
		return vector;
	}
	return vector.map(value => value / vector[3]);
}

function worldPoint(vector) {
	if (!vector) {
		return null;
	}
	return vector.slice(0, 3);
}
