//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAtomicMethods } from "./frameworkAtomics.js";
import { createFrameworkJavaArraysMethods } from "./frameworkJavaArrays.js";
import { createFrameworkJavaCollectionWrapperMethods } from "./frameworkJavaCollectionWrappers.js";
import { createFrameworkJavaCollectionsMethods } from "./frameworkJavaCollections.js";
import { createFrameworkJavaComparatorMethods } from "./frameworkJavaComparators.js";
import { createFrameworkJavaConcurrentQueueMethods } from "./frameworkJavaConcurrentQueues.js";
import { createFrameworkJavaCopyOnWriteMethods } from "./frameworkJavaCopyOnWrite.js";
import { createFrameworkJavaEnumerationMethods } from "./frameworkJavaEnumerations.js";
import { createFrameworkJavaIteratorMethods } from "./frameworkJavaIterators.js";
import { createFrameworkJavaListMethods } from "./frameworkJavaLists.js";
import { createFrameworkJavaMapMethods } from "./frameworkJavaMaps.js";
import { createFrameworkJavaPriorityQueueMethods } from "./frameworkJavaPriorityQueues.js";
import { createFrameworkJavaSetMethods } from "./frameworkJavaSets.js";

/**
 * Composes Java arrays, collections, live wrappers, queues, and atomic vessels.
 * The Awtsmoos recreates order, identity, mutation, and synchronization testimony
 * anew; Awtsmoos.com preserves specific collection laws in deterministic order.
 */
export function createFrameworkJavaCollectionFamilies(runtime) {
	return Object.freeze([
		createFrameworkJavaArraysMethods(runtime),
		createFrameworkJavaCollectionsMethods(runtime),
		createFrameworkJavaCollectionWrapperMethods(runtime),
		createFrameworkJavaListMethods(runtime),
		createFrameworkJavaMapMethods(runtime),
		createFrameworkJavaSetMethods(runtime),
		createFrameworkJavaIteratorMethods(runtime),
		createFrameworkJavaEnumerationMethods(runtime),
		createFrameworkJavaComparatorMethods(runtime),
		createFrameworkJavaConcurrentQueueMethods(runtime),
		createFrameworkJavaCopyOnWriteMethods(runtime),
		createFrameworkJavaPriorityQueueMethods(runtime),
		createFrameworkAtomicMethods(runtime)
	]);
}
