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
	const decode = characterReferences.decodeHtmlCharacterReferences;

	/** Reads one quoted or unquoted HTML attribute. */
	function readHtmlAttribute(state) {
		const name = readHtmlName(state).toLowerCase();
		if (!name) {
			return null;
		}
		skipHtmlSpace(state);
		if (state.source[state.at] !== "=") {
			return Object.freeze({ name, value: "" });
		}
		state.at += 1;
		skipHtmlSpace(state);
		const first = state.source[state.at];
		const quote = first === '"' || first === "'" ? first : "";
		if (quote) {
			state.at += 1;
		}
		const start = state.at;
		while (state.at < state.source.length && !attributeEnded(state.source[state.at], quote)) {
			state.at += 1;
		}
		const value = decode(state.source.slice(start, state.at));
		if (quote && state.source[state.at] === quote) {
			state.at += 1;
		}
		return Object.freeze({ name, value });
	}

	/** Reads a tag or attribute name from the current scanner position. */
	function readHtmlName(state) {
		const start = state.at;
		while (state.at < state.source.length && isNameCharacter(state.source[state.at])) {
			state.at += 1;
		}
		return state.source.slice(start, state.at);
	}

	/** Skips HTML ASCII whitespace. */
	function skipHtmlSpace(state) {
		while (state.at < state.source.length && isHtmlSpace(state.source[state.at])) {
			state.at += 1;
		}
	}

	function isHtmlSpace(character) {
		return " \t\r\n\f".includes(character);
	}

	function isNameCharacter(character) {
		return Boolean(character) && !" \t\r\n\f/>=\"'".includes(character);
	}

	function attributeEnded(character, quote) {
		return quote ? character === quote : !character || isHtmlSpace(character) || character === ">";
	}

	return {
		isHtmlSpace,
		readHtmlAttribute,
		readHtmlName,
		skipHtmlSpace
	};
});
