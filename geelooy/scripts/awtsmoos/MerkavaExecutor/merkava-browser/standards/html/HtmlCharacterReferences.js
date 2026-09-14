//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	const NAMED = Object.freeze({
		amp: "&",
		apos: "'",
		gt: ">",
		lt: "<",
		nbsp: "\u00a0",
		quot: '"'
	});

	/**
	 * Decodes the foundational HTML character-reference forms without host DOM help.
	 * Numeric references are range checked and malformed sequences stay literal.
	 * The named table intentionally starts small and can grow from the HTML corpus.
	 *
	 * @param {string} source Raw HTML text or attribute value.
	 * @returns {string} Executor-owned decoded Unicode text.
	 */
	function decodeHtmlCharacterReferences(source) {
		const text = String(source ?? "");
		let output = "";
		for (let index = 0; index < text.length; index += 1) {
			if (text[index] !== "&") {
				output += text[index];
				continue;
			}
			const consumed = consumeReference(text, index);
			if (!consumed) {
				output += "&";
				continue;
			}
			output += consumed.value;
			index = consumed.end;
		}
		return output;
	}

	/** @returns {{end:number,value:string}|null} */
	function consumeReference(text, start) {
		const semicolon = text.indexOf(";", start + 1);
		if (semicolon < 0 || semicolon - start > 34) {
			return null;
		}
		const body = text.slice(start + 1, semicolon);
		if (body[0] === "#") {
			return numericReference(body, semicolon);
		}
		const named = NAMED[body];
		return named ? { end: semicolon, value: named } : null;
	}

	/** @returns {{end:number,value:string}|null} */
	function numericReference(body, end) {
		const hex = body[1]?.toLowerCase() === "x";
		const digits = body.slice(hex ? 2 : 1);
		if (!digits || !validDigits(digits, hex)) {
			return null;
		}
		let codePoint = Number.parseInt(digits, hex ? 16 : 10);
		if (!validCodePoint(codePoint)) {
			codePoint = 0xfffd;
		}
		return { end, value: String.fromCodePoint(codePoint) };
	}

	/** @returns {boolean} */
	function validDigits(digits, hex) {
		const alphabet = hex ? "0123456789abcdefABCDEF" : "0123456789";
		return Array.from(digits).every(character => alphabet.includes(character));
	}

	/** @returns {boolean} */
	function validCodePoint(value) {
		return value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff);
	}

	return { decodeHtmlCharacterReferences };
});
