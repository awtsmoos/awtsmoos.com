//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./HtmlTreeSupport.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(support) {
	/**
	 * Builds a VirtualDocument tree exclusively from Merkava HTML tokens.
	 * Canonical html/head/body vessels are preserved, attributes use first-wins
	 * semantics, raw style text feeds our CSS engine, and malformed closes recover.
	 *
	 * @param {object} document Executor-owned VirtualDocument instance.
	 * @param {ReadonlyArray<object>} tokens Token stream from tokenizeHtml().
	 * @returns {{nodes:number,ok:boolean,title:string}} Tree-construction summary.
	 */
	function buildHtmlTree(document, tokens) {
		document.head.replaceChildren();
		document.body.replaceChildren();
		const state = {
			document,
			stack: [document.documentElement]
		};
		for (const token of tokens) {
			consumeToken(state, token);
		}
		support.applyHtmlDefaultDisplay(document.body);
		return {
			nodes: support.countHtmlNodes(document.documentElement),
			ok: true,
			title: document.querySelector("title")?.textContent || ""
		};
	}

	/** Routes one lexical token into tree-construction behavior. */
	function consumeToken(state, token) {
		if (token.type === "startTag") {
			return openElement(state, token);
		}
		if (token.type === "endTag") {
			return closeElement(state, token.name);
		}
		if (token.type === "text") {
			appendText(state, token.data);
		}
	}

	/** Creates or reuses an element and establishes its insertion parent. */
	function openElement(state, token) {
		const canonical = support.canonicalHtmlElement(state.document, token.name);
		const element = canonical || state.document.createElement(token.name);
		applyAttributes(element, token.attributes);
		const parent = support.htmlInsertionParent(state, token.name);
		if (!canonical && element.parentNode !== parent) {
			parent.appendChild(element);
		}
		if (!token.selfClosing && !support.VOID_TAGS.has(token.name)) {
			state.stack.push(element);
		}
	}

	/** Pops through the matching open element while tolerating unmatched closes. */
	function closeElement(state, tagName) {
		for (let index = state.stack.length - 1; index > 0; index -= 1) {
			if (state.stack[index].localName === tagName) {
				state.stack.length = index;
				return;
			}
		}
	}

	/** Appends exact DOM text; whitespace normalization belongs to layout, not parsing. */
	function appendText(state, text) {
		if (!text) {
			return;
		}
		const parent = support.currentHtmlParent(state);
		parent.appendChild(state.document.createTextNode(text));
		if (parent.localName === "style") {
			state.document.cssEngine.parseStyleSheet(text);
		}
	}

	/** Applies only the first occurrence of each HTML attribute name. */
	function applyAttributes(element, attributes) {
		const seen = new Set();
		for (const attribute of attributes || []) {
			if (seen.has(attribute.name)) {
				continue;
			}
			seen.add(attribute.name);
			element.setAttribute(attribute.name, attribute.value);
		}
	}

	return { buildHtmlTree };
});
