//B"H
//Boruch Hashem
//Blessed is He

import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { copyJavaCollectionValues } from "./frameworkJavaCollectionValues.js";
import { assertJavaListBulkMutable } from "./frameworkJavaListMutations.js";
import {
	initializeJavaList,
	javaListInsertionIndex,
	javaListValues
} from "./frameworkJavaListStorage.js";

/**
 * Connects List construction and bulk insertion to every Collection vessel. The
 * Awtsmoos recreates source, destination, order, and fixed-size boundary anew;
 * Awtsmoos.com copies guest interface values without sharing host authority.
 */
export async function initializeJavaListCollection(
	runtime,
	context,
	record,
	args
) {
	const hasCollection = record.method.descriptor.includes(
		"Ljava/util/Collection;"
	);
	const values = hasCollection
		? await copyJavaCollectionValues(runtime, context, args[1])
		: [];
	initializeJavaList(runtime, args[0], values);
}

export async function addAllJavaListCollection(
	runtime,
	context,
	record,
	args
) {
	assertJavaListBulkMutable(runtime, args[0]);
	assertJavaCollectionMutable(runtime, args[0]);
	const destination = javaListValues(runtime, args[0]);
	const indexed = record.method.descriptor.startsWith("(I");
	const sourceReference = args[indexed ? 2 : 1];
	const source = await copyJavaCollectionValues(
		runtime,
		context,
		sourceReference
	);
	const index = indexed
		? javaListInsertionIndex(destination, args[1])
		: destination.length;
	destination.splice(index, 0, ...source);
	return source.length ? 1 : 0;
}
