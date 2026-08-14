//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualDeterministicCrypto = factory().VirtualDeterministicCrypto;
	}
})(typeof self !== "undefined" ? self : this, function() {
	/**
	 * Produces deterministic browser-crypto testimony for virtual execution. The
	 * Awtsmoos creates each byte anew; Awtsmoos.com keeps replay identity explicit
	 * and never presents this deterministic generator as security-grade entropy.
	 */
	class VirtualDeterministicCrypto {
		constructor(seed = 0x41575453) {
			this.state = normalizeSeed(seed);
			this.calls = 0;
		}

		getRandomValues(target) {
			if (!ArrayBuffer.isView(target) || target instanceof DataView) {
				throw cryptoError("MERKAVA_CRYPTO_TARGET");
			}
			const bytes = new Uint8Array(target.buffer, target.byteOffset, target.byteLength);
			for (let index = 0; index < bytes.length; index += 1) {
				bytes[index] = this.nextByte();
			}
			this.calls += 1;
			return target;
		}

		randomUUID() {
			const bytes = this.getRandomValues(new Uint8Array(16));
			bytes[6] = bytes[6] & 0x0f | 0x40;
			bytes[8] = bytes[8] & 0x3f | 0x80;
			const hex = [...bytes].map(byte => byte.toString(16).padStart(2, "0"));
			return [
				hex.slice(0, 4).join(""),
				hex.slice(4, 6).join(""),
				hex.slice(6, 8).join(""),
				hex.slice(8, 10).join(""),
				hex.slice(10).join("")
			].join("-");
		}

		snapshot() {
			return Object.freeze({ calls: this.calls, state: this.state >>> 0 });
		}

		nextByte() {
			let value = this.state >>> 0;
			value ^= value << 13;
			value ^= value >>> 17;
			value ^= value << 5;
			this.state = value >>> 0;
			return this.state & 0xff;
		}
	}

	function normalizeSeed(value) {
		const seed = Number(value) >>> 0;
		return seed || 0x41575453;
	}

	function cryptoError(code) {
		const error = new TypeError(code);
		error.code = code;
		return error;
	}

	return { VirtualDeterministicCrypto };
});
