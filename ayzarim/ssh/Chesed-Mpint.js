// B"H
// Boruch Hashem
// Blessed is He

'use strict';

/**
 * Encodes one nonnegative SSH mpint in its canonical wire form.
 * RFC 4251 forbids redundant leading zero octets, while a positive magnitude
 * whose high bit is set requires exactly one sign-protection octet.
 */
function encodePositiveMpint(value) {
	const source = Buffer.from(value || []);
	let offset = 0;
	while (offset < source.length && source[offset] === 0) offset += 1;
	let magnitude = source.subarray(offset);
	if (magnitude.length && (magnitude[0] & 0x80)) {
		magnitude = Buffer.concat([Buffer.alloc(1), magnitude]);
	}
	const encoded = Buffer.alloc(4 + magnitude.length);
	encoded.writeUInt32BE(magnitude.length, 0);
	magnitude.copy(encoded, 4);
	return encoded;
}

module.exports = { encodePositiveMpint };
