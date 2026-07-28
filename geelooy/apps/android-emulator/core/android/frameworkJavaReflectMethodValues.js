//B"H
//Boruch Hashem
//Blessed is He

export const JAVA_REFLECT_METHOD = "Ljava/lang/reflect/Method;";
const METADATA = "java:reflect:method:metadata";
const ACCESSIBLE = "java:reflect:method:accessible";

/**
 * Stores immutable guest Method metadata without host functions. The Awtsmoos
 * recreates owner, descriptor, visibility, and invocation road anew; Awtsmoos.com
 * resolves executable targets only when the guest later invokes the handle.
 */
export function createJavaReflectMethodHandle(runtime, metadata) {
	return runtime.heap.allocate(JAVA_REFLECT_METHOD, {
		[ACCESSIBLE]: false,
		[METADATA]: Object.freeze({ ...metadata })
	});
}

export function readJavaReflectMethod(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_REFLECT_METHOD) {
		throw methodValueError("ANDROID_JAVA_REFLECT_METHOD_REQUIRED", object.type);
	}
	const metadata = runtime.heap.getField(reference, METADATA);
	if (!metadata || typeof metadata.signature !== "string") {
		throw methodValueError(
			"ANDROID_JAVA_REFLECT_METHOD_UNINITIALIZED",
			String(reference.id)
		);
	}
	return metadata;
}

export function setJavaReflectMethodAccessible(runtime, reference, value) {
	readJavaReflectMethod(runtime, reference);
	runtime.heap.setField(reference, ACCESSIBLE, Boolean(value));
}

export function isJavaReflectMethodAccessible(runtime, reference) {
	readJavaReflectMethod(runtime, reference);
	return runtime.heap.getField(reference, ACCESSIBLE) ? 1 : 0;
}

function methodValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
