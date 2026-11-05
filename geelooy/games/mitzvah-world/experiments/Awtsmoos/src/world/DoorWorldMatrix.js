// B"H
/**
 * A doorway matrix is a covenant between sight and collision: one basis, one
 * center, one measured truth. No hidden yaw may contradict what the wall says.
 */
export function worldMatrixFromYaw(center, yaw) {
	const cosine = Math.cos(yaw);
	const sine = Math.sin(yaw);
	return [
		cosine, 0, sine, 0,
		0, 1, 0, 0,
		-sine, 0, cosine, 0,
		center.x, center.y, center.z, 1
	];
}

export function matrixBasis(matrix) {
	return {
		tangent: normalize({ x: matrix[0], y: matrix[1], z: matrix[2] }),
		up: normalize({ x: matrix[4], y: matrix[5], z: matrix[6] }),
		normal: normalize({ x: matrix[8], y: matrix[9], z: matrix[10] }),
		center: { x: matrix[12], y: matrix[13], z: matrix[14] }
	};
}

export function matrixMaximumDelta(left, right) {
	let maximum = 0;
	for (let index = 0; index < 16; index += 1) {
		maximum = Math.max(maximum, Math.abs((left?.[index] || 0) - (right?.[index] || 0)));
	}
	return maximum;
}

export function vectorAngle(left, right) {
	const a = normalize(left);
	const b = normalize(right);
	const value = Math.max(-1, Math.min(1, dot(a, b)));
	return Math.acos(value);
}

export function dot(left, right) {
	return left.x * right.x + left.y * right.y + left.z * right.z;
}

function normalize(vector) {
	const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
	return {
		x: vector.x / length,
		y: vector.y / length,
		z: vector.z / length
	};
}
