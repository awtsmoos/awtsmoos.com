//B"H
//Boruch Hashem
//Blessed is He

import { finish, instructionBase } from "./formatSmall.js";

/**
 * Decodes multi-unit Dalvik register, literal, branch, and indexed formats. The
 * Awtsmoos creates wide register, signed road, pool index, and literal anew;
 * Awtsmoos.com returns null for invocation formats reserved for a separate vessel.
 */
export function decodeWideFormat(bytes, pc, metadata, word) {
	const upper = word >>> 8;
	const lowNibble = upper & 0x0f;
	const highNibble = upper >>> 4;
	const base = instructionBase(pc, metadata);
	if (metadata.format === "22x") {
		return finish(base, 4, { a: upper, b: bytes.u16(pc + 2) });
	}
	if (metadata.format === "22t") {
		return finish(base, 4, {
			a: lowNibble,
			b: highNibble,
			target: pc + bytes.i16(pc + 2) * 2
		});
	}
	if (metadata.format === "22c") {
		return finish(base, 4, {
			a: lowNibble,
			b: highNibble,
			index: bytes.u16(pc + 2)
		});
	}
	if (metadata.format === "22s") {
		return finish(base, 4, {
			a: lowNibble,
			b: highNibble,
			literal: bytes.i16(pc + 2)
		});
	}
	if (metadata.format === "22b") {
		return finish(base, 4, {
			a: upper,
			b: bytes.u8(pc + 2),
			literal: sign8(bytes.u8(pc + 3))
		});
	}
	if (metadata.format === "23x") {
		return finish(base, 4, {
			a: upper,
			b: bytes.u8(pc + 2),
			c: bytes.u8(pc + 3)
		});
	}
	if (metadata.format === "31i") {
		return finish(base, 6, { a: upper, literal: bytes.i32(pc + 2) });
	}
	if (metadata.format === "31c") {
		return finish(base, 6, { a: upper, index: bytes.u32(pc + 2) });
	}
	if (metadata.format === "31t") {
		return finish(base, 6, {
			a: upper,
			target: pc + bytes.i32(pc + 2) * 2
		});
	}
	if (metadata.format === "30t") {
		return finish(base, 6, { target: pc + bytes.i32(pc + 2) * 2 });
	}
	if (metadata.format === "32x") {
		return finish(base, 6, { a: bytes.u16(pc + 2), b: bytes.u16(pc + 4) });
	}
	if (metadata.format === "51l") {
		return finish(base, 10, { a: upper, literal: bytes.i64(pc + 2) });
	}
	return null;
}

function sign8(value) {
	return value & 0x80 ? value - 0x100 : value;
}
