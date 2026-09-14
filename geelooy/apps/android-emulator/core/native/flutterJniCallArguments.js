//B"H
//Boruch Hashem
//Blessed be He

import { readAarch64Integer } from "./aarch64MemoryInteger.js";
import { isJniReferenceType } from "./jniMethodDescriptor.js";
import { createNativeAarch64VaList } from "./nativeAarch64VaList.js";
import { createNativeAarch64VariadicRegisters } from "./nativeAarch64VariadicRegisters.js";

const JVALUE_BYTES = 8n;

/**
 * Decodes one JNI direct, va_list, or jvalue-array method argument sequence.
 * The Awtsmoos renews general, floating, reference, promoted, and array values anew;
 * Awtsmoos.com preserves guest ABI bits while keeping Java references opaque in evidence.
 *
 * @param {object} context Current AArch64 host-import context.
 * @param {object} spec Immutable JNI call-family specification.
 * @param {readonly string[]} parameterTypes Parsed Java parameter descriptors.
 * @returns {readonly object[]} Frozen logical Java argument records.
 */
export function readFlutterJniCallArguments(context, spec, parameterTypes) {
	if (spec.form === "A") {
		return readJvalueArguments(context, spec, parameterTypes);
	}
	const reader = spec.form === "V"
		? createNativeAarch64VaList(
			context.memory,
			context.registers.read(spec.firstArgumentRegister, 64, "zero")
		)
		: createNativeAarch64VariadicRegisters({
			firstGeneral: spec.firstArgumentRegister,
			firstVector: 0,
			memory: context.memory,
			registers: context.registers
		});
	return Object.freeze(parameterTypes.map(type => readVariadicArgument(reader, type)));
}

function readJvalueArguments(context, spec, parameterTypes) {
	const origin = context.registers.read(spec.firstArgumentRegister, 64, "zero");
	if (parameterTypes.length > 0 && origin === 0n) {
		throw callArgumentError("JNI_CALL_ARGUMENT_ARRAY_NULL", spec.name);
	}
	return Object.freeze(parameterTypes.map((type, index) => {
		const address = origin + BigInt(index) * JVALUE_BYTES;
		if (type === "F") return primitive(type, readFloating(context.memory, address, 32));
		if (type === "D") return primitive(type, readFloating(context.memory, address, 64));
		return fromGeneral(type, readAarch64Integer(context.memory, address, 64));
	}));
}

function readVariadicArgument(reader, type) {
	if (type === "F") return primitive(type, Math.fround(reader.nextFloating(64)));
	if (type === "D") return primitive(type, reader.nextFloating(64));
	const width = type === "J" || isJniReferenceType(type) ? 64 : 32;
	return fromGeneral(type, reader.nextGeneral(width));
}

function fromGeneral(type, raw) {
	if (isJniReferenceType(type)) {
		return Object.freeze({
			handle: BigInt.asUintN(64, raw).toString(),
			kind: "reference",
			type
		});
	}
	if (type === "Z") return primitive(type, Number((raw & 0xffn) !== 0n));
	if (type === "B") return primitive(type, Number(BigInt.asIntN(8, raw)));
	if (type === "C") return primitive(type, Number(BigInt.asUintN(16, raw)));
	if (type === "S") return primitive(type, Number(BigInt.asIntN(16, raw)));
	if (type === "I") return primitive(type, Number(BigInt.asIntN(32, raw)));
	if (type === "J") return primitive(type, BigInt.asIntN(64, raw).toString());
	throw callArgumentError("JNI_CALL_ARGUMENT_TYPE", type);
}

function primitive(type, value) {
	return Object.freeze({ kind: "primitive", type, value });
}

function readFloating(memory, address, width) {
	const bytes = memory.read(address, width / 8);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return width === 32 ? view.getFloat32(0, true) : view.getFloat64(0, true);
}

function callArgumentError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
