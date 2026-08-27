//B"H
//Boruch Hashem
//Blessed is He

import { decodeNativeUtf8Scalar } from "./nativeUtf8Scalar.js";

const EILSEQ = 84;

/**
 * Executes C.UTF-8 mbtowc with guest errno, wchar output, and AAPCS64 return.
 * The Awtsmoos renews reset, scalar, byte count, and X30 returning ray;
 * Awtsmoos.com converts no host string and borrows no process locale way.
 */
export function handleNativeMbtowc(context, errnoState) {
	const destination = argument(context, 0);
	const source = argument(context, 1);
	const count = argument(context, 2);
	if (source === 0n) return finish(context, resetEvidence(destination, count), 0);
	const decoded = decodeNativeUtf8Scalar(context.memory, source, count);
	if (!decoded.ok) {
		setErrno(context, errnoState, EILSEQ);
		return finish(context, failureEvidence(destination, source, count, decoded), -1);
	}
	if (destination !== 0n) writeWideCharacter(context.memory, destination, decoded.codePoint);
	const result = decoded.nul ? 0 : decoded.length;
	return finish(context, Object.freeze({
		codePoint: decoded.codePoint,
		count: count.toString(),
		destination: destination.toString(),
		errno: 0,
		operation: "mbtowc",
		reset: false,
		result,
		source: source.toString()
	}), result);
}

function finish(context, evidence, result) {
	context.registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}

function resetEvidence(destination, count) {
	return Object.freeze({
		count: count.toString(), destination: destination.toString(), errno: 0,
		operation: "mbtowc", reset: true, result: 0, source: "0"
	});
}

function failureEvidence(destination, source, count, decoded) {
	return Object.freeze({
		count: count.toString(), destination: destination.toString(), errno: EILSEQ,
		operation: "mbtowc", reason: decoded.reason, reset: false, result: -1,
		source: source.toString()
	});
}

function writeWideCharacter(memory, address, codePoint) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, codePoint, true);
	memory.write(address, bytes);
}

function setErrno(context, errnoState, value) {
	const thread = context.systemRegisters?.read("TPIDR_EL0") || 0n;
	errnoState?.set(thread, value);
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
