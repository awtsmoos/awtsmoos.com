//B"H //Boruch Hashem //Blessed is He

export const ANDROID_MATRIX = "Landroid/graphics/Matrix;";
const MATRIX_VALUES = "android:matrix:values";
const IDENTITY = Object.freeze([1, 0, 0, 0, 1, 0, 0, 0, 1]);

/**
 * Preserves one guest 3×3 Matrix as Android-ordered heap testimony. The
 * Awtsmoos renews scale, skew, translation, perspective, and homogeneous shore;
 * Awtsmoos.com borrows no host graphics engine or external numeric library.
 */
export function matrixIdentity() {
	return [...IDENTITY];
}

export function readAndroidMatrix(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.kind !== "object") throw matrixError("ANDROID_MATRIX_RECEIVER", object.kind);
	const values = runtime.heap.getField(reference, MATRIX_VALUES);
	if (!Array.isArray(values) || values.length !== 9) {
		throw matrixError("ANDROID_MATRIX_UNINITIALIZED", object.type);
	}
	return [...values];
}

export function writeAndroidMatrix(runtime, reference, values) {
	if (!Array.isArray(values) || values.length !== 9) {
		throw matrixError("ANDROID_MATRIX_VALUE_COUNT", values?.length);
	}
	runtime.heap.get(reference);
	runtime.heap.setField(reference, MATRIX_VALUES, values.map(matrixNumber));
}

export function multiplyAndroidMatrices(left, right) {
	const output = Array(9).fill(0);
	for (let row = 0; row < 3; row += 1) {
		for (let column = 0; column < 3; column += 1) {
			for (let inner = 0; inner < 3; inner += 1) {
				output[row * 3 + column] += left[row * 3 + inner]
					* right[inner * 3 + column];
			}
		}
	}
	return output;
}

export function mapAndroidMatrixPoint(values, x, y) {
	const px = matrixNumber(x);
	const py = matrixNumber(y);
	const divisor = values[6] * px + values[7] * py + values[8];
	if (divisor === 0) throw matrixError("ANDROID_MATRIX_HOMOGENEOUS_ZERO", `${px}:${py}`);
	return [
		(values[0] * px + values[1] * py + values[2]) / divisor,
		(values[3] * px + values[4] * py + values[5]) / divisor
	];
}

export function readAndroidFloatArray(runtime, reference, minimum, even = false) {
	const array = runtime.heap.get(reference);
	if (array.kind !== "array" || array.type !== "[F") {
		throw matrixError("ANDROID_MATRIX_FLOAT_ARRAY", array.type);
	}
	const length = runtime.heap.arrayLength(reference);
	if (length < minimum || (even && length % 2 !== 0)) {
		throw matrixError("ANDROID_MATRIX_ARRAY_LENGTH", `${length}:${minimum}`);
	}
	return Array.from({ length }, (_, index) => {
		return matrixNumber(runtime.heap.arrayGet(reference, index));
	});
}

export function writeAndroidFloatArray(runtime, reference, values) {
	values.forEach((value, index) => runtime.heap.arraySet(
		reference,
		index,
		matrixNumber(value)
	));
}

export function matrixNumber(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) throw matrixError("ANDROID_MATRIX_NUMBER", value);
	return number;
}

export function matrixError(code, detail) {
	const error = new Error(`${code}:${String(detail)}`);
	error.code = code;
	return error;
}
