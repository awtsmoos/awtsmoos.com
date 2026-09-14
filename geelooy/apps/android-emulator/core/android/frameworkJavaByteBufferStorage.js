//B"H
//Boruch Hashem
//Blessed be He

export const JAVA_BYTE_BUFFER = "Ljava/nio/ByteBuffer;";
const STORAGE_FIELD = "java:nio:byte-buffer:storage";
const STATE_FIELD = "java:nio:byte-buffer:state";
const MAXIMUM_CAPACITY = 100000000;

/**
 * Allocates one bounded ByteBuffer over Java arrays, owned direct bytes, or native memory.
 *
 * Native-backed storage deliberately keeps the composite guest-memory vessel and base
 * address instead of copying bytes. Every Java view therefore observes writes performed
 * by Flutter C++ and every Java put remains immediately visible to guest native code.
 *
 * @param {object} runtime Android runtime containing the Dalvik heap.
 * @param {object} options Capacity, state, and optional backing storage.
 * @returns {object} Dalvik reference for the allocated java.nio.ByteBuffer.
 */
export function createJavaByteBuffer(runtime, options) {
	const capacity = boundedCapacity(options.capacity);
	const storage = options.storage
		|| createStorage(runtime, capacity, options.direct);
	const state = {
		capacity,
		direct: Boolean(options.direct),
		limit: options.limit ?? capacity,
		littleEndian: Boolean(options.littleEndian),
		mark: -1,
		offset: Number(options.offset || 0),
		position: Number(options.position || 0),
		readOnly: Boolean(options.readOnly)
	};
	validateJavaByteBufferView(runtime, storage, state);
	return runtime.heap.allocate(JAVA_BYTE_BUFFER, {
		[STATE_FIELD]: state,
		[STORAGE_FIELD]: storage
	});
}

/**
 * Returns validated mutable state and shared opaque storage for one buffer.
 * @param {object} runtime Android runtime containing the Dalvik heap.
 * @param {object} reference Dalvik ByteBuffer reference.
 * @returns {{state: object, storage: object}} Shared state and backing storage.
 */
export function javaByteBufferRecord(runtime, reference) {
	const object = runtime.heap.get(reference);
	const state = runtime.heap.getField(reference, STATE_FIELD);
	const storage = runtime.heap.getField(reference, STORAGE_FIELD);
	if (object.type !== JAVA_BYTE_BUFFER || !state || !storage) {
		throw byteBufferStorageError(
			"ANDROID_BYTE_BUFFER_UNINITIALIZED",
			object.type
		);
	}
	validateJavaByteBufferView(runtime, storage, state);
	return { state, storage };
}

function createStorage(runtime, capacity, direct) {
	if (direct) return { bytes: new Uint8Array(capacity) };
	return {
		arrayReference: runtime.heap.allocateArray("[B", capacity)
	};
}

function validateJavaByteBufferView(runtime, storage, state) {
	const length = byteBufferStorageLength(runtime, storage);
	const invalid = !Number.isInteger(length)
		|| state.offset < 0
		|| state.capacity < 0
		|| state.offset + state.capacity > length
		|| state.position < 0
		|| state.position > state.limit
		|| state.limit > state.capacity;
	if (invalid) {
		throw byteBufferStorageError(
			"ANDROID_BYTE_BUFFER_STATE_INVALID",
			JSON.stringify({ backingLength: length, ...state })
		);
	}
}

function byteBufferStorageLength(runtime, storage) {
	if (storage.arrayReference) {
		return runtime.heap.arrayLength(storage.arrayReference);
	}
	if (storage.nativeMemory) {
		return Number(storage.byteLength);
	}
	return storage.bytes?.length;
}

function boundedCapacity(value) {
	const capacity = Number(value);
	if (!Number.isInteger(capacity)
		|| capacity < 0
		|| capacity > MAXIMUM_CAPACITY) {
		throw byteBufferStorageError(
			"ANDROID_BYTE_BUFFER_CAPACITY",
			String(value)
		);
	}
	return capacity;
}

function byteBufferStorageError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
