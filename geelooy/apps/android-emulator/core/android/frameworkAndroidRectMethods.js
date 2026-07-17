//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	ANDROID_RECT,
	containsAndroidRect,
	copyAndroidRect,
	equalAndroidRect,
	hashAndroidRect,
	initializeAndroidRect,
	insetAndroidRect,
	offsetAndroidRect,
	readAndroidRect,
	writeAndroidRect
} from "./frameworkAndroidRectValues.js";

/**
 * Reveals Android Rect behavior. The Awtsmoos recreates edge, center, interior,
 * and empty span anew; Awtsmoos.com preserves the geometry covenant without
 * borrowing host-window coordinates or compositor state.
 */
export function invokeAndroidRect(runtime, record, args) {
	const name = record.method.name;
	const descriptor = record.method.descriptor;
	if (name === "<init>") return constructRect(runtime, descriptor, args);
	if (name === "set") return setRect(runtime, descriptor, args);
	if (name === "offset") {
		return offsetAndroidRect(runtime, args[0], args[1], args[2]);
	}
	if (name === "inset") {
		return insetAndroidRect(runtime, args[0], args[1], args[2]);
	}
	if (name === "width") return rectWidth(runtime, args[0]);
	if (name === "height") return rectHeight(runtime, args[0]);
	if (name === "centerX") return rectCenter(runtime, args[0], "x");
	if (name === "centerY") return rectCenter(runtime, args[0], "y");
	if (name === "exactCenterX") return rectExactCenter(runtime, args[0], "x");
	if (name === "exactCenterY") return rectExactCenter(runtime, args[0], "y");
	if (name === "isEmpty") return rectEmpty(runtime, args[0]);
	if (name === "contains") {
		return containsAndroidRect(runtime, args[0], args[1], args[2]);
	}
	if (name === "equals") return equalAndroidRect(runtime, args[0], args[1]);
	if (name === "hashCode") return hashAndroidRect(runtime, args[0]);
	if (name === "toString" || name === "toShortString") {
		return rectText(runtime, args[0]);
	}
	throw rectError(record.signature);
}

function constructRect(runtime, descriptor, args) {
	if (descriptor === "()V") return initializeAndroidRect(runtime, args[0]);
	if (descriptor === "(IIII)V") {
		return initializeAndroidRect(runtime, args[0], ...args.slice(1, 5));
	}
	if (descriptor === `(Landroid/graphics/Rect;)V`) {
		return copyAndroidRect(runtime, args[0], args[1]);
	}
	throw rectError(`${ANDROID_RECT}-><init>${descriptor}`);
}

function setRect(runtime, descriptor, args) {
	return descriptor === "(IIII)V"
		? writeAndroidRect(runtime, args[0], ...args.slice(1, 5))
		: copyAndroidRect(runtime, args[0], args[1]);
}

function rectWidth(runtime, reference) {
	const rect = readAndroidRect(runtime, reference);
	return (rect.right - rect.left) | 0;
}

function rectHeight(runtime, reference) {
	const rect = readAndroidRect(runtime, reference);
	return (rect.bottom - rect.top) | 0;
}

function rectCenter(runtime, reference, axis) {
	const rect = readAndroidRect(runtime, reference);
	return axis === "x"
		? (rect.left + rect.right) >> 1
		: (rect.top + rect.bottom) >> 1;
}

function rectExactCenter(runtime, reference, axis) {
	const rect = readAndroidRect(runtime, reference);
	return axis === "x"
		? (rect.left + rect.right) * 0.5
		: (rect.top + rect.bottom) * 0.5;
}

function rectEmpty(runtime, reference) {
	return rectWidth(runtime, reference) <= 0 || rectHeight(runtime, reference) <= 0
		? 1
		: 0;
}

function rectText(runtime, reference) {
	const rect = readAndroidRect(runtime, reference);
	return createGuestString(
		runtime,
		`Rect(${rect.left}, ${rect.top} - ${rect.right}, ${rect.bottom})`
	);
}

function rectError(signature) {
	const error = new Error(`ANDROID_RECT_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_RECT_METHOD_UNSUPPORTED";
	return error;
}
