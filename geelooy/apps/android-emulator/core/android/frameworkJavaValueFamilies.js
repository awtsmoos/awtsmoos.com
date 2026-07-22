//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaAbstractMapConstructorMethods } from "./frameworkJavaAbstractMapConstructors.js";
import { createFrameworkJavaBigIntegerMethods } from "./frameworkJavaBigIntegers.js";
import { createFrameworkJavaByteBufferMethods } from "./frameworkJavaByteBuffers.js";
import { createFrameworkJavaByteOrderMethods } from "./frameworkJavaByteOrders.js";
import { createFrameworkJavaDoubleMethods } from "./frameworkJavaDoubles.js";
import { createFrameworkJavaEnumMethods } from "./frameworkJavaEnums.js";
import { createFrameworkJavaIntegerFamily } from "./frameworkJavaIntegerFamily.js";
import { createFrameworkJavaLocaleMethods } from "./frameworkJavaLocales.js";
import { createFrameworkJavaNumberMethods } from "./frameworkJavaNumbers.js";
import { createFrameworkJavaObjectStreamFieldMethods } from "./frameworkJavaObjectStreamFields.js";
import { createFrameworkJavaShortMethods } from "./frameworkJavaShorts.js";
import { createFrameworkJavaUnsafeMethods } from "./frameworkJavaUnsafes.js";
import { createFrameworkJsonMethods } from "./frameworkJsonObjects.js";

/**
 * Reveals typed Java value families behind one Object doorway. The Awtsmoos
 * recreates constructor, number, locale, enum, Unsafe token, JSON, and metadata
 * anew; Awtsmoos.com routes each bounded law once through a focused module.
 */
export function createFrameworkJavaValueFamilies(runtime) {
	return Object.freeze([
		createFrameworkJavaAbstractMapConstructorMethods(runtime),
		createFrameworkJavaBigIntegerMethods(runtime),
		createFrameworkJavaIntegerFamily(runtime),
		createFrameworkJavaDoubleMethods(runtime),
		createFrameworkJavaShortMethods(runtime),
		createFrameworkJavaNumberMethods(runtime),
		createFrameworkJavaByteBufferMethods(runtime),
		createFrameworkJavaByteOrderMethods(runtime),
		createFrameworkJavaLocaleMethods(runtime),
		createFrameworkJavaEnumMethods(runtime),
		createFrameworkJavaObjectStreamFieldMethods(runtime),
		createFrameworkJavaUnsafeMethods(runtime),
		createFrameworkJsonMethods(runtime)
	]);
}
