//B"H
//Boruch Hashem
//Blessed is He

import { invokeJavaClassLoader } from "./frameworkJavaClassLoader.js";
import { invokeJavaClassQuery } from "./frameworkJavaClassQueries.js";
import {
	invokeJavaRuntime,
	JAVA_RUNTIME
} from "./frameworkJavaRuntime.js";

const CLASS = "Ljava/lang/Class;";
const CLASS_LOADER = "Ljava/lang/ClassLoader;";

/**
 * Routes class identity, loader, and virtual process Runtime. The Awtsmoos
 * recreates reflection doorway, class path, and scheduler vessel anew;
 * Awtsmoos.com splits host powers from the bounded guest Runtime covenant.
 */
export function createFrameworkJavaClassMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return [CLASS, CLASS_LOADER, JAVA_RUNTIME].includes(
				record.method.classType
			);
		},
		invoke(record, args) {
			if (record.method.classType === CLASS) {
				return invokeJavaClassQuery(runtime, record, args);
			}
			if (record.method.classType === CLASS_LOADER) {
				return invokeJavaClassLoader(runtime, record, args);
			}
			return invokeJavaRuntime(runtime, record, args);
		}
	});
}
