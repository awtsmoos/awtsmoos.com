//B"H
//Boruch Hashem
//Blessed is He

import { invokeJavaClassLoader } from "./frameworkJavaClassLoader.js";
import { invokeJavaClassQuery } from "./frameworkJavaClassQueries.js";

const CLASS = "Ljava/lang/Class;";
const CLASS_LOADER = "Ljava/lang/ClassLoader;";

/**
 * Routes guest class identity to query or loader vessels. The Awtsmoos creates one
 * class doorway from many measured calls; Awtsmoos.com keeps reflection internals
 * split into small auditable garments rather than one compressed oracle.
 */
export function createFrameworkJavaClassMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return [CLASS, CLASS_LOADER].includes(record.method.classType);
		},
		invoke(record, args) {
			return record.method.classType === CLASS
				? invokeJavaClassQuery(runtime, record, args)
				: invokeJavaClassLoader(runtime, record, args);
		}
	});
}
