//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./HtmlAttributeScanner.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(attributes) {
	/** Reads a comment token and recovers cleanly from EOF. */
	function scanHtmlComment(state) {
		const end = state.source.indexOf("-->", state.at + 4);
		const stop = end < 0 ? state.source.length : end;
		state.tokens.push({ data: state.source.slice(state.at + 4, stop), type: "comment" });
		state.at = end < 0 ? state.source.length : end + 3;
	}

	/** Reads a doctype token without delegating parsing to the host browser. */
	function scanHtmlDoctype(state) {
		const end = state.source.indexOf(">", state.at + 2);
		const stop = end < 0 ? state.source.length : end;
		const body = state.source.slice(state.at + 9, stop).trim();
		let name = "";
		for (const character of body) {
			if (attributes.isHtmlSpace(character)) {
				break;
			}
			name += character;
		}
		state.tokens.push({ name: name.toLowerCase(), type: "doctype" });
		state.at = end < 0 ? state.source.length : end + 1;
	}

	/** Reads a closing tag and clears raw-text mode. */
	function scanHtmlEndTag(state) {
		state.at += 2;
		attributes.skipHtmlSpace(state);
		const name = attributes.readHtmlName(state).toLowerCase();
		while (state.at < state.source.length && state.source[state.at] !== ">") {
			state.at += 1;
		}
		if (state.source[state.at] === ">") {
			state.at += 1;
		}
		state.rawTag = "";
		state.tokens.push({ name, type: "endTag" });
	}

	/** Reads a start tag and its executor-owned attribute list. */
	function scanHtmlStartTag(state) {
		state.at += 1;
		const name = attributes.readHtmlName(state).toLowerCase();
		if (!name) {
			return null;
		}
		const values = [];
		let selfClosing = false;
		while (state.at < state.source.length) {
			attributes.skipHtmlSpace(state);
			if (state.source.startsWith("/>", state.at)) {
				selfClosing = true;
				state.at += 2;
				break;
			}
			if (state.source[state.at] === ">") {
				state.at += 1;
				break;
			}
			const attribute = attributes.readHtmlAttribute(state);
			if (attribute) {
				values.push(attribute);
			} else {
				state.at += 1;
			}
		}
		return {
			attributes: Object.freeze(values),
			name,
			selfClosing,
			type: "startTag"
		};
	}

	return {
		scanHtmlComment,
		scanHtmlDoctype,
		scanHtmlEndTag,
		scanHtmlStartTag
	};
});
