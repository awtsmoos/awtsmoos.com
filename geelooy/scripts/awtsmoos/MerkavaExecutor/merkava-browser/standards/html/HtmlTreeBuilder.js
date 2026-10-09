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
	 * Title text and node count are tracked during the single build pass —
	 * no post-build querySelector/count walks.
	 *
	 * @param {object} document Executor-owned VirtualDocument instance.
	 * @param {ReadonlyArray<object>} tokens Token stream from tokenizeHtml().
	 * @returns {{nodes:number,ok:boolean,title:string}} Tree-construction summary.
	 */
	function buildHtmlTree(document, tokens) {
		const state = createTreeState(document);
		for (const token of tokens) {
			consumeToken(state, token);
		}
		return finishTreeState(state);
	}

	/**
	 * Streaming build: tokenizes source and constructs the tree in one pass.
	 * No token array is materialized. Falls back to tokenizeHtml when the
	 * tokenizer lacks streamHtmlTokens.
	 *
	 * @param {object} document Executor-owned VirtualDocument instance.
	 * @param {string} source Raw HTML source.
	 * @param {object} tokenizer Module exposing streamHtmlTokens/tokenizeHtml.
	 * @returns {{nodes:number,ok:boolean,title:string,tokens:number}} Summary.
	 */
	function buildHtmlTreeStreaming(document, source, tokenizer) {
		const state = createTreeState(document);
		let tokenCount = 0;
		if (tokenizer && typeof tokenizer.streamHtmlTokens === "function") {
			tokenCount = tokenizer.streamHtmlTokens(source, token => consumeToken(state, token));
		} else {
			const tokens = tokenizer.tokenizeHtml(source);
			tokenCount = tokens.length;
			for (const token of tokens) {
				consumeToken(state, token);
			}
		}
		const result = finishTreeState(state);
		result.tokens = tokenCount;
		return result;
	}

	function createTreeState(document) {
		document.head.replaceChildren();
		document.body.replaceChildren();
		// B"H (parse fast path): suppress per-mutation journal/Date.now/handle
		// overhead while the initial tree is built; the first post-parse layout
		// covers everything. Cleared in finishTreeState.
		document.__suppressMutations = true;
		return {
			document,
			nodeCount: 3, // documentElement + canonical head + body
			stack: [document.documentElement],
			titleElement: null,
			titleText: ""
		};
	}

	function finishTreeState(state) {
		support.applyHtmlDefaultDisplay(state.document.body);
		state.document.__suppressMutations = false;
		return {
			nodes: state.nodeCount,
			ok: true,
			title: state.titleText
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
		if (!canonical) {
			state.nodeCount += 1;
			if (element.parentNode !== parent) {
				parent.appendChild(element);
			}
			if (token.name === "title" && state.titleElement === null) {
				state.titleElement = element;
			}
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
		state.nodeCount += 1;
		if (parent === state.titleElement) {
			state.titleText += text;
		}
		if (parent.localName === "style") {
			state.document.cssEngine.parseStyleSheet(text);
		}
	}

	/**
	 * Applies only the first occurrence of each HTML attribute name.
	 * Null-prototype object instead of Set (one less allocation per element).
	 */
	function applyAttributes(element, attributes) {
		const seen = Object.create(null);
		for (const attribute of attributes || []) {
			if (seen[attribute.name]) {
				continue;
			}
			seen[attribute.name] = 1;
			element.setAttribute(attribute.name, attribute.value);
		}
	}

	return { buildHtmlTree, buildHtmlTreeStreaming };
});
