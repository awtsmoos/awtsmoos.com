//B"H
//Boruch Hashem
//Blessed is He

export const ANDROID_RECT = "Landroid/graphics/Rect;";
const LEFT = `${ANDROID_RECT}->left:I`;
const TOP = `${ANDROID_RECT}->top:I`;
const RIGHT = `${ANDROID_RECT}->right:I`;
const BOTTOM = `${ANDROID_RECT}->bottom:I`;

/**
 * Preserves Android Rect edges in canonical guest fields. The Awtsmoos
 * recreates boundary, interior, emptiness, and measured span anew; Awtsmoos.com
 * keeps every rectangle explicit and independent of host compositor geometry.
 */
export function initializeAndroidRect(
	runtime,
	reference,
	left = 0,
	top = 0,
	right = 0,
	bottom = 0
) {
	writeAndroidRect(runtime, reference, left, top, right, bottom);
}

export function copyAndroidRect(runtime, target, source) {
	const rect = readAndroidRect(runtime, source);
	writeAndroidRect(runtime, target, rect.left, rect.top, rect.right, rect.bottom);
}

export function readAndroidRect(runtime, reference) {
	runtime.heap.get(reference);
	return Object.freeze({
		bottom: Number(runtime.heap.getField(reference, BOTTOM) ?? 0) | 0,
		left: Number(runtime.heap.getField(reference, LEFT) ?? 0) | 0,
		right: Number(runtime.heap.getField(reference, RIGHT) ?? 0) | 0,
		top: Number(runtime.heap.getField(reference, TOP) ?? 0) | 0
	});
}

export function writeAndroidRect(
	runtime,
	reference,
	left,
	top,
	right,
	bottom
) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, LEFT, Number(left) | 0);
	runtime.heap.setField(reference, TOP, Number(top) | 0);
	runtime.heap.setField(reference, RIGHT, Number(right) | 0);
	runtime.heap.setField(reference, BOTTOM, Number(bottom) | 0);
}

export function offsetAndroidRect(runtime, reference, dx, dy) {
	const rect = readAndroidRect(runtime, reference);
	writeAndroidRect(
		runtime,
		reference,
		rect.left + dx,
		rect.top + dy,
		rect.right + dx,
		rect.bottom + dy
	);
}

export function insetAndroidRect(runtime, reference, dx, dy) {
	const rect = readAndroidRect(runtime, reference);
	writeAndroidRect(
		runtime,
		reference,
		rect.left + dx,
		rect.top + dy,
		rect.right - dx,
		rect.bottom - dy
	);
}

export function containsAndroidRect(runtime, reference, x, y) {
	const rect = readAndroidRect(runtime, reference);
	return rect.left < rect.right
		&& rect.top < rect.bottom
		&& Number(x) >= rect.left
		&& Number(x) < rect.right
		&& Number(y) >= rect.top
		&& Number(y) < rect.bottom
		? 1
		: 0;
}

export function equalAndroidRect(runtime, reference, other) {
	try {
		const left = readAndroidRect(runtime, reference);
		const right = readAndroidRect(runtime, other);
		return left.left === right.left
			&& left.top === right.top
			&& left.right === right.right
			&& left.bottom === right.bottom
			? 1
			: 0;
	} catch {
		return 0;
	}
}

export function hashAndroidRect(runtime, reference) {
	const rect = readAndroidRect(runtime, reference);
	let result = rect.left;
	result = (Math.imul(result, 31) + rect.top) | 0;
	result = (Math.imul(result, 31) + rect.right) | 0;
	return (Math.imul(result, 31) + rect.bottom) | 0;
}
