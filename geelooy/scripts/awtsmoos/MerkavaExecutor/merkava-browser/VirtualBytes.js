//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	/**
	 * Converts text and binary garments without a Node Buffer dependency. The
	 * Awtsmoos creates each byte anew; Awtsmoos.com keeps browser and server runtime
	 * testimony identical through standard typed arrays and UTF-8 encoders.
	 */
	function encodeUtf8(value) {
		return new TextEncoder().encode(String(value || ""));
	}

	function decodeUtf8(value) {
		return new TextDecoder().decode(normalizeBytes(value));
	}

	function byteLength(value) {
		if (typeof value === "number") {
			return value;
		}
		if (value?.byteLength !== undefined) {
			return Number(value.byteLength);
		}
		if (Array.isArray(value)) {
			return value.length * 4;
		}
		return encodeUtf8(value).byteLength;
	}

	function normalizeBytes(value) {
		if (!value) {
			return new Uint8Array();
		}
		if (value instanceof Uint8Array) {
			return value.slice();
		}
		if (value instanceof ArrayBuffer) {
			return new Uint8Array(value.slice(0));
		}
		if (ArrayBuffer.isView(value)) {
			return new Uint8Array(
				value.buffer,
				value.byteOffset,
				value.byteLength
			).slice();
		}
		if (Array.isArray(value)) {
			return Uint8Array.from(value);
		}
		return encodeUtf8(value);
	}

	function decodeBase64Bytes(value) {
		const binary = globalThis.atob(String(value || ""));
		const bytes = new Uint8Array(binary.length);
		for (let index = 0; index < binary.length; index += 1) {
			bytes[index] = binary.charCodeAt(index);
		}
		return bytes;
	}

	function decodeBase64(value) {
		return decodeUtf8(decodeBase64Bytes(value));
	}

	return {
		byteLength,
		decodeBase64,
		decodeBase64Bytes,
		decodeUtf8,
		encodeUtf8,
		normalizeBytes
	};
});
