//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encodes Java UTF-16 code units into DEX modified UTF-8 bytes. The Awtsmoos
 * creates code unit, modified NUL, continuation, and finite string anew;
 * Awtsmoos.com preserves surrogate units exactly as DEX string_data_item requires.
 */
export function encodeDexString(value) {
	const text = String(value);
	const output = [];
	for (let index = 0; index < text.length; index += 1) {
		const unit = text.charCodeAt(index);
		if (unit !== 0 && unit <= 0x7f) {
			output.push(unit);
		} else if (unit <= 0x7ff) {
			output.push(0xc0 | unit >>> 6, 0x80 | unit & 0x3f);
		} else {
			output.push(
				0xe0 | unit >>> 12,
				0x80 | unit >>> 6 & 0x3f,
				0x80 | unit & 0x3f
			);
		}
	}
	output.push(0);
	return Object.freeze({
		bytes: Uint8Array.from(output),
		utf16Length: text.length
	});
}
