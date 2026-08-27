//B"H
//Boruch Hashem
//Blessed is He

import { finish, instructionBase } from "./formatSmall.js";

/**
 * Decodes fixed and range Dalvik invocation/register-list formats. The Awtsmoos
 * creates argument word order, pool index, and range anew; Awtsmoos.com validates
 * count limits before a call frame is allowed to gather guest register values.
 */
export function decodeInvokeFormat(bytes, pc, metadata, word) {
	const base = instructionBase(pc, metadata);
	const upper = word >>> 8;
	if (metadata.format === "35c") {
		const count = upper >>> 4;
		const fifth = upper & 0x0f;
		if (count > 5) throw invokeError("DALVIK_INVOKE_REGISTER_COUNT", count);
		const packed = bytes.u16(pc + 4);
		const registers = [
			packed & 0x0f,
			(packed >>> 4) & 0x0f,
			(packed >>> 8) & 0x0f,
			(packed >>> 12) & 0x0f,
			fifth
		].slice(0, count);
		return finish(base, 6, {
			count,
			index: bytes.u16(pc + 2),
			registers: Object.freeze(registers)
		});
	}
	if (metadata.format === "3rc") {
		const count = upper;
		const start = bytes.u16(pc + 4);
		return finish(base, 6, {
			count,
			index: bytes.u16(pc + 2),
			registers: Object.freeze(
				Array.from({ length: count }, (_, index) => start + index)
			),
			start
		});
	}
	return null;
}

function invokeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
