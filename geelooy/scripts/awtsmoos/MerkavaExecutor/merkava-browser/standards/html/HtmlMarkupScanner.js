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
})(typeof self !== "undefined" ? self : this, function(attributeScanner) {
	/** Reads a comment token and recovers cleanly from EOF. */
	function scanHtmlComment(state) {
		const s = state.source;
		const end = s.indexOf("-->", state.at + 4);
		const stop = end < 0 ? s.length : end;
		state.pushToken({ data: s.slice(state.at + 4, stop), type: "comment" });
		state.at = end < 0 ? s.length : end + 3;
	}

	/** Reads a doctype token without delegating parsing to the host browser. */
	function scanHtmlDoctype(state) {
		const s = state.source;
		const end = s.indexOf(">", state.at + 2);
		const stop = end < 0 ? s.length : end;
		// Skip "<!doctype" (9 chars) then ASCII whitespace; name runs to whitespace.
		let at = state.at + 9;
		while (at < stop) {
			const c = s.charCodeAt(at);
			if (c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0c && c !== 0x0d) break;
			at++;
		}
		const nameStart = at;
		while (at < stop) {
			const c = s.charCodeAt(at);
			if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0c || c === 0x0d) break;
			at++;
		}
		const name = s.slice(nameStart, at).toLowerCase();
		state.pushToken({ name, type: "doctype" });
		state.at = end < 0 ? s.length : end + 1;
	}

	/** Reads a closing tag and clears raw-text mode. */
	function scanHtmlEndTag(state) {
		const s = state.source;
		const len = s.length;
		let at = state.at + 2;
		while (at < len) {
			const c = s.charCodeAt(at);
			if (c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0c && c !== 0x0d) break;
			at++;
		}
		const nameStart = at;
		while (at < len) {
			const c = s.charCodeAt(at);
			if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0c || c === 0x0d ||
				c === 0x2f || c === 0x3e || c === 0x3d || c === 0x22 || c === 0x27) break;
			at++;
		}
		const name = s.slice(nameStart, at).toLowerCase();
		const gt = s.indexOf(">", at);
		state.at = gt < 0 ? len : gt + 1;
		state.rawTag = "";
		state.pushToken({ name, type: "endTag" });
	}

	/**
	 * Reads a start tag and its executor-owned attribute list.
	 * In streaming mode, first-wins attribute dedup happens here so the tree
	 * builder never sees duplicates; in token mode all attributes are kept and
	 * the tree builder applies first-wins (original contract).
	 */
	function scanHtmlStartTag(state) {
		const s = state.source;
		const len = s.length;
		let at = state.at + 1;
		// Read tag name via charCode (no per-char string indexing).
		const nameStart = at;
		while (at < len) {
			const c = s.charCodeAt(at);
			if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0c || c === 0x0d ||
				c === 0x2f || c === 0x3e || c === 0x3d || c === 0x22 || c === 0x27) break;
			at++;
		}
		if (at === nameStart) {
			return null;
		}
		const name = s.slice(nameStart, at).toLowerCase();
		const values = [];
		// Streaming: null-proto set for first-wins dedup during scan.
		const seen = state.streaming ? Object.create(null) : null;
		let selfClosing = false;
		while (at < len) {
			// skipHtmlSpace (charCode).
			while (at < len) {
				const c = s.charCodeAt(at);
				if (c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0c && c !== 0x0d) break;
				at++;
			}
			if (at >= len) break;
			// "/>" self-closing check via charCodes (no startsWith alloc).
			if (s.charCodeAt(at) === 0x2f && s.charCodeAt(at + 1) === 0x3e) {
				selfClosing = true;
				at += 2;
				break;
			}
			if (s.charCodeAt(at) === 0x3e) {
				at += 1;
				break;
			}
			state.at = at;
			const attribute = attributeScanner.scanHtmlAttribute(state);
			if (attribute) {
				at = attribute.next;
				if (seen) {
					if (!seen[attribute.name]) {
						seen[attribute.name] = 1;
						values.push(attribute);
					}
				} else {
					values.push(attribute);
				}
			} else {
				at += 1;
			}
		}
		state.at = at;
		// Note: rawTag is set by the tokenizer (only when not self-closing),
		// not here — scanHtmlStartTag stays a pure scanner.
		return {
			attributes: state.streaming ? values : Object.freeze(values),
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
