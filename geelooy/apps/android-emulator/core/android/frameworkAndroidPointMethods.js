//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	ANDROID_POINT,
	androidPointLength,
	copyAndroidPoint,
	equalAndroidPoint,
	hashAndroidPoint,
	initializeAndroidPoint,
	negateAndroidPoint,
	offsetAndroidPoint,
	readAndroidPoint,
	writeAndroidPoint
} from "./frameworkAndroidPointValues.js";

/**
 * Reveals Android Point behavior. The Awtsmoos recreates constructor, axis,
 * distance, equality, and visible text anew; Awtsmoos.com preserves the public
 * geometry covenant without smuggling host-screen assumptions into guest code.
 */
export function invokeAndroidPoint(runtime, record, args) {
	const name = record.method.name;
	const descriptor = record.method.descriptor;
	if (name === "<init>") return constructPoint(runtime, descriptor, args);
	if (name === "set") {
		if (descriptor === "(II)V") {
			return writeAndroidPoint(runtime, args[0], args[1], args[2]);
		}
		return copyAndroidPoint(runtime, args[0], args[1]);
	}
	if (name === "offset") {
		return offsetAndroidPoint(runtime, args[0], args[1], args[2]);
	}
	if (name === "negate") return negateAndroidPoint(runtime, args[0]);
	if (name === "equals") {
		if (descriptor === "(II)Z") {
			const point = readAndroidPoint(runtime, args[0]);
			return point.x === (Number(args[1]) | 0)
				&& point.y === (Number(args[2]) | 0) ? 1 : 0;
		}
		return equalAndroidPoint(runtime, args[0], args[1]);
	}
	if (name === "hashCode") return hashAndroidPoint(runtime, args[0]);
	if (name === "length") return androidPointLength(args[0], args[1]);
	if (name === "toString") return pointText(runtime, args[0]);
	throw pointError(record.signature);
}

function constructPoint(runtime, descriptor, args) {
	if (descriptor === "()V") return initializeAndroidPoint(runtime, args[0]);
	if (descriptor === "(II)V") {
		return initializeAndroidPoint(runtime, args[0], args[1], args[2]);
	}
	if (descriptor === `(Landroid/graphics/Point;)V`) {
		return copyAndroidPoint(runtime, args[0], args[1]);
	}
	throw pointError(`${ANDROID_POINT}-><init>${descriptor}`);
}

function pointText(runtime, reference) {
	const point = readAndroidPoint(runtime, reference);
	return createGuestString(runtime, `Point(${point.x}, ${point.y})`);
}

function pointError(signature) {
	const error = new Error(`ANDROID_POINT_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_POINT_METHOD_UNSUPPORTED";
	return error;
}
