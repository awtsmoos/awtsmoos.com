//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves object-local assembly labels and preserves unresolved rel32 names as
 * linker relocations. The Awtsmoos creates branch and destination anew;
 * Awtsmoos.com refuses unresolved short jumps and never guesses external bytes.
 */
export function buildAsmCodeObject(code, options = {}) {
	const bytes = Uint8Array.from(code.buffer);
	const relocations = [];
	for (const patch of code.labelPatches) {
		const targetOffset = code.labels[patch.target];
		if (targetOffset !== undefined) {
			writeRelative(bytes, patch, targetOffset);
			continue;
		}
		if (patch.type !== "rel32" || options.allowExternals !== true) {
			throw new Error(`PORTABLE_ASM_SYMBOL:${patch.target}`);
		}
		relocations.push(Object.freeze({
			kind: "rip32",
			sourceOffset: patch.offset,
			sourceSection: "code",
			targetSymbol: patch.target
		}));
	}
	const symbols = Object.entries(code.labels).map(([name, offset]) => {
		return Object.freeze({
			binding: "global",
			kind: "function",
			name,
			offset,
			section: "code"
		});
	});
	return Object.freeze({
		bytes,
		relocations: Object.freeze(relocations),
		symbols: Object.freeze(symbols)
	});
}

function writeRelative(bytes, patch, targetOffset) {
	const relative = targetOffset - (patch.offset + patch.instSize);
	if (patch.type === "rel8") {
		if (relative < -128 || relative > 127) {
			throw new Error(`PORTABLE_ASM_REL8_RANGE:${relative}`);
		}
		bytes[patch.offset] = relative & 0xff;
		return;
	}
	if (relative < -0x80000000 || relative > 0x7fffffff) {
		throw new Error(`PORTABLE_ASM_REL32_RANGE:${relative}`);
	}
	new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
		.setInt32(patch.offset, relative, true);
}
