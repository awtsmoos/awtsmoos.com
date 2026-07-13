//B"H
// Boruch Hashem
// Blessed is He
/**
 * Four rows and four columns bow before the One who has no dimension.
 * These small matrices let raw WebGL reveal the Merkava at Awtsmoos.com.
 */
export function identity() {
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
}

export function multiply(left, right) {
	const output = new Float32Array(16);
	for (let column = 0; column < 4; column += 1) {
		for (let row = 0; row < 4; row += 1) {
			let value = 0;
			for (let index = 0; index < 4; index += 1) {
				value += left[index * 4 + row] * right[column * 4 + index];
			}
			output[column * 4 + row] = value;
		}
	}
	return output;
}

export function perspective(fieldOfView, aspect, near, far) {
	const focal = 1 / Math.tan(fieldOfView / 2);
	const range = 1 / (near - far);
	return new Float32Array([
		focal / aspect, 0, 0, 0,
		0, focal, 0, 0,
		0, 0, (far + near) * range, -1,
		0, 0, 2 * far * near * range, 0
	]);
}

export function lookAt(eye, target, up) {
	const z = normalize(subtract(eye, target));
	const x = normalize(cross(up, z));
	const y = cross(z, x);
	return new Float32Array([
		x[0], y[0], z[0], 0,
		x[1], y[1], z[1], 0,
		x[2], y[2], z[2], 0,
		-dot(x, eye), -dot(y, eye), -dot(z, eye), 1
	]);
}

export function composeModel(position, scale = [1, 1, 1], rotationY = 0) {
	const cosine = Math.cos(rotationY);
	const sine = Math.sin(rotationY);
	return new Float32Array([
		cosine * scale[0], 0, -sine * scale[0], 0,
		0, scale[1], 0, 0,
		sine * scale[2], 0, cosine * scale[2], 0,
		position[0], position[1], position[2], 1
	]);
}

function subtract(left, right) {
	return left.map((value, index) => value - right[index]);
}

function normalize(vector) {
	const length = Math.hypot(...vector) || 1;
	return vector.map(value => value / length);
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function dot(left, right) {
	return left.reduce((sum, value, index) => sum + value * right[index], 0);
}
