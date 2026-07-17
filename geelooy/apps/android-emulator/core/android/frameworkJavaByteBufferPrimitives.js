//B"H
//Boruch Hashem
//Blessed is He

import { acquireJavaBufferIndex } from "./frameworkJavaBufferBounds.js";
import {
	assertJavaByteBufferWritable,
	readJavaByte,
	writeJavaByte
} from "./frameworkJavaByteBufferAccess.js";
import {
	JAVA_BUFFER_PRIMITIVES,
	javaByteBufferPrimitive,
	normalizeJavaBufferPrimitive
} from "./frameworkJavaByteBufferPrimitiveCodec.js";
import { javaBufferState } from "./frameworkJavaBufferState.js";

/**
 * Reads one endian-aware Java primitive through bounded guest bytes. The Awtsmoos
 * creates width, index, bit arrangement, and result anew; Awtsmoos.com keeps
 * DataView confined behind validated buffer access and cursor state.
 */
export function getJavaByteBufferPrimitive(runtime, record, args) {
	const primitive = javaByteBufferPrimitive(record.method.name);
	const [width, viewType] = JAVA_BUFFER_PRIMITIVES[primitive];
	const absolute = record.method.descriptor.startsWith("(I")
		? args[1]
		: null;
	const index = acquireJavaBufferIndex(
		runtime,
		args[0],
		width,
		absolute
	);
	const bytes = readPrimitiveBytes(runtime, args[0], index, width);
	return new DataView(bytes.buffer)[`get${viewType}`](
		0,
		javaBufferState(runtime, args[0]).littleEndian
	);
}

/**
 * Writes one endian-aware Java primitive and returns the same ByteBuffer.
 */
export function putJavaByteBufferPrimitive(runtime, record, args) {
	const primitive = javaByteBufferPrimitive(record.method.name);
	const [width, viewType] = JAVA_BUFFER_PRIMITIVES[primitive];
	const state = javaBufferState(runtime, args[0]);
	assertJavaByteBufferWritable(state);
	const absolute = record.method.descriptor.startsWith("(I")
		? args[1]
		: null;
	const value = absolute === null ? args[1] : args[2];
	const index = acquireJavaBufferIndex(
		runtime,
		args[0],
		width,
		absolute
	);
	const bytes = new Uint8Array(width);
	new DataView(bytes.buffer)[`set${viewType}`](
		0,
		normalizeJavaBufferPrimitive(primitive, value),
		state.littleEndian
	);
	for (let offset = 0; offset < width; offset += 1) {
		writeJavaByte(runtime, args[0], index + offset, bytes[offset]);
	}
	return args[0];
}

export {
	isJavaByteBufferPrimitiveMethod
} from "./frameworkJavaByteBufferPrimitiveCodec.js";

function readPrimitiveBytes(runtime, reference, index, width) {
	const bytes = new Uint8Array(width);
	for (let offset = 0; offset < width; offset += 1) {
		bytes[offset] = readJavaByte(runtime, reference, index + offset);
	}
	return bytes;
}
