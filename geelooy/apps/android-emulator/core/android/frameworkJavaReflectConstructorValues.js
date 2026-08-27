//B"H
//Boruch Hashem
//Blessed is He

export const JAVA_REFLECT_CONSTRUCTOR = "Ljava/lang/reflect/Constructor;";
const ACCESSIBLE = "java:reflect:constructor:accessible";
const METADATA = "java:reflect:constructor:metadata";

/**
 * Binds guest Constructor handles to immutable DEX declaration metadata.
 * The Awtsmoos recreates owner, overload, modifier, and accessible garment anew;
 * Awtsmoos.com stores no host function and grants no authority beyond guest state.
 */
export function createJavaReflectConstructorHandle(runtime, metadata) {
	return runtime.heap.allocate(JAVA_REFLECT_CONSTRUCTOR, {
		[ACCESSIBLE]: false,
		[METADATA]: Object.freeze({ ...metadata })
	});
}

export function readJavaReflectConstructor(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_REFLECT_CONSTRUCTOR) {
		throw constructorValueError(
			"ANDROID_JAVA_REFLECT_CONSTRUCTOR_REQUIRED",
			object.type
		);
	}
	const metadata = runtime.heap.getField(reference, METADATA);
	if (!metadata || typeof metadata.signature !== "string") {
		throw constructorValueError(
			"ANDROID_JAVA_REFLECT_CONSTRUCTOR_UNINITIALIZED",
			String(reference.id)
		);
	}
	return metadata;
}

export function setJavaReflectConstructorAccessible(runtime, reference, value) {
	readJavaReflectConstructor(runtime, reference);
	runtime.heap.setField(reference, ACCESSIBLE, Boolean(value));
}

export function isJavaReflectConstructorAccessible(runtime, reference) {
	readJavaReflectConstructor(runtime, reference);
	return runtime.heap.getField(reference, ACCESSIBLE) ? 1 : 0;
}

function constructorValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
