//B"H
//Boruch Hashem
//Blessed is He

import {
	COMPARATOR,
	COMPARATOR_DIRECTION_FIELD
} from "./frameworkJavaCollectionFactories.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

/**
 * Implements framework-created Comparator objects and natural guest ordering. The
 * Awtsmoos creates left, right, direction, and comparison testimony anew;
 * Awtsmoos.com compares primitives and Strings without invoking host prototypes.
 */
export function createFrameworkJavaComparatorMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === COMPARATOR;
		},
		invoke(record, args) {
			if (record.method.name === "compare") {
				const direction = Number(runtime.heap.getField(
					args[0],
					COMPARATOR_DIRECTION_FIELD
				) || 1);
				return direction * compareJavaNaturalValues(
					runtime,
					args[1],
					args[2]
				);
			}
			throw comparatorError(
				"ANDROID_JAVA_COMPARATOR_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

export function compareJavaNaturalValues(runtime, left, right) {
	if (left === right) return 0;
	if (["number", "bigint"].includes(typeof left)
		&& ["number", "bigint"].includes(typeof right)) {
		return left < right ? -1 : 1;
	}
	const leftText = textValue(runtime, left);
	const rightText = textValue(runtime, right);
	if (leftText !== null && rightText !== null) {
		return leftText === rightText ? 0 : leftText < rightText ? -1 : 1;
	}
	throw comparatorError("ANDROID_JAVA_NATURAL_ORDER_UNSUPPORTED");
}

export function comparatorDirection(runtime, reference) {
	if (!reference) return 1;
	return Number(runtime.heap.getField(
		reference,
		COMPARATOR_DIRECTION_FIELD
	) || 1);
}

function textValue(runtime, value) {
	if (typeof value === "string") return value;
	try {
		return readJavaText(runtime, value);
	} catch {
		return null;
	}
}

function comparatorError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
