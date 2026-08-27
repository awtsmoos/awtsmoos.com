// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

export function identityMatrix() {
	return [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
}

export function multiplyMatrices(a, b) {
	const result = new Array(16).fill(0);
	for (let row = 0; row < 4; row += 1) {
		for (let column = 0; column < 4; column += 1) {
			for (let inner = 0; inner < 4; inner += 1) {
				result[row * 4 + column] += (
					a[row * 4 + inner] * b[inner * 4 + column]
				);
			}
		}
	}
	return result;
}

export function composeMatrix(transform = {}) {
	const position = transform.position || transform.translation || [0, 0, 0];
	const scale = transform.scale || [1, 1, 1];
	const rotation = transform.rotation_euler
		|| transform.rotationEuler
		|| [0, 0, 0];
	const [x, y, z] = rotation.map((value) => value * Math.PI / 180);
	const cx = Math.cos(x);
	const sx = Math.sin(x);
	const cy = Math.cos(y);
	const sy = Math.sin(y);
	const cz = Math.cos(z);
	const sz = Math.sin(z);
	const rotationMatrix = [
		cy * cz, -cy * sz, sy, 0,
		sx * sy * cz + cx * sz, -sx * sy * sz + cx * cz, -sx * cy, 0,
		-cx * sy * cz + sx * sz, cx * sy * sz + sx * cz, cx * cy, 0,
		0, 0, 0, 1
	];
	const scaleMatrix = [
		scale[0], 0, 0, 0,
		0, scale[1], 0, 0,
		0, 0, scale[2], 0,
		0, 0, 0, 1
	];
	const translationMatrix = identityMatrix();
	translationMatrix[3] = position[0];
	translationMatrix[7] = position[1];
	translationMatrix[11] = position[2];
	return multiplyMatrices(
		translationMatrix,
		multiplyMatrices(rotationMatrix, scaleMatrix)
	);
}

export function transformPoint(matrix, point, direction = false) {
	const w = direction ? 0 : 1;
	return [0, 1, 2].map((row) => (
		matrix[row * 4] * point[0]
		+ matrix[row * 4 + 1] * point[1]
		+ matrix[row * 4 + 2] * point[2]
		+ matrix[row * 4 + 3] * w
	));
}

export function determinant3(matrix) {
	return (
		matrix[0] * (matrix[5] * matrix[10] - matrix[6] * matrix[9])
		- matrix[1] * (matrix[4] * matrix[10] - matrix[6] * matrix[8])
		+ matrix[2] * (matrix[4] * matrix[9] - matrix[5] * matrix[8])
	);
}

export function transformNormal(matrix, normal) {
	const determinant = determinant3(matrix);
	if (Math.abs(determinant) < 1e-12) {
		return normalize(normal);
	}
	const inverseTranspose = [
		(matrix[5] * matrix[10] - matrix[6] * matrix[9]) / determinant,
		(matrix[6] * matrix[8] - matrix[4] * matrix[10]) / determinant,
		(matrix[4] * matrix[9] - matrix[5] * matrix[8]) / determinant,
		(matrix[2] * matrix[9] - matrix[1] * matrix[10]) / determinant,
		(matrix[0] * matrix[10] - matrix[2] * matrix[8]) / determinant,
		(matrix[1] * matrix[8] - matrix[0] * matrix[9]) / determinant,
		(matrix[1] * matrix[6] - matrix[2] * matrix[5]) / determinant,
		(matrix[2] * matrix[4] - matrix[0] * matrix[6]) / determinant,
		(matrix[0] * matrix[5] - matrix[1] * matrix[4]) / determinant
	];
	return normalize([
		inverseTranspose[0] * normal[0] + inverseTranspose[1] * normal[1]
			+ inverseTranspose[2] * normal[2],
		inverseTranspose[3] * normal[0] + inverseTranspose[4] * normal[1]
			+ inverseTranspose[5] * normal[2],
		inverseTranspose[6] * normal[0] + inverseTranspose[7] * normal[1]
			+ inverseTranspose[8] * normal[2]
	]);
}

function normalize(vector) {
	const length = Math.hypot(...vector) || 1;
	return vector.map((value) => value / length);
}
