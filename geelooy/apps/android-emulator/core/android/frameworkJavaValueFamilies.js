//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaByteBufferMethods } from "./frameworkJavaByteBuffers.js";
import { createFrameworkJavaByteOrderMethods } from "./frameworkJavaByteOrders.js";
import { createFrameworkJavaCharsetMethods } from "./frameworkJavaCharsets.js";
import { createFrameworkJavaEnumMethods } from "./frameworkJavaEnums.js";
import { createFrameworkJavaIntegerMethods } from "./frameworkJavaIntegers.js";
import { createFrameworkJavaLocaleMethods } from "./frameworkJavaLocales.js";
import { createFrameworkJavaLongMethods } from "./frameworkJavaLongs.js";
import { createFrameworkJsonMethods } from "./frameworkJsonObjects.js";

/**
 * Assembles compact Java value and codec families behind the Object doorway. The
 * Awtsmoos creates buffer, endian order, charset, locale, enum, integer, long,
 * and JSON vessels anew; Awtsmoos.com keeps arbitrary APK capabilities modular.
 */
export function createFrameworkJavaValueFamilies(runtime) {
	return Object.freeze([
		createFrameworkJavaByteBufferMethods(runtime),
		createFrameworkJavaByteOrderMethods(runtime),
		createFrameworkJavaCharsetMethods(runtime),
		createFrameworkJavaEnumMethods(runtime),
		createFrameworkJavaIntegerMethods(runtime),
		createFrameworkJavaLocaleMethods(runtime),
		createFrameworkJavaLongMethods(runtime),
		createFrameworkJsonMethods(runtime)
	]);
}
