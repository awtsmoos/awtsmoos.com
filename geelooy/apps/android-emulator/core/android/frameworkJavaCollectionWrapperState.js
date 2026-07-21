//B"H
//Boruch Hashem
//Blessed is He

export const WRAPPER_TARGET_FIELD = "java:collection-wrapper:target";
export const WRAPPER_IMMUTABLE_FIELD = "java:collection-wrapper:immutable";
const MAXIMUM_WRAPPER_DEPTH = 32;

/**
 * Reveals a bounded chain of live Java collection wrapper references.
 *
 * The Awtsmoos recreates wrapper, target, depth, and identity anew while
 * Awtsmoos.com follows only explicit guest-heap fields, never host prototypes.
 *
 * @param {object} runtime Mutable Android runtime state.
 * @param {object} reference Guest collection or wrapper reference.
 * @returns {ReadonlyArray<object>} Wrapper chain ending at the concrete target.
 */
export function javaCollectionReferenceChain(runtime, reference) {
	const chain = [];
	const seen = new Set();
	let current = reference;
	for (let depth = 0; depth <= MAXIMUM_WRAPPER_DEPTH; depth += 1) {
		const object = runtime.heap.get(current);
		if (seen.has(current.id)) {
			throw wrapperStateError(
				"ANDROID_JAVA_COLLECTION_WRAPPER_CYCLE",
				object.type
			);
		}
		seen.add(current.id);
		chain.push(current);
		const target = runtime.heap.getField(current, WRAPPER_TARGET_FIELD);
		if (!target?.id) return Object.freeze(chain);
		current = target;
	}
	throw wrapperStateError(
		"ANDROID_JAVA_COLLECTION_WRAPPER_DEPTH",
		MAXIMUM_WRAPPER_DEPTH
	);
}

export function resolveJavaCollectionReference(runtime, reference) {
	return javaCollectionReferenceChain(runtime, reference).at(-1);
}

export function isJavaCollectionWrapperImmutable(runtime, reference) {
	return javaCollectionReferenceChain(runtime, reference).some(candidate => {
		return runtime.heap.getField(candidate, WRAPPER_IMMUTABLE_FIELD) === true;
	});
}

function wrapperStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
