// B"H

/**
 * @file core/vacuum/hashWriter.js
 * @chapter Boundaries Make The Song Unambiguous
 * @description
 * Writes length-prefixed tags and values into a digest so adjacent forms cannot
 * masquerade as one another.
 */

class HashWriter {
	constructor(hash) {
		this.hash = hash;
	}

	tag(value) {
		const body = Buffer.from(String(value), 'utf8');
		const length = Buffer.allocUnsafe(4);
		length.writeUInt32BE(body.length, 0);
		this.hash.update(length);
		this.hash.update(body);
	}

	bytes(value) {
		const body = Buffer.from(value || []);
		const length = Buffer.allocUnsafe(8);
		length.writeBigUInt64BE(BigInt(body.length), 0);
		this.hash.update(length);
		this.hash.update(body);
	}

	number(value) {
		if (Number.isNaN(value)) return this.tag('number:nan');
		if (value === Infinity) return this.tag('number:+infinity');
		if (value === -Infinity) return this.tag('number:-infinity');
		if (Object.is(value, -0)) return this.tag('number:-zero');
		const buffer = Buffer.allocUnsafe(8);
		buffer.writeDoubleBE(value, 0);
		this.tag('number');
		this.bytes(buffer);
	}
}

module.exports = HashWriter;
