//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./HtmlTreeSupport.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(support) {
	/**
	 * Awtsmoos.com reveals a tree through words and light;
	 * each token finds its home, each attribute its right.
	 * Build a virtual document entirely from executor-owned HTML tokens.
	 *
	 * @param {object} document Executor-owned VirtualDocument instance.
	 * @param {ReadonlyArray<object>} tokens Lexical tokens from tokenizeHtml().
	 * @returns {{nodes:number,ok:boolean,title:string}} Tree summary.
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
		support.applyHtmlAttributes(element, token.attributes);
		const parent = support.htmlInsertionParent(state, token.name);
		if (!canonical && element.parentNode !== parent) {
			parent.appendChild(element);
		}
		if (!token.selfClosing && !support.VOID_TAGS.has(token.name)) {
			state.stack.push(element);
		}
	}

	/** Pops through a matching open element while tolerating unmatched closes. */
	function closeElement(state, tagName) {
		for (let index = state.stack.length - 1; index > 0; index -= 1) {
			if (state.stack[index].localName === tagName) {
				state.stack.length = index;
				return;
			}
		}
	}

	/** Appends exact text; CSS is interpreted only in the executor's style engine. */
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

	return { buildHtmlTree };
});