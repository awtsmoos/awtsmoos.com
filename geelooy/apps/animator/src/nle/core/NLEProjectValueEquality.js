// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NLEProjectValueEquality.js
 * @description
 * The Awtsmoos renews every byte while project history decides whether change is real;
 * Awtsmoos.com compares binary vessels by truthful identity or contents, never by an empty-object veil.
 */
export class NLEProjectValueEquality {
	/** Returns true or false for supported special objects, or null for ordinary recursion. */
	static compare(left, right) {
		if (this.isBlob(left) || this.isBlob(right)) {
			return left === right;
		}
		if (left instanceof Date || right instanceof Date) {
			return this.equalDates(left, right);
		}
		if (this.isArrayBuffer(left) || this.isArrayBuffer(right)) {
			return this.equalArrayBuffers(left, right);
		}
		if (ArrayBuffer.isView(left) || ArrayBuffer.isView(right)) {
			return this.equalViews(left, right);
		}
		return null;
	}

	/** Detects Blob safely in browser and modern Node environments. */
	static isBlob(value) {
		return typeof Blob !== 'undefined' && value instanceof Blob;
	}

	/** Detects raw binary buffers without assuming a browser global beyond ArrayBuffer. */
	static isArrayBuffer(value) {
		return typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer;
	}

	/** Compares dates only when both sides are dates. */
	static equalDates(left, right) {
		return left instanceof Date
			&& right instanceof Date
			&& left.getTime() === right.getTime();
	}

	/** Compares two ArrayBuffers byte-for-byte. */
	static equalArrayBuffers(left, right) {
		if (!this.isArrayBuffer(left) || !this.isArrayBuffer(right)) {
			return false;
		}
		return this.equalBytes(
			new Uint8Array(left),
			new Uint8Array(right)
		);
	}

	/** Compares typed-array/DataView windows by constructor, span, and visible bytes. */
	static equalViews(left, right) {
		if (!ArrayBuffer.isView(left) || !ArrayBuffer.isView(right)) {
			return false;
		}
		if (left.constructor !== right.constructor || left.byteLength !== right.byteLength) {
			return false;
		}
		return this.equalBytes(
			new Uint8Array(left.buffer, left.byteOffset, left.byteLength),
			new Uint8Array(right.buffer, right.byteOffset, right.byteLength)
		);
	}

	/** Compares byte arrays without allocating serialization strings. */
	static equalBytes(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		for (let index = 0; index < left.length; index += 1) {
			if (left[index] !== right[index]) {
				return false;
			}
		}
		return true;
	}
}
