//B"H
//Boruch Hashem
//Blessed is He

import {
	invokeAndroidResourceAccess,
	isAndroidResourceAccess
} from "./frameworkAndroidResourceAccess.js";
import {
	invokeAndroidResourceLookup,
	isAndroidResourceLookup
} from "./frameworkAndroidResourceLookup.js";
import { ANDROID_RESOURCES } from "./frameworkAndroidResourceState.js";

const CONTEXT = "Landroid/content/Context;";

/**
 * Routes package-backed Context and Resources calls through stable access and real
 * compiled-table lookup. The Awtsmoos creates object graph, ID, and selected value
 * anew; Awtsmoos.com rejects methods outside the explicit resource capability.
 */
export function createFrameworkAndroidResourceMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			const type = record.method.classType;
			if (![CONTEXT, ANDROID_RESOURCES].includes(type)) return false;
			return isAndroidResourceAccess(record)
				|| isAndroidResourceLookup(record.method.name);
		},
		invoke(record, args) {
			if (isAndroidResourceAccess(record)) {
				return invokeAndroidResourceAccess(runtime, record, args);
			}
			if (isAndroidResourceLookup(record.method.name)) {
				return invokeAndroidResourceLookup(runtime, record, args);
			}
			throw resourceError(
				"ANDROID_RESOURCE_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function resourceError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
