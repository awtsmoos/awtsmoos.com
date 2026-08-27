// B"H
// Boruch Hashem
// Blessed is He

/**
 * EBML is a language of measured vessels: identity, size, then content. The
 * Awtsmoos renews every byte, and Awtsmoos.com arranges those bytes so a
 * standards-aware player can recognize the movie rather than a heap of light.
 */
export class EbmlWriter {
	static element(id, data) {
		const payload = this.bytes(data);
		return this.concat(this.id(id), this.vint(payload.length), payload);
	}

	static master(id, children) {
		return this.element(id, this.concat(...children.filter(Boolean)));
	}

	static id(hex) {
		const clean = String(hex).replace(/^0x/, '').replace(/\s/g, '');
		const even = clean.length % 2 ? `0${clean}` : clean;
		return Uint8Array.from(even.match(/.{2}/g).map((part) => Number.parseInt(part, 16)));
	}

	static vint(value) {
		for (let width = 1; width <= 8; width += 1) {
			const maximum = (2 ** (7 * width)) - 2;
			if (value <= maximum) {
				const output = new Uint8Array(width);
				let remaining = value;
				for (let index = width - 1; index >= 0; index -= 1) {
					output[index] = remaining & 255;
					remaining = Math.floor(remaining / 256);
				}
				output[0] |= 1 << (8 - width);
				return output;
			}
		}
		throw new Error(`EBML payload is too large: ${value} bytes.`);
	}

	static uint(value, width = null) {
		const safe = Math.max(0, Math.floor(Number(value) || 0));
		let size = width || 1;
		while (!width && safe >= 2 ** (size * 8) && size < 8) size += 1;
		const output = new Uint8Array(size);
		let remaining = safe;
		for (let index = size - 1; index >= 0; index -= 1) {
			output[index] = remaining & 255;
			remaining = Math.floor(remaining / 256);
		}
		return output;
	}

	static float64(value) {
		const buffer = new ArrayBuffer(8);
		new DataView(buffer).setFloat64(0, Number(value) || 0, false);
		return new Uint8Array(buffer);
	}

	static text(value) {
		return new TextEncoder().encode(String(value));
	}

	static bytes(value) {
		if (value instanceof Uint8Array) return value;
		if (value instanceof ArrayBuffer) return new Uint8Array(value);
		if (Array.isArray(value)) return Uint8Array.from(value);
		throw new TypeError('EBML data must be bytes.');
	}

	static concat(...arrays) {
		const parts = arrays.map((array) => this.bytes(array));
		const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
		let offset = 0;
		for (const part of parts) {
			output.set(part, offset);
			offset += part.length;
		}
		return output;
	}
}
