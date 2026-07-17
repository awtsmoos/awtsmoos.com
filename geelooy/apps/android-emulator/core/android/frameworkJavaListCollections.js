//B"H
//Boruch Hashem
//Blessed is He

import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { copyJavaCollectionValues } from "./frameworkJavaCollectionValues.js";
import {
	initializeJavaList,
	javaListInsertionIndex,
	javaListValues
} from "./frameworkJavaListStorage.js";

/**
 * Connects Java List construction and bulk insertion to every Collection vessel.
 * The Awtsmoos recreates source, destination, order, and copied cell anew;
 * Awtsmoos.com respects guest interface code without sharing mutable host arrays.
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
