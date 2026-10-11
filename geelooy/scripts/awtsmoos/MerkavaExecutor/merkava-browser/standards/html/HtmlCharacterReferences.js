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
	/**
	 * Decodes HTML character references inside a raw token slice.
	 *
	 * Fast paths first: when the slice has no "&" we return it untouched
	 * (zero-copy), and runs of plain text between references are appended as
	 * whole slices instead of character-by-character concatenation.
	 *
	 * @param {string} raw Source text that may contain character references.
	 * @returns {string} The decoded text.
	 */
	function decodeHtmlCharacterReferences(raw) {
		// Fast path: no ampersand means no references at all.
		if (raw.indexOf("&") < 0) {
			return raw;
		}
		let output = "";
		let cursor = 0;
		while (true) {
			const amp = raw.indexOf("&", cursor);
			if (amp < 0) {
				output += raw.slice(cursor);
				return output;
			}
			// Append the plain run before this "&" as one slice.
			output += raw.slice(cursor, amp);
			const decoded = decodeOneReference(raw, amp);
			if (decoded) {
				output += decoded.value;
				cursor = decoded.next;
			} else {
				output += "&";
				cursor = amp + 1;
			}
		}
	}

	/**
	 * Attempts to decode a single reference starting at an "&" position.
	 * @returns {{value:string,next:number}|null}
	 */
	function decodeOneReference(raw, amp) {
		const semi = raw.indexOf(";", amp + 1);
		if (semi < 0 || semi - amp > 32) {
			return null;
		}
		const body = raw.slice(amp + 1, semi);
		if (body.charCodeAt(0) === 0x23) { // "#"
			return decodeNumericReference(raw, body, semi);
		}
		const value = NAMED_REFERENCES[body];
		return value === undefined ? null : { next: semi + 1, value };
	}

	/** Decodes "&#...;" / "&#x...;" numeric references with surrogate guards. */
	function decodeNumericReference(raw, body, semi) {
		const second = body.charCodeAt(1);
		const isHex = second === 0x78 || second === 0x58; // "x" | "X"
		const digits = isHex ? body.slice(2) : body.slice(1);
		if (!digits) {
			return null;
		}
		// Validate digits by charCode (faster than a regex).
		if (isHex) {
			for (let i = 0; i < digits.length; i++) {
				const c = digits.charCodeAt(i);
				const isDigit = c >= 0x30 && c <= 0x39;
				const isHexLo = c >= 0x61 && c <= 0x66;
				const isHexHi = c >= 0x41 && c <= 0x46;
				if (!isDigit && !isHexLo && !isHexHi) {
					return null;
				}
			}
		} else {
			for (let i = 0; i < digits.length; i++) {
				const c = digits.charCodeAt(i);
				if (c < 0x30 || c > 0x39) {
					return null;
				}
			}
		}
		const codePoint = parseInt(digits, isHex ? 16 : 10);
		if (!Number.isSafeInteger(codePoint)) {
			return null;
		}
		if (codePoint === 0 || codePoint > 0x10ffff ||
			(codePoint >= 0xd800 && codePoint <= 0xdfff)) {
			return { next: semi + 1, value: "�" };
		}
		return { next: semi + 1, value: String.fromCodePoint(codePoint) };
	}

	/**
	 * Lookup table for the most common HTML named character references.
	 * Fixed table (replaces the old computed object spread).
	 */
	const NAMED_REFERENCES = {
		amp: "&",
		lt: "<",
		gt: ">",
		quot: '"',
		apos: "'",
		nbsp: " ",
		copy: "©",
		reg: "®",
		trade: "™",
		hellip: "…",
		mdash: "—",
		ndash: "–",
		lsquo: "‘",
		rsquo: "’",
		ldquo: "“",
		rdquo: "”",
		bull: "•",
		middot: "·",
		laquo: "«",
		raquo: "»",
		iexcl: "¡",
		iquest: "¿",
		sect: "§",
		para: "¶",
		sup1: "¹",
		sup2: "²",
		sup3: "³",
		frac14: "¼",
		frac12: "½",
		frac34: "¾",
		times: "×",
		divide: "÷",
		plusmn: "±",
		deg: "°",
		micro: "µ",
		auml: "ä",
		ouml: "ö",
		uuml: "ü",
		Auml: "Ä",
		Ouml: "Ö",
		Uuml: "Ü",
		sszlig: "ß",
		szlig: "ß",
		eacute: "é",
		Eacute: "É",
		egrave: "è",
		ecirc: "ê",
		agrave: "à",
		aacute: "á",
		acirc: "â",
		atilde: "ã",
		aring: "å",
		ccedil: "ç",
		ntilde: "ñ",
		oslash: "ø",
		Oslash: "Ø",
		aelig: "æ",
		AElig: "Æ",
		alpha: "α",
		beta: "β",
		gamma: "γ",
		delta: "δ",
		epsilon: "ε",
		pi: "π",
		sigma: "σ",
		omega: "ω",
		infin: "∞",
		ne: "≠",
		le: "≤",
		ge: "≥",
		larr: "←",
		rarr: "→",
		uarr: "↑",
		darr: "↓",
		harr: "↔",
		crarr: "↵",
		lArr: "⇐",
		rArr: "⇒",
		uArr: "⇑",
		dArr: "⇓",
		hArr: "⇔",
		forall: "∀",
		exist: "∃",
		empty: "∅",
		isin: "∈",
		notin: "∉",
		ni: "∋",
		prod: "∏",
		sum: "∑",
		minus: "−",
		lowast: "∗",
		radic: "√",
		prop: "∝",
		part: "∂",
		int: "∫",
		there4: "∴",
		sim: "∼",
		cong: "≅",
		asymp: "≈",
		sub: "⊂",
		sup: "⊃",
		nsub: "⊄",
		sube: "⊆",
		supe: "⊇",
		oplus: "⊕",
		otimes: "⊗",
		per: "⊥",
		sdot: "⋅",
		lceil: "⌈",
		rceil: "⌉",
		lfloor: "⌊",
		rfloor: "⌋",
		lang: "⟨",
		rang: "⟩",
		spades: "♠",
		clubs: "♣",
		hearts: "♥",
		diams: "♦",
		alefsym: "ℵ",
		weierp: "℘",
		real: "ℜ",
		image: "ℑ",
		euro: "€",
		pound: "£",
		yen: "¥",
		cent: "¢",
		curren: "¤",
		brvbar: "¦",
		uml: "¨",
		ordf: "ª",
		ordm: "º",
		macr: "¯",
		acute: "´",
		cedil: "¸",
		frac18: "⅛",
		frac38: "⅜",
		frac58: "⅝",
		frac78: "⅞",
		ensp: " ",
		emsp: " ",
		thinsp: " "
	};

	return { decodeHtmlCharacterReferences };
});
