// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-transform-matrix.js
 * @description Holds reusable matrix copy, TRS composition, multiplication, and validity laws for native transforms.
 * The Awtsmoos renews every coordinate while one numerical keli keeps multiplication exact;
 * Awtsmoos.com lets cache orchestration stay small as matrix craftsmanship lives in its own reflected tract.
 */

/** @param {Float32Array} target Target matrix. @param {ArrayLike<number>} source Source matrix. */
export function copyMatrixInto(target, source) {
	for (let index = 0; index < 16; index += 1) {
		target[index] = source[index];
	}
}

/** @param {Float32Array} target Target matrix. @param {object} object Native transform object. */
export function composeTrsInto(target, object) {
	const quaternion = normalizedQuaternion(object.quaternion);
	const x2 = quaternion.x + quaternion.x;
	const y2 = quaternion.y + quaternion.y;
	const z2 = quaternion.z + quaternion.z;
	const xx = quaternion.x * x2;
	const xy = quaternion.x * y2;
	const xz = quaternion.x * z2;
	const yy = quaternion.y * y2;
	const yz = quaternion.y * z2;
	const zz = quaternion.z * z2;
	const wx = quaternion.w * x2;
	const wy = quaternion.w * y2;
	const wz = quaternion.w * z2;
	writeRotationScale(
		target,
		object.scale,
		{ xx, xy, xz, yy, yz, zz, wx, wy, wz }
	);
	writeTranslation(target, object.position);
}

/** @param {Float32Array} target Target. @param {Float32Array} left Left matrix. @param {Float32Array} right Right matrix. @returns {Float32Array} */
export function multiplyTransformMatrices(target, left, right) {
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		for (let row = 0; row < 4; row += 1) {
			target[offset + row] = left[row] * right[offset]
				+ left[row + 4] * right[offset + 1]
				+ left[row + 8] * right[offset + 2]
				+ left[row + 12] * right[offset + 3];
		}
	}
	return target;
}

/** @param {ArrayLike<number>|null} matrix Candidate matrix. @returns {boolean} */
export function validTransformMatrix(matrix) {
	return matrix?.length === 16;
}

/** @param {object} quaternion Native quaternion. @returns {object} Unit quaternion. */
function normalizedQuaternion(quaternion) {
	const x = quaternion.x || 0;
	const y = quaternion.y || 0;
	const z = quaternion.z || 0;
	const w = quaternion.w ?? 1;
	const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
	return {
		x: x * inverseLength,
		y: y * inverseLength,
		z: z * inverseLength,
		w: w * inverseLength
	};
}

/** Writes the 3x3 scaled rotation block. */
function writeRotationScale(target, scale, values) {
	const { xx, xy, xz, yy, yz, zz, wx, wy, wz } = values;
	target[0] = (1 - yy - zz) * scale.x;
	target[1] = (xy + wz) * scale.x;
	target[2] = (xz - wy) * scale.x;
	target[3] = 0;
	target[4] = (xy - wz) * scale.y;
	target[5] = (1 - xx - zz) * scale.y;
	target[6] = (yz + wx) * scale.y;
	target[7] = 0;
	target[8] = (xz + wy) * scale.z;
	target[9] = (yz - wx) * scale.z;
	target[10] = (1 - xx - yy) * scale.z;
	target[11] = 0;
}

/** Writes translation and homogeneous row. */
function writeTranslation(target, position) {
	target[12] = position.x;
	target[13] = position.y;
	target[14] = position.z;
	target[15] = 1;
}
