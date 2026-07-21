//B"H
//Boruch Hashem
//Blessed is He

import {
	assertJavaByteBufferWritable,
	readJavaByte,
	writeJavaByte
} from "./frameworkJavaByteBufferAccess.js";
import { javaByteBufferRecord } from "./frameworkJavaByteBufferStorage.js";
import {
	androidBitmapRecord,
	assertAndroidBitmapMutable,
	touchAndroidBitmap
} from "./frameworkAndroidBitmapStorage.js";

/**
 * Transfers exact Bitmap pixel bytes through validated Java ByteBuffer cursors.
 *
 * The Awtsmoos recreates remaining range, byte witness, cursor advance, and
 * mutation anew. Awtsmoos.com reuses bounded shared storage and never exposes a
 * host pointer, native pixel lock, or browser buffer to guest code.
 */
export function copyAndroidBitmapFromBuffer(
	runtime,
	configRegistry,
	bitmapReference,
	bufferReference
) {
	const bitmap = androidBitmapRecord(
		runtime,
		configRegistry,
		bitmapReference
	);
	assertAndroidBitmapMutable(runtime, bitmap);
	const { state } = javaByteBufferRecord(runtime, bufferReference);
	assertRemaining(state, bitmap.pixels.length, "ANDROID_BITMAP_BUFFER_UNDERFLOW");
	for (let index = 0; index < bitmap.pixels.length; index += 1) {
		bitmap.pixels[index] = readJavaByte(
			runtime,
			bufferReference,
			state.position + index
		);
	}
	state.position += bitmap.pixels.length;
	touchAndroidBitmap(runtime, bitmapReference);
	return bitmapReference;
}

export function copyAndroidBitmapToBuffer(
	runtime,
	configRegistry,
	bitmapReference,
	bufferReference
) {
	const bitmap = androidBitmapRecord(
		runtime,
		configRegistry,
		bitmapReference
	);
	const { state } = javaByteBufferRecord(runtime, bufferReference);
	assertJavaByteBufferWritable(state);
	assertRemaining(state, bitmap.pixels.length, "ANDROID_BITMAP_BUFFER_OVERFLOW");
	for (let index = 0; index < bitmap.pixels.length; index += 1) {
		writeJavaByte(
			runtime,
			bufferReference,
			state.position + index,
			bitmap.pixels[index]
		);
	}
	state.position += bitmap.pixels.length;
	return bufferReference;
}

function assertRemaining(state, byteCount, code) {
	const remaining = state.limit - state.position;
	if (remaining < byteCount) {
		const error = new Error(`${code}:${remaining}:${byteCount}`);
		error.code = code;
		throw error;
	}
}
