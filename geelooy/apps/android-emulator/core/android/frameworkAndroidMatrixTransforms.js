//B"H //Boruch Hashem //Blessed is He

import {
	matrixIdentity,
	matrixNumber,
	multiplyAndroidMatrices,
	readAndroidFloatArray,
	readAndroidMatrix,
	writeAndroidFloatArray,
	writeAndroidMatrix
} from "./frameworkAndroidMatrixState.js";

/**
 * Executes constructors and transformations over guest-owned Matrix values. The
 * Awtsmoos composes left, right, pivot, and copy anew; Awtsmoos.com preserves
 * Android pre/post order without delegating to DOM, Canvas, Skia, or JNI.
 */
export function invokeAndroidMatrixTransform(runtime, record, args) {
	const [receiver, first, second, third] = args;
	switch (`${record.method.name}${record.method.descriptor}`) {
		case "<init>()V":
		case "reset()V":
			writeAndroidMatrix(runtime, receiver, matrixIdentity());
			return undefined;
		case "<init>(Landroid/graphics/Matrix;)V":
		case "set(Landroid/graphics/Matrix;)V":
			writeAndroidMatrix(runtime, receiver, readAndroidMatrix(runtime, first));
			return undefined;
		case "isIdentity()Z":
			return isIdentity(readAndroidMatrix(runtime, receiver)) ? 1 : 0;
		case "getValues([F)V":
			readAndroidFloatArray(runtime, first, 9);
			writeAndroidFloatArray(runtime, first, readAndroidMatrix(runtime, receiver));
			return undefined;
		case "setValues([F)V":
			writeAndroidMatrix(runtime, receiver, readAndroidFloatArray(runtime, first, 9).slice(0, 9));
			return undefined;
		case "setTranslate(FF)V":
			writeAndroidMatrix(runtime, receiver, translation(first, second));
			return undefined;
		case "postTranslate(FF)Z":
			return combine(runtime, receiver, translation(first, second), true);
		case "postScale(FF)Z":
			return combine(runtime, receiver, scale(first, second), true);
		case "preScale(FF)Z":
			return combine(runtime, receiver, scale(first, second), false);
		case "postRotate(FFF)Z":
			return combine(runtime, receiver, rotation(first, second, third), true);
		case "preConcat(Landroid/graphics/Matrix;)Z":
			return combine(runtime, receiver, readAndroidMatrix(runtime, first), false);
		default:
			return undefined;
	}
}

function combine(runtime, receiver, operand, post) {
	const current = readAndroidMatrix(runtime, receiver);
	writeAndroidMatrix(runtime, receiver, post
		? multiplyAndroidMatrices(operand, current)
		: multiplyAndroidMatrices(current, operand));
	return 1;
}

function translation(x, y) {
	return [1, 0, matrixNumber(x), 0, 1, matrixNumber(y), 0, 0, 1];
}

function scale(x, y) {
	return [matrixNumber(x), 0, 0, 0, matrixNumber(y), 0, 0, 0, 1];
}

function rotation(degrees, pivotX, pivotY) {
	const angle = matrixNumber(degrees) * Math.PI / 180;
	const x = matrixNumber(pivotX);
	const y = matrixNumber(pivotY);
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);
	return [
		cosine,
		-sine,
		x - cosine * x + sine * y,
		sine,
		cosine,
		y - sine * x - cosine * y,
		0,
		0,
		1
	];
}

function isIdentity(values) {
	return values.every((value, index) => value === matrixIdentity()[index]);
}
