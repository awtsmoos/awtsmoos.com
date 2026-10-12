//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	const VOID_TAGS = new Set([
		"area", "base", "br", "col", "embed", "hr", "img", "input",
		"link", "meta", "param", "source", "track", "wbr"
	]);
	const HEAD_TAGS = new Set(["base", "link", "meta", "script", "style", "title"]);
	const INLINE_TAGS = new Set(["a", "b", "em", "i", "label", "small", "span", "strong"]);

	/** Returns the canonical document element for structural HTML tags. */
	function canonicalHtmlElement(document, tagName) {
		if (tagName === "html") return document.documentElement;
		if (tagName === "head") return document.head;
		if (tagName === "body") return document.body;
		return null;
	}

	/** Returns the insertion parent for one start tag. */
	function htmlInsertionParent(state, tagName) {
		if (tagName === "html" || tagName === "head" || tagName === "body") {
			return state.document.documentElement;
		}
		if (HEAD_TAGS.has(tagName)) {
			return state.document.head;
		}
		const parent = currentHtmlParent(state);
		return parent === state.document.documentElement || parent === state.document.head
			? state.document.body
			: parent;
	}

	/** Returns the currently open element or the body fallback. */
	function currentHtmlParent(state) {
		return state.stack[state.stack.length - 1] || state.document.body;
	}

	/** Counts materialized nodes recursively for deterministic diagnostics. */
	function countHtmlNodes(node) {
		return 1 + (node.children || []).reduce((total, child) => {
			return total + countHtmlNodes(child);
		}, 0);
	}

	/** Applies minimal user-agent display defaults after author CSS is parsed. */
	function applyHtmlDefaultDisplay(node) {
		for (const child of node.children || []) {
			const inlineDisplay = child.style.getPropertyValue?.("display");
			const computedDisplay = child.ownerDocument?.cssEngine?.compute(child)?.display;
			if (!inlineDisplay && !computedDisplay) {
				child.style.setProperty?.("display", defaultHtmlDisplay(child.localName));
			}
			applyHtmlDefaultDisplay(child);
		}
	}

	/** Returns the foundational display default for one HTML tag. */
	function defaultHtmlDisplay(tagName) {
		if (INLINE_TAGS.has(tagName) || tagName === "#text") {
			return "inline";
		}
		if (HEAD_TAGS.has(tagName)) {
			return "none";
		}
		return "block";
	}

	return {
		VOID_TAGS,
		applyHtmlDefaultDisplay,
		canonicalHtmlElement,
		countHtmlNodes,
		currentHtmlParent,
		htmlInsertionParent
	};
});
