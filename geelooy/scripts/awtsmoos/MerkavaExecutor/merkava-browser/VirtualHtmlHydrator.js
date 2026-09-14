//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./standards/html/HtmlTokenizer.js"),
			require("./standards/html/HtmlTreeBuilder.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava, root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(tokenizer, treeBuilder) {
	/**
	 * Executor-owned HTML hydration coordinator.
	 *
	 * Source text is tokenized and tree-built entirely by Merkava modules. The
	 * host browser, DOMParser, innerHTML parser, native HTML library, and external
	 * parser packages are never consulted. This class deliberately stays tiny so
	 * tokenizer and tree-construction conformance can evolve independently.
	 */
	class VirtualHtmlHydrator {
		/**
		 * Replaces document content with a fresh tree parsed from source HTML.
		 *
		 * @param {object} document Executor-owned VirtualDocument receiving nodes.
		 * @param {string} source Raw HTML source to parse.
		 * @param {object} options Reserved parser controls for future insertion modes.
		 * @returns {{nodes:number,ok:boolean,title:string,tokens:number}} Parse summary.
		 */
		hydrate(document, source, options = {}) {
			void options;
			const tokens = tokenizer.tokenizeHtml(source);
			const result = treeBuilder.buildHtmlTree(document, tokens);
			return Object.freeze({
				...result,
				tokens: tokens.length
			});
		}
	}

	return { VirtualHtmlHydrator };
});
