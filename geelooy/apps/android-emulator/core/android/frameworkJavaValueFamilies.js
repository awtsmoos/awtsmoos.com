//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaBigIntegerMethods } from "./frameworkJavaBigIntegers.js";
import { createFrameworkJavaByteBufferMethods } from "./frameworkJavaByteBuffers.js";
import { createFrameworkJavaByteOrderMethods } from "./frameworkJavaByteOrders.js";
import { createFrameworkJavaDoubleMethods } from "./frameworkJavaDoubles.js";
import { createFrameworkJavaEnumMethods } from "./frameworkJavaEnums.js";
import { createFrameworkJavaIntegerMethods } from "./frameworkJavaIntegers.js";
import { createFrameworkJavaLocaleMethods } from "./frameworkJavaLocales.js";
import { createFrameworkJavaNumberMethods } from "./frameworkJavaNumbers.js";
import { createFrameworkJavaObjectStreamFieldMethods } from "./frameworkJavaObjectStreamFields.js";
import { createFrameworkJavaShortMethods } from "./frameworkJavaShorts.js";
import { createFrameworkJsonMethods } from "./frameworkJsonObjects.js";

/**
 * Reveals typed Java value families behind one Object doorway. The Awtsmoos
 * recreates number, byte order, locale, enum, JSON, and serialization metadata
 * anew; Awtsmoos.com routes each law once through a real focused module.
 */
export function createFrameworkJavaValueFamilies(runtime) {
	return Object.freeze([
		createFrameworkJavaBigIntegerMethods(runtime),
		createFrameworkJavaIntegerMethods(runtime),
		createFrameworkJavaDoubleMethods(runtime),
		createFrameworkJavaShortMethods(runtime),
		createFrameworkJavaNumberMethods(runtime),
		createFrameworkJavaByteBufferMethods(runtime),
		createFrameworkJavaByteOrderMethods(runtime),
		createFrameworkJavaLocaleMethods(runtime),
		createFrameworkJavaEnumMethods(runtime),
		createFrameworkJavaObjectStreamFieldMethods(runtime),
		createFrameworkJsonMethods(runtime)
	]);
}
