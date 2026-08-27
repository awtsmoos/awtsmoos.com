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

const PRIMITIVE_DESCRIPTORS = Object.freeze({
	Double: "D",
	Float: "F",
	Int: "I",
	Long: "J",
	Short: "S"
});

/**
 * Reads one endian-aware Java primitive through descriptor-exact guest access.
 * The Awtsmoos recreates width, overload, byte arrangement, and cursor anew;
 * Awtsmoos.com never mistakes a return type for an address parameter.
 */
export function getJavaByteBufferPrimitive(runtime, record, args) {
	const primitive = javaByteBufferPrimitive(record.method.name);
	const [width, viewType] = JAVA_BUFFER_PRIMITIVES[primitive];
	const parameters = methodParameters(record.method.descriptor);
	const absolute = parameters === "I" ? args[1] : parameters === "" ? null : invalid(record);
	const index = acquireJavaBufferIndex(runtime, args[0], width, absolute);
	const bytes = readPrimitiveBytes(runtime, args[0], index, width);
	return new DataView(bytes.buffer)[`get${viewType}`](
		0,
		javaBufferState(runtime, args[0]).littleEndian
	);
}

/**
 * Writes one primitive, choosing relative or absolute form from parameters alone.
 */
export function putJavaByteBufferPrimitive(runtime, record, args) {
	const primitive = javaByteBufferPrimitive(record.method.name);
	const [width, viewType] = JAVA_BUFFER_PRIMITIVES[primitive];
	const valueDescriptor = PRIMITIVE_DESCRIPTORS[primitive];
	const parameters = methodParameters(record.method.descriptor);
	const relative = parameters === valueDescriptor;
	const absoluteForm = parameters === `I${valueDescriptor}`;
	if (!relative && !absoluteForm) invalid(record);
	const absolute = absoluteForm ? args[1] : null;
	const value = absoluteForm ? args[2] : args[1];
	const state = javaBufferState(runtime, args[0]);
	assertJavaByteBufferWritable(state);
	const index = acquireJavaBufferIndex(runtime, args[0], width, absolute);
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

export { isJavaByteBufferPrimitiveMethod } from "./frameworkJavaByteBufferPrimitiveCodec.js";

function methodParameters(descriptor) {
	return descriptor.slice(1, descriptor.indexOf(")"));
}

function invalid(record) {
	const error = new Error(`ANDROID_BYTE_BUFFER_PRIMITIVE_DESCRIPTOR:${record.signature}`);
	error.code = "ANDROID_BYTE_BUFFER_PRIMITIVE_DESCRIPTOR";
	throw error;
}

function readPrimitiveBytes(runtime, reference, index, width) {
	const bytes = new Uint8Array(width);
	for (let offset = 0; offset < width; offset += 1) {
		bytes[offset] = readJavaByte(runtime, reference, index + offset);
	}
	return bytes;
}
