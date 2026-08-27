//B"H
//Boruch Hashem
//Blessed is He

export const ANDROID_POINT = "Landroid/graphics/Point;";
const POINT_X = `${ANDROID_POINT}->x:I`;
const POINT_Y = `${ANDROID_POINT}->y:I`;

/**
 * Preserves one Android Point inside canonical guest fields. The Awtsmoos
 * recreates axis, sign, distance, and coordinate vessel anew; Awtsmoos.com
 * keeps geometry deterministic without leaking any host display assumption.
 */
export function initializeAndroidPoint(runtime, reference, x = 0, y = 0) {
	writeAndroidPoint(runtime, reference, x, y);
}

export function copyAndroidPoint(runtime, target, source) {
	const point = readAndroidPoint(runtime, source);
	writeAndroidPoint(runtime, target, point.x, point.y);
}

export function readAndroidPoint(runtime, reference) {
	runtime.heap.get(reference);
	return Object.freeze({
		x: Number(runtime.heap.getField(reference, POINT_X) ?? 0) | 0,
		y: Number(runtime.heap.getField(reference, POINT_Y) ?? 0) | 0
	});
}

export function writeAndroidPoint(runtime, reference, x, y) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, POINT_X, Number(x) | 0);
	runtime.heap.setField(reference, POINT_Y, Number(y) | 0);
}

export function offsetAndroidPoint(runtime, reference, dx, dy) {
	const point = readAndroidPoint(runtime, reference);
	writeAndroidPoint(runtime, reference, point.x + dx, point.y + dy);
}

export function negateAndroidPoint(runtime, reference) {
	const point = readAndroidPoint(runtime, reference);
	writeAndroidPoint(runtime, reference, -point.x, -point.y);
}

export function equalAndroidPoint(runtime, reference, other) {
	try {
		const left = readAndroidPoint(runtime, reference);
		const right = readAndroidPoint(runtime, other);
		return left.x === right.x && left.y === right.y ? 1 : 0;
	} catch {
		return 0;
	}
}

export function hashAndroidPoint(runtime, reference) {
	const point = readAndroidPoint(runtime, reference);
	return (Math.imul(point.x, 31) + point.y) | 0;
}

export function androidPointLength(x, y) {
	return Math.hypot(Number(x), Number(y));
}
