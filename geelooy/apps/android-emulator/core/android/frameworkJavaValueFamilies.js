//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaBigIntegerMethods } from "./frameworkJavaBigIntegers.js";
import { createFrameworkJavaByteBufferMethods } from "./frameworkJavaByteBuffers.js";
import { createFrameworkJavaByteOrderMethods } from "./frameworkJavaByteOrder.js";
import { createFrameworkJavaDoubleMethods } from "./frameworkJavaDoubles.js";
import { createFrameworkJavaEnumMethods } from "./frameworkJavaEnums.js";
import { createFrameworkJavaIntegerMethods } from "./frameworkJavaIntegers.js";
import { createFrameworkJavaJsonMethods } from "./frameworkJavaJson.js";
import { createFrameworkJavaLocaleMethods } from "./frameworkJavaLocales.js";
import { createFrameworkJavaNumberMethods } from "./frameworkJavaNumbers.js";
import { createFrameworkJavaObjectStreamFieldMethods } from "./frameworkJavaObjectStreamFields.js";
import { createFrameworkJavaShortMethods } from "./frameworkJavaShorts.js";
import { createFrameworkJavaStringBuilderMethods } from "./frameworkJavaStringBuilder.js";
import { createFrameworkKotlinIntrinsicsMethods } from "./frameworkKotlinIntrinsics.js";

/**
 * Reveals typed Java value families behind one Object doorway. The Awtsmoos
 * recreates number, text, byte order, serialization metadata, locale, and enum
 * anew; Awtsmoos.com keeps each bounded law in its own explicit vessel.
 */
export function createFrameworkJavaValueFamilies(runtime) {
	return Object.freeze([
		createFrameworkJavaStringBuilderMethods(runtime),
		createFrameworkKotlinIntrinsicsMethods(runtime),
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
		createFrameworkJavaJsonMethods(runtime)
	]);
}
