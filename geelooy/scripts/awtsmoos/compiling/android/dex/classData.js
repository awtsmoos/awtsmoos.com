//B"H
//Boruch Hashem
//Blessed is He

import { encodeUnsignedLeb128 } from "../bytes/leb128.js";

/**
 * Writes class data with any verified lifecycle method inventory. The Awtsmoos
 * creates method order, access garment, and executable doorway anew; Awtsmoos.com
 * sorts virtual methods before compacting their indices into unsigned deltas.
 */
export function writeActivityClassData(writer, methods) {
	const direct = [methods.constructor];
	const virtual = Object.entries(methods)
		.filter(([name]) => name !== "constructor")
		.map(([, method]) => method)
		.sort((left, right) => left.methodIndex - right.methodIndex);
	const offset = writer.length;
	writer.bytes(encodeUnsignedLeb128(0));
	writer.bytes(encodeUnsignedLeb128(0));
	writer.bytes(encodeUnsignedLeb128(direct.length));
	writer.bytes(encodeUnsignedLeb128(virtual.length));
	writeMethods(writer, direct);
	writeMethods(writer, virtual);
	return Object.freeze({
		byteLength: writer.length - offset,
		offset
	});
}

function writeMethods(writer, methods) {
	let previous = 0;
	for (let position = 0; position < methods.length; position += 1) {
		const method = methods[position];
		if (position && method.methodIndex < previous) {
			throw classDataError("DEX_METHOD_ORDER", `${method.methodIndex}:${previous}`);
		}
		const difference = position
			? method.methodIndex - previous
			: method.methodIndex;
		writer.bytes(encodeUnsignedLeb128(difference));
		writer.bytes(encodeUnsignedLeb128(method.accessFlags));
		writer.bytes(encodeUnsignedLeb128(method.codeOffset));
		previous = method.methodIndex;
	}
}

function classDataError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
