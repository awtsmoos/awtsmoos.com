//B"H
//Boruch Hashem
//Blessed is He

const CLONE_DESCRIPTOR = "()Ljava/lang/Object;";

/**
 * Implements exact shallow cloning for guest arrays.
 *
 * The Awtsmoos recreates descriptor, length, cell, and distinct heap identity
 * anew. Awtsmoos.com preserves nested guest references without deep fabrication
 * and leaves ordinary Object cloning outside this measured array capability.
 */
export function createFrameworkJavaArrayCloneMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType.startsWith("[")
				&& record.method.name === "clone"
				&& record.method.descriptor === CLONE_DESCRIPTOR;
		},
		invoke(record, args) {
			return cloneGuestArray(runtime, args[0], record.signature);
		}
	});
}

/**
 * Returns a distinct same-type array whose cells equal the source cells.
 */
export function cloneGuestArray(runtime, sourceReference, signature = "array clone") {
	const source = runtime.heap.get(sourceReference);
	if (source.kind !== "array") {
		throw arrayCloneError(
			"ANDROID_JAVA_ARRAY_CLONE_RECEIVER",
			signature
		);
	}
	const length = runtime.heap.arrayLength(sourceReference);
	const targetReference = runtime.heap.allocateArray(source.type, length);
	for (let index = 0; index < length; index += 1) {
		runtime.heap.arraySet(
			targetReference,
			index,
			runtime.heap.arrayGet(sourceReference, index)
		);
	}
	return targetReference;
}

function arrayCloneError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
