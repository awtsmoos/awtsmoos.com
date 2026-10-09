//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./HtmlCharacterReferences.js"),
			require("./HtmlMarkupScanner.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava, root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(characterReferences, markupScanner) {
	const decode = characterReferences.decodeHtmlCharacterReferences;

	// Raw-text elements: charCode dispatch instead of Set.has (avoids the Set
	// lookup; the four names are checked inline in consumeMarkup).
	function isRawTextTag(name) {
		return name === "script" || name === "style" ||
			name === "textarea" || name === "title";
	}

	/**
	 * Converts source HTML into executor-owned lexical tokens through explicit states.
	 * The tokenizer never asks a browser DOM, parser package, or native library to
	 * understand markup; raw-text elements and malformed markup recover deterministically.
	 *
	 * Hot-loop notes: the main dispatch uses charCodeAt instead of string
	 * indexing, and "<!doctype" is matched with branchless charCode compares
	 * (no slice().toLowerCase() allocation per "<").
	 *
	 * @param {string} source Source HTML bytes decoded as JavaScript text.
	 * @returns {ReadonlyArray<object>} Frozen token stream consumed by our tree builder.
	 */
	function tokenizeHtml(source) {
		const state = {
			at: 0,
			rawTag: "",
			source: String(source ?? ""),
			tokens: []
		};
		state.pushToken = token => state.tokens.push(token);
		while (state.at < state.source.length) {
			if (state.rawTag) {
				consumeRawText(state);
			} else if (state.source.charCodeAt(state.at) === 0x3c) { // "<"
				consumeMarkup(state);
			} else {
				consumeText(state);
			}
		}
		return Object.freeze(state.tokens.map(Object.freeze));
	}

	/**
	 * Streaming tokenizer: invokes onToken per token, never materializes the
	 * token array. The tree builder consumes this directly (single pass,
	 * bytes -> DOM, no intermediate list).
	 *
	 * @param {string} source Raw HTML source.
	 * @param {(token:object)=>void} onToken Per-token consumer.
	 * @returns {number} Count of tokens emitted.
	 */
	function streamHtmlTokens(source, onToken) {
		let count = 0;
		const state = {
			at: 0,
			rawTag: "",
			source: String(source ?? ""),
			streaming: true
		};
		state.pushToken = token => { count += 1; onToken(token); };
		while (state.at < state.source.length) {
			if (state.rawTag) {
				consumeRawText(state);
			} else if (state.source.charCodeAt(state.at) === 0x3c) { // "<"
				consumeMarkup(state);
			} else {
				consumeText(state);
			}
		}
		return count;
	}

	/** Consumes character data until the next markup boundary. */
	function consumeText(state) {
		const found = state.source.indexOf("<", state.at);
		const stop = found < 0 ? state.source.length : found;
		emitText(state, state.source.slice(state.at, stop), true);
		state.at = stop;
	}

	/** Dispatches markup scanning without regex tag extraction. */
	function consumeMarkup(state) {
		const s = state.source;
		const at = state.at;
		// "<!--": charCode compares, no startsWith.
		if (s.charCodeAt(at + 1) === 0x21 && s.charCodeAt(at + 2) === 0x2d &&
			s.charCodeAt(at + 3) === 0x2d) { // "!--"
			return markupScanner.scanHtmlComment(state);
		}
		// "<!doctype": branchless case-insensitive charCode match, no slice/toLowerCase.
		if (s.charCodeAt(at + 1) === 0x21 && // "!"
			(s.charCodeAt(at + 2) | 32) === 0x64 && // "d"
			(s.charCodeAt(at + 3) | 32) === 0x6f && // "o"
			(s.charCodeAt(at + 4) | 32) === 0x63 && // "c"
			(s.charCodeAt(at + 5) | 32) === 0x74 && // "t"
			(s.charCodeAt(at + 6) | 32) === 0x79 && // "y"
			(s.charCodeAt(at + 7) | 32) === 0x70 && // "p"
			(s.charCodeAt(at + 8) | 32) === 0x65) { // "e"
			return markupScanner.scanHtmlDoctype(state);
		}
		if (s.charCodeAt(at + 1) === 0x2f) { // "/"
			return markupScanner.scanHtmlEndTag(state);
		}
		const next = s.charCodeAt(at + 1);
		if (next === 0x21 || next === 0x3f) { // "!" or "?"
			state.at += 1;
			return emitText(state, "<", false);
		}
		const token = markupScanner.scanHtmlStartTag(state);
		if (!token) {
			return emitText(state, "<", false);
		}
		emitToken(state, token);
		if (!token.selfClosing && isRawTextTag(token.name)) {
			state.rawTag = token.name;
		}
	}

	/**
	 * Emits raw-text characters until a matching end tag begins.
	 * Scans for "</" with native indexOf and case-insensitively matches the tag
	 * name inline — no whole-source toLowerCase() (the old code lowercased the
	 * ENTIRE document per raw-text element: O(n) per script/style block).
	 */
	function consumeRawText(state) {
		const s = state.source;
		const tag = state.rawTag;
		const tagLen = tag.length;
		const start = state.at;
		let at = start;
		while (true) {
			const found = s.indexOf("</", at);
			if (found < 0) {
				emitText(state, s.slice(start), tag === "textarea" || tag === "title");
				state.at = s.length;
				state.rawTag = "";
				return;
			}
			// Case-insensitive prefix match of the raw tag name after "</".
			let ok = true;
			for (let i = 0; i < tagLen; i++) {
				const c = s.charCodeAt(found + 2 + i);
				const t = tag.charCodeAt(i);
				if (c !== t && (c | 32) !== t) { ok = false; break; }
			}
			if (ok) {
				emitText(state, s.slice(start, found), tag === "textarea" || tag === "title");
				state.at = found;
				state.rawTag = "";
				return;
			}
			at = found + 2;
		}
	}

	/** Appends one text token while optionally resolving character references. */
	function emitText(state, value, resolveReferences) {
		if (!value) {
			return;
		}
		state.pushToken({
			data: resolveReferences ? decode(value) : value,
			type: "text"
		});
	}

	function emitToken(state, token) {
		state.pushToken(token);
	}

	return { streamHtmlTokens, tokenizeHtml };
});
