//B"H
//Boruch Hashem
//Blessed is He

/**
 * Decodes compact one- and two-code-unit Dalvik formats. The Awtsmoos creates
 * nibble register, byte register, signed literal, branch road, and pool index anew;
 * Awtsmoos.com returns byte-addressed targets while preserving code-unit semantics.
 */
export function decodeSmallFormat(bytes, pc, metadata, word) {
	const upper = word >>> 8;
	const base = instructionBase(pc, metadata);
	if (metadata.format === "10x") return finish(base, 2);
	if (metadata.format === "11x") return finish(base, 2, { a: upper });
	if (metadata.format === "12x") {
		return finish(base, 2, { a: upper & 0x0f, b: upper >>> 4 });
	}
	if (metadata.format === "10t") {
		return finish(base, 2, { target: pc + sign8(upper) * 2 });
	}
	if (metadata.format === "11n") {
		return finish(base, 2, {
			a: upper & 0x0f,
			literal: sign4(upper >>> 4)
		});
	}
	if (metadata.format === "20t") {
		return finish(base, 4, { target: pc + bytes.i16(pc + 2) * 2 });
	}
	if (metadata.format === "21s") {
		return finish(base, 4, { a: upper, literal: bytes.i16(pc + 2) });
	}
	if (metadata.format === "21h") {
		return finish(base, 4, { a: upper, literal: bytes.u16(pc + 2) });
	}
	if (metadata.format === "21c") {
		return finish(base, 4, { a: upper, index: bytes.u16(pc + 2) });
	}
	if (metadata.format === "21t") {
		return finish(base, 4, {
			a: upper,
			target: pc + bytes.i16(pc + 2) * 2
		});
	}
	return null;
}

export function instructionBase(pc, metadata) {
	return {
		format: metadata.format,
		name: metadata.name,
		opcode: metadata.opcode,
		pc
	};
}

export function finish(base, size, details = {}) {
	return Object.freeze({
		...base,
		...details,
		nextPc: base.pc + size,
		size
	});
}

function sign8(value) {
	return value & 0x80 ? value - 0x100 : value;
}

function sign4(value) {
	return value & 0x08 ? value - 0x10 : value;
}
