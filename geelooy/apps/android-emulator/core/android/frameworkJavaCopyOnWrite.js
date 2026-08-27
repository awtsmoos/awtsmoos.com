//B"H
//Boruch Hashem
//Blessed is He

import {
	addCollectionValue,
	collectionValues,
	removeCollectionValue
} from "./frameworkJavaCollectionStorage.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import {
	initializeJavaList,
	javaListValues
} from "./frameworkJavaListStorage.js";
import { initializeJavaSet } from "./frameworkJavaSetStorage.js";

const COPY_LIST = "Ljava/util/concurrent/CopyOnWriteArrayList;";
const COPY_SET = "Ljava/util/concurrent/CopyOnWriteArraySet;";

/**
 * Implements measured copy-on-write collections through bounded guest snapshots.
 * The Awtsmoos creates mutation, unique listener, and stable iterator anew;
 * Awtsmoos.com copies iterator values at creation and opens no host concurrency.
 */
export function createFrameworkJavaCopyOnWriteMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return [COPY_LIST, COPY_SET].includes(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, record, args);
			if (name === "add") {
				return addCollectionValue(runtime, args[0], args[1]) ? 1 : 0;
			}
			if (name === "remove") {
				return removeCollectionValue(runtime, args[0], args[1]) ? 1 : 0;
			}
			if (name === "iterator") return createJavaIterator(runtime, args[0]);
			if (name === "isEmpty") {
				return collectionValues(runtime, args[0]).length ? 0 : 1;
			}
			if (name === "addAll") return addAll(runtime, args[0], args[1]);
			if (name === "removeAll") return removeAll(runtime, args[0], args[1]);
			throw copyOnWriteError(
				"ANDROID_COPY_ON_WRITE_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function initialize(runtime, record, args) {
	if (record.method.classType === COPY_SET) {
		initializeJavaSet(runtime, args[0]);
		return;
	}
	initializeJavaList(runtime, args[0]);
}

function addAll(runtime, target, source) {
	let changed = false;
	for (const value of collectionValues(runtime, source)) {
		changed = addCollectionValue(runtime, target, value) || changed;
	}
	return changed ? 1 : 0;
}

function removeAll(runtime, target, source) {
	let changed = false;
	for (const value of collectionValues(runtime, source)) {
		changed = removeCollectionValue(runtime, target, value) || changed;
	}
	return changed ? 1 : 0;
}

function copyOnWriteError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
