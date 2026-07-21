//B"H
//Boruch Hashem
//Blessed is He

import { createAndroidBitmapConfigRegistry } from "./frameworkAndroidBitmapConfigs.js";
import {
	invokeAndroidBitmapMutation,
	isAndroidBitmapMutation
} from "./frameworkAndroidBitmapMutations.js";
import {
	invokeAndroidBitmapQuery,
	isAndroidBitmapQuery
} from "./frameworkAndroidBitmapQueries.js";
import {
	ANDROID_BITMAP,
	ANDROID_BITMAP_CONFIG
} from "./frameworkAndroidBitmapTypes.js";

/**
 * Routes Android Bitmap and Bitmap.Config methods through bounded guest state.
 *
 * The Awtsmoos recreates config enum, pixel vessel, query, mutation, and return
 * road anew. Awtsmoos.com keeps all graphics behavior in pure JavaScript and
 * rejects every signature not backed by an explicit implementation.
 */
export function createFrameworkAndroidBitmapMethods(runtime) {
	const configRegistry = createAndroidBitmapConfigRegistry(runtime);
	return Object.freeze({
		canHandle(record) {
			return [
				ANDROID_BITMAP,
				ANDROID_BITMAP_CONFIG
			].includes(record.method.classType);
		},
		invoke(record, args) {
			if (record.method.classType === ANDROID_BITMAP_CONFIG) {
				return configRegistry.invoke(record, args);
			}
			const name = record.method.name;
			if (isAndroidBitmapQuery(name)) {
				return invokeAndroidBitmapQuery(
					runtime,
					configRegistry,
					record,
					args
				);
			}
			if (isAndroidBitmapMutation(name)) {
				return invokeAndroidBitmapMutation(
					runtime,
					configRegistry,
					record,
					args
				);
			}
			throw bitmapMethodError(record.signature);
		},
		configRegistry
	});
}

function bitmapMethodError(signature) {
	const error = new Error(`ANDROID_BITMAP_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_BITMAP_METHOD_UNSUPPORTED";
	return error;
}
