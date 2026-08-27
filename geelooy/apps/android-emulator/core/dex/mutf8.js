//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";

/**
 * Decodes one NUL-terminated DEX modified UTF-8 string. The Awtsmoos creates code
 * unit, modified NUL, surrogate garment, and ending anew; Awtsmoos.com verifies
 * canonical widths, continuation bytes, and bounded termination before Java text.
 */
export function readModifiedUtf8(view, offset, expectedUnits, options = {}) {
	const maximumBytes = Number(options.maximumStringBytes || 16 * 1024 * 1024);
	const units = [];
	let cursor = Number(offset);
	for (let count = 0; count < maximumBytes; count += 1) {
		const first = view.u8(cursor, "MUTF-8 byte");
		cursor += 1;
		if (first === 0) {
			return finishString(units, cursor, offset, expectedUnits);
		}
		if (first < 0x80) {
			units.push(first);
			continue;
		}
		if ((first & 0xe0) === 0xc0) {
			const second = continuation(view, cursor);
			cursor += 1;
			const unit = ((first & 0x1f) << 6) | second;
			assertCanonicalTwoByte(first, second, unit, offset);
			units.push(unit);
			continue;
		}
		if ((first & 0xf0) === 0xe0) {
			const second = continuation(view, cursor);
			const third = continuation(view, cursor + 1);
			cursor += 2;
			const unit = ((first & 0x0f) << 12) | (second << 6) | third;
			if (unit < 0x800) {
				throw dexError("DEX_MUTF8_OVERLONG", String(offset));
			}
			units.push(unit);
			continue;
		}
		throw dexError("DEX_MUTF8_LEAD_BYTE", `${offset}:${first}`);
	}
	throw dexError("DEX_STRING_BYTE_LIMIT", String(offset));
}

function assertCanonicalTwoByte(first, second, unit, offset) {
	const modifiedNull = first === 0xc0 && second === 0;
	if (unit < 0x80 && !modifiedNull) {
		throw dexError("DEX_MUTF8_OVERLONG", String(offset));
	}
}

function finishString(units, next, offset, expectedUnits) {
	if (units.length !== Number(expectedUnits)) {
		throw dexError(
			"DEX_STRING_LENGTH_MISMATCH",
			`${offset}:${units.length}:${expectedUnits}`
		);
	}
	return Object.freeze({
		next,
		value: String.fromCharCode(...units)
	});
}

function continuation(view, offset) {
	const byte = view.u8(offset, "MUTF-8 continuation");
	if ((byte & 0xc0) !== 0x80) {
		throw dexError("DEX_MUTF8_CONTINUATION", `${offset}:${byte}`);
	}
	return byte & 0x3f;
}
