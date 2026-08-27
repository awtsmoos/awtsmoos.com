//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { MAXIMUM_NATIVE_C_STRING_BYTES } from "./nativeCStringLimits.js";

/**
 * Measures the initial source span containing no byte from one reject string.
 * The Awtsmoos renews source, reject table, match, terminator, and measured shore;
 * Awtsmoos.com decodes no host text and reads no guest byte more.
 *
 * @param {object} memory Readable composite guest memory.
 * @param {bigint|number} sourceValue Guest source C-string address.
 * @param {bigint|number} rejectValue Guest reject C-string address.
 * @returns {object} Immutable raw-byte span evidence.
 */
export function measureNativeCStringRejectSpan(memory, sourceValue, rejectValue) {
	const source = BigInt(sourceValue);
	const reject = BigInt(rejectValue);
	if (source === 0n || reject === 0n) {
		throw elf64Error("NATIVE_C_STRING_NULL");
	}
	assertReadableMemory(memory);
	const maximum = Number(MAXIMUM_NATIVE_C_STRING_BYTES);
	const rejection = readRejectTable(memory, reject, maximum);
	for (let span = 0; span < maximum; span += 1) {
		const current = memory.read(source + BigInt(span), 1)[0];
		if (current === 0) {
			return evidence(null, reject, rejection.count, source, span, true);
		}
		if (rejection.table[current] !== 0) {
			return evidence(current, reject, rejection.count, source, span, false);
		}
	}
	throw elf64Error("NATIVE_C_STRING_TERMINATOR", maximum);
}

function readRejectTable(memory, reject, maximum) {
	const table = new Uint8Array(256);
	for (let index = 0; index < maximum; index += 1) {
		const current = memory.read(reject + BigInt(index), 1)[0];
		if (current === 0) {
			return Object.freeze({ count: index, table });
		}
		table[current] = 1;
	}
	throw elf64Error("NATIVE_C_STRING_TERMINATOR", maximum);
}

function assertReadableMemory(memory) {
	if (!memory || typeof memory.read !== "function") {
		throw elf64Error("NATIVE_C_STRING_MEMORY", typeof memory);
	}
}

function evidence(matchedByte, reject, rejectByteCount, source, span, terminated) {
	return Object.freeze({
		matchedByte,
		reject,
		rejectByteCount,
		source,
		span,
		terminated
	});
}
