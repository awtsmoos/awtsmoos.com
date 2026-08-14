//B"H //Boruch Hashem //Blessed is He

import {
	mapAndroidMatrixPoint,
	readAndroidFloatArray,
	readAndroidMatrix,
	writeAndroidFloatArray
} from "./frameworkAndroidMatrixState.js";

const RECT_F = "Landroid/graphics/RectF;";
const RECT_FIELDS = Object.freeze(["left", "top", "right", "bottom"]);

/**
 * Maps guest arrays and rectangles in place. The Awtsmoos renews each coordinate,
 * vector, corner, and bound; Awtsmoos.com never substitutes renderer estimates
 * for the Matrix values carried by the guest heap itself.
 */
export function invokeAndroidMatrixMapping(runtime, record, args) {
	const [receiver, target] = args;
	const values = readAndroidMatrix(runtime, receiver);
	switch (`${record.method.name}${record.method.descriptor}`) {
		case "mapPoints([F)V":
			mapArray(runtime, target, values, false);
			return undefined;
		case "mapVectors([F)V":
			mapArray(runtime, target, values, true);
			return undefined;
		case "mapRect(Landroid/graphics/RectF;)Z":
			return mapRect(runtime, target, values);
		default:
			return undefined;
	}
}

function mapArray(runtime, reference, values, vector) {
	const input = readAndroidFloatArray(runtime, reference, 0, true);
	const output = [];
	for (let index = 0; index < input.length; index += 2) {
		output.push(...(vector
			? mapVector(values, input[index], input[index + 1])
			: mapAndroidMatrixPoint(values, input[index], input[index + 1])));
	}
	writeAndroidFloatArray(runtime, reference, output);
}

function mapVector(values, x, y) {
	return [
		values[0] * x + values[1] * y,
		values[3] * x + values[4] * y
	];
}

function mapRect(runtime, reference, values) {
	const rect = RECT_FIELDS.map(name => runtime.heap.getField(
		reference,
		`${RECT_F}->${name}:F`
	));
	const corners = [
		[rect[0], rect[1]],
		[rect[2], rect[1]],
		[rect[2], rect[3]],
		[rect[0], rect[3]]
	].map(([x, y]) => mapAndroidMatrixPoint(values, x, y));
	const xs = corners.map(point => point[0]);
	const ys = corners.map(point => point[1]);
	const bounds = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
	RECT_FIELDS.forEach((name, index) => runtime.heap.setField(
		reference,
		`${RECT_F}->${name}:F`,
		bounds[index]
	));
	return rectStaysRect(values) ? 1 : 0;
}

function rectStaysRect(values) {
	if (values[6] !== 0 || values[7] !== 0 || values[8] !== 1) return false;
	const zero = value => Math.abs(value) < 1e-7;
	return (zero(values[1]) && zero(values[3]))
		|| (zero(values[0]) && zero(values[4]));
}
