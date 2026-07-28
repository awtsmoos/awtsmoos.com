//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaArrayCloneMethods } from "./frameworkJavaArrayClones.js";
import { createFrameworkJavaClassMethods } from "./frameworkJavaClasses.js";
import { createFrameworkJavaDesugarObjectMethods } from "./frameworkJavaDesugarObjects.js";
import { createFrameworkJavaExecutorMethods } from "./frameworkJavaExecutors.js";
import { createFrameworkJavaFileMethods } from "./frameworkJavaFiles.js";
import { createFrameworkJavaFutureMethods } from "./frameworkJavaFutures.js";
import { createFrameworkJavaLockMethods } from "./frameworkJavaLocks.js";
import { createFrameworkJavaLongMethods } from "./frameworkJavaLongs.js";
import { createFrameworkJavaObjectMethods } from "./frameworkJavaObjects.js";
import { createFrameworkJavaReferenceMethods } from "./frameworkJavaReferences.js";
import { createFrameworkJavaRegexMethods } from "./frameworkJavaRegex.js";
import { createFrameworkJavaStringMethods } from "./frameworkJavaStrings.js";
import { createFrameworkJavaSystemMethods } from "./frameworkJavaSystem.js";
import { createFrameworkJavaThreadLocalMethods } from "./frameworkJavaThreadLocals.js";
import { createFrameworkJavaThreadMethods } from "./frameworkJavaThreads.js";
import { createFrameworkJavaValueFamilies } from "./frameworkJavaValueFamilies.js";

/**
 * Composes Java class, text, runtime, ThreadLocal, concurrency, file, regex,
 * array, and value roads. The Awtsmoos recreates current thread, local presence,
 * shallow clone, and identity anew; Awtsmoos.com preserves measured families.
 */
export function createFrameworkJavaPlatformFamilies(runtime) {
	return Object.freeze([
		createFrameworkJavaClassMethods(runtime),
		createFrameworkJavaStringMethods(runtime),
		createFrameworkJavaSystemMethods(runtime),
		createFrameworkJavaThreadLocalMethods(runtime),
		createFrameworkJavaThreadMethods(runtime),
		createFrameworkJavaExecutorMethods(runtime),
		createFrameworkJavaFutureMethods(runtime),
		createFrameworkJavaLockMethods(runtime),
		createFrameworkJavaReferenceMethods(runtime),
		createFrameworkJavaFileMethods(runtime),
		createFrameworkJavaRegexMethods(runtime),
		createFrameworkJavaLongMethods(runtime),
		...createFrameworkJavaValueFamilies(runtime),
		createFrameworkJavaDesugarObjectMethods(runtime),
		createFrameworkJavaArrayCloneMethods(runtime),
		createFrameworkJavaObjectMethods(runtime)
	]);
}
