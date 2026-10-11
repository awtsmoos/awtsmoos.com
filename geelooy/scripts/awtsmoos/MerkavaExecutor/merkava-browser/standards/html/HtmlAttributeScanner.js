//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./HtmlCharacterReferences.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(characterReferences) {
	/**
	 * Scans one attribute name/value pair starting at state.at (first name char).
	 * Uses charCode classification instead of regex/sets, and native indexOf
	 * for quoted values (the common case) instead of char-by-char walking.
	 *
	 * @param {object} state Tokenizer state ({source, at}).
	 * @returns {{name:string,value:string,next:number}|null}
	 */
	function scanHtmlAttribute(state) {
		const s = state.source;
		const len = s.length;
		let at = state.at;
		// Read the attribute name: stop at space, /, >, =, quotes.
		const nameStart = at;
		while (at < len) {
			const c = s.charCodeAt(at);
			if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0c || c === 0x0d || // space
				c === 0x2f || c === 0x3e || // "/" ">"
				c === 0x3d || c === 0x22 || c === 0x27) { // "=" '"' "'"
				break;
			}
			at++;
		}
		if (at === nameStart) {
			return null;
		}
		const name = s.slice(nameStart, at).toLowerCase();
		// Skip spaces between name and "=".
		while (at < len) {
			const c = s.charCodeAt(at);
			if (c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0c && c !== 0x0d) break;
			at++;
		}
		// Bare attribute (no "="): value is "".
		if (at >= len || s.charCodeAt(at) !== 0x3d) { // "="
			return { name, next: at, value: "" };
		}
		at++; // consume "="
		while (at < len) {
			const c = s.charCodeAt(at);
			if (c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0c && c !== 0x0d) break;
			at++;
		}
		if (at >= len) {
			return { name, next: at, value: "" };
		}
		const quote = s.charCodeAt(at);
		if (quote === 0x22 || quote === 0x27) { // '"' or "'"
			// Native indexOf for the closing quote: the single biggest win for
			// attribute-heavy markup (was: char-by-char loop).
			const close = s.indexOf(s[at], at + 1);
			const end = close < 0 ? len : close;
			const raw = s.slice(at + 1, end);
			return {
				name,
				next: close < 0 ? len : close + 1,
				value: characterReferences.decodeHtmlCharacterReferences(raw)
			};
		}
		// Unquoted value: read until whitespace or ">" (a "/" is part of the
		// value per the HTML spec, e.g. <div a=b/> has value "b/").
		const valueStart = at;
		while (at < len) {
			const c = s.charCodeAt(at);
			if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0c || c === 0x0d ||
				c === 0x3e) {
				break;
			}
			at++;
		}
		const raw = s.slice(valueStart, at);
		return {
			name,
			next: at,
			value: characterReferences.decodeHtmlCharacterReferences(raw)
		};
	}

	return { scanHtmlAttribute };
});
