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
	const RAW_TEXT = new Set(["script", "style", "textarea", "title"]);

	/**
	 * Converts source HTML into executor-owned lexical tokens through explicit states.
	 * The tokenizer never asks a browser DOM, parser package, or native library to
	 * understand markup; raw-text elements and malformed markup recover deterministically.
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
		while (state.at < state.source.length) {
			if (state.rawTag) {
				consumeRawText(state);
			} else if (state.source[state.at] === "<") {
				consumeMarkup(state);
			} else {
				consumeText(state);
			}
		}
		return Object.freeze(state.tokens.map(Object.freeze));
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
		if (state.source.startsWith("<!--", state.at)) {
			return markupScanner.scanHtmlComment(state);
		}
		if (state.source.slice(state.at, state.at + 9).toLowerCase() === "<!doctype") {
			return markupScanner.scanHtmlDoctype(state);
		}
		if (state.source.startsWith("</", state.at)) {
			return markupScanner.scanHtmlEndTag(state);
		}
		if (state.source[state.at + 1] === "!" || state.source[state.at + 1] === "?") {
			state.at += 1;
			return emitText(state, "<", false);
		}
		const token = markupScanner.scanHtmlStartTag(state);
		if (!token) {
			return emitText(state, "<", false);
		}
		state.tokens.push(token);
		if (!token.selfClosing && RAW_TEXT.has(token.name)) {
			state.rawTag = token.name;
		}
	}

	/** Emits raw-text characters until a matching end tag begins. */
	function consumeRawText(state) {
		const needle = `</${state.rawTag}`;
		const lower = state.source.toLowerCase();
		const found = lower.indexOf(needle, state.at);
		const stop = found < 0 ? state.source.length : found;
		emitText(state, state.source.slice(state.at, stop), state.rawTag === "textarea" || state.rawTag === "title");
		state.at = stop;
		state.rawTag = "";
	}

	/** Appends one text token while optionally resolving character references. */
	function emitText(state, value, resolveReferences) {
		if (!value) {
			return;
		}
		state.tokens.push({
			data: resolveReferences ? decode(value) : value,
			type: "text"
		});
	}

	return { tokenizeHtml };
});
