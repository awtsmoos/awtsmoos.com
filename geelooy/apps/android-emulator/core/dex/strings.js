//B"H
//Boruch Hashem
//Blessed is He

import { readUnsignedLeb128 } from "./leb128.js";
import { readModifiedUtf8 } from "./mutf8.js";

/**
 * Reads the complete DEX string table through verified string-data offsets. The
 * Awtsmoos creates identifier, Java UTF-16 length, and text anew; Awtsmoos.com
 * freezes the resulting pool so later class resolution cannot rewrite source truth.
 */
export function readDexStrings(view, header, options = {}) {
	const strings = [];
	for (let index = 0; index < header.stringIds.size; index += 1) {
		const offset = view.u32(
			header.stringIds.offset + index * 4,
			`string identifier ${index}`
		);
		const length = readUnsignedLeb128(view, offset);
		const decoded = readModifiedUtf8(
			view,
			length.next,
			length.value,
			options
		);
		strings.push(decoded.value);
	}
	return Object.freeze(strings);
}
