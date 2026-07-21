//B"H
//Boruch Hashem
//Blessed is He

import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import {
	assertJavaListStructuralMutable,
	setJavaArraysListValue
} from "./frameworkJavaArraysAsListState.js";
import {
	findJavaListIndex,
	javaListInsertionIndex,
	javaListValues,
	validJavaListIndex
} from "./frameworkJavaListStorage.js";

/**
 * Governs ordered List mutation. The Awtsmoos recreates insertion, replacement,
 * removal, and fixed-size covenant anew; Awtsmoos.com lets array-backed lists
 * replace cells while refusing every structural change that Java forbids.
 */
export function addJavaListValue(runtime, record, args) {
	assertStructuralMutation(runtime, args[0]);
	const values = javaListValues(runtime, args[0]);
	if (record.method.descriptor.startsWith("(I")) {
		values.splice(javaListInsertionIndex(values, args[1]), 0, args[2] ?? 0);
		return undefined;
	}
	values.push(args[1] ?? 0);
	return 1;
}

export function setJavaListValue(runtime, args) {
	assertJavaCollectionMutable(runtime, args[0]);
	const arrayBacked = setJavaArraysListValue(
		runtime,
		args[0],
		args[1],
		args[2]
	);
	if (arrayBacked.supported) return arrayBacked.value;
	const values = javaListValues(runtime, args[0]);
	const index = validJavaListIndex(values, args[1]);
	const previous = values[index] ?? 0;
	values[index] = args[2] ?? 0;
	return previous;
}

export function removeJavaListValue(runtime, record, args) {
	assertStructuralMutation(runtime, args[0]);
	const values = javaListValues(runtime, args[0]);
	if (record.method.descriptor === "(I)Ljava/lang/Object;") {
		return values.splice(validJavaListIndex(values, args[1]), 1)[0] ?? 0;
	}
	const index = findJavaListIndex(runtime, args[0], args[1]);
	if (index < 0) return 0;
	values.splice(index, 1);
	return 1;
}

export function clearJavaListValues(runtime, reference) {
	assertStructuralMutation(runtime, reference);
	javaListValues(runtime, reference).length = 0;
}

export function assertJavaListBulkMutable(runtime, reference) {
	assertStructuralMutation(runtime, reference);
}

function assertStructuralMutation(runtime, reference) {
	assertJavaListStructuralMutable(runtime, reference);
	assertJavaCollectionMutable(runtime, reference);
}
