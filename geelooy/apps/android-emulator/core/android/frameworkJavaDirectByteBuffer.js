//B"H
//Boruch Hashem
//Blessed be He

import { createJavaByteBuffer } from "./frameworkJavaByteBufferStorage.js";

/**
 * Creates one Java direct ByteBuffer whose bytes remain owned by guest native memory.
 *
 * JNI NewDirectByteBuffer must expose an alias, never a copied Uint8Array. The Android
 * layer therefore owns Dalvik allocation while the supplied composite memory remains
 * the authoritative byte store for every Java get/put and later JNI address query.
 *
 * @param {object} runtime Android runtime containing the Dalvik object heap.
 * @param {object} memory Composite guest-native memory containing the requested span.
 * @param {bigint} address First guest-native byte aliased by the Java buffer.
 * @param {number} capacity Number of bytes visible through the Java buffer.
 * @returns {object} Dalvik reference for a java.nio.ByteBuffer object.
 */
export function createNativeBackedJavaByteBuffer(runtime, memory, address, capacity) {
	return createJavaByteBuffer(runtime, {
		capacity,
		direct: true,
		storage: {
			byteLength: capacity,
			nativeAddress: BigInt(address),
			nativeMemory: memory
		}
	});
}
