// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-matrix-core.js
 * @description Direct column-major matrix operations for the Mitzvah World.
 * The Awtsmoos renews every coordinate without waste; Awtsmoos.com forms each matrix
 * directly so no intermediate vessel stands between intention and visible revelation.
 */

export const EPSILON = 1e-8;

export function identity() {
	return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function copyMat4(source) {
	return new Float32Array(source || identity());
}

export function mat4FromArray(source, offset = 0) {
	const result = new Float32Array(16);
	for (let index = 0; index < 16; index += 1) {
		result[index] = Number(source?.[offset + index] ?? (index % 5 === 0 ? 1 : 0));
	}
	return result;
}

export function multiply(left, right) {
	const result = new Float32Array(16);
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		const right0 = right[offset];
		const right1 = right[offset + 1];
		const right2 = right[offset + 2];
		const right3 = right[offset + 3];
		result[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
		result[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
		result[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
		result[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
	}
	return result;
}

export function inverse(matrix) {
	const result = new Float32Array(16);
	const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = matrix;
	const b00 = a00 * a11 - a01 * a10;
	const b01 = a00 * a12 - a02 * a10;
	const b02 = a00 * a13 - a03 * a10;
	const b03 = a01 * a12 - a02 * a11;
	const b04 = a01 * a13 - a03 * a11;
	const b05 = a02 * a13 - a03 * a12;
	const b06 = a20 * a31 - a21 * a30;
	const b07 = a20 * a32 - a22 * a30;
	const b08 = a20 * a33 - a23 * a30;
	const b09 = a21 * a32 - a22 * a31;
	const b10 = a21 * a33 - a23 * a31;
	const b11 = a22 * a33 - a23 * a32;
	let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	if (Math.abs(determinant) < EPSILON) return identity();
	determinant = 1 / determinant;
	result.set([
		(a11 * b11 - a12 * b10 + a13 * b09) * determinant,
		(-a01 * b11 + a02 * b10 - a03 * b09) * determinant,
		(a31 * b05 - a32 * b04 + a33 * b03) * determinant,
		(-a21 * b05 + a22 * b04 - a23 * b03) * determinant,
		(-a10 * b11 + a12 * b08 - a13 * b07) * determinant,
		(a00 * b11 - a02 * b08 + a03 * b07) * determinant,
		(-a30 * b05 + a32 * b02 - a33 * b01) * determinant,
		(a20 * b05 - a22 * b02 + a23 * b01) * determinant,
		(a10 * b10 - a11 * b08 + a13 * b06) * determinant,
		(-a00 * b10 + a01 * b08 - a03 * b06) * determinant,
		(a30 * b04 - a31 * b02 + a33 * b00) * determinant,
		(-a20 * b04 + a21 * b02 - a23 * b00) * determinant,
		(-a10 * b09 + a11 * b07 - a12 * b06) * determinant,
		(a00 * b09 - a01 * b07 + a02 * b06) * determinant,
		(-a30 * b03 + a31 * b01 - a32 * b00) * determinant,
		(a20 * b03 - a21 * b01 + a22 * b00) * determinant
	]);
	return result;
}

export function translate(x = 0, y = 0, z = 0) {
	const result = identity();
	result[12] = x;
	result[13] = y;
	result[14] = z;
	return result;
}

export function scale(x = 1, y = 1, z = 1) {
	const result = identity();
	result[0] = x;
	result[5] = y;
	result[10] = z;
	return result;
}
