//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./standards/css/CssSelectorMatcher.js"),
			require("./standards/css/CssSelectorList.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava, root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(selectors, selectorList) {
	const { splitSelectorList, tokenizeSelectorSequence } = selectorList || {};
	/** Installs standards-selector-backed DOM query methods on VirtualElement. */
	function installVirtualElementQueryBehavior(prototype) {
		prototype.matches = matches;
		prototype.closest = closest;
		prototype.querySelector = querySelector;
		prototype.querySelectorAll = querySelectorAll;
	}

	/** Tests this element with the executor-owned CSS selector matcher. */
	function matches(selector) {
		return selectors.matchesCssSelector(this, String(selector || ""));
	}

	/** Finds the nearest ancestor-or-self matching one selector. */
	function closest(selector) {
		for (let current = this; current; current = current.parentNode || current.host) {
			if (current.nodeType === 1 && selectors.matchesCssSelector(current, selector)) {
				return current;
			}
		}
		return null;
	}

	/**
	 * B"H (2026-10-09): selector strings are parsed ONCE per query (was: once
	 * per node) via a per-document parse cache. #id, bare tag, and * take
	 * dedicated fast paths that skip the matcher entirely.
	 */
	function tokenizedFor(element, selector) {
		const doc = element.ownerDocument;
		const cache = doc && doc.__selectorCache;
		if (!cache) return splitSelectorList(selector).map(tokenizeSelectorSequence);
		let tokens = cache.get(selector);
		if (!tokens) {
			tokens = splitSelectorList(selector).map(tokenizeSelectorSequence);
			if (cache.size >= 256) cache.delete(cache.keys().next().value);
			cache.set(selector, tokens);
		}
		return tokens;
	}

	/** B"H: strict-descendant scope check through shadow hosts. */
	function scopeContains(scope, node) {
		for (let n = node; n; n = n.parentNode || n.host || null) {
			if (n === scope) return true;
		}
		return false;
	}

	/** B"H: O(1) #id lookup inside a scope; null when it must walk instead. */
	function findByIdFast(scope, id) {
		const doc = scope.ownerDocument;
		const hit = doc && doc.__idMap && doc.__idMap.get(id);
		if (hit && hit !== scope && scopeContains(scope, hit)) return hit;
		return null;
	}

	function querySelector(selector) {
		const all = querySelectorAll.call(this, selector);
		return all[0] || null;
	}

	function querySelectorAll(selector) {
		const sel = String(selector || "");
		if (!sel) return [];
		// B"H fast path: #id via the document index.
		const idMatch = /^#([\w-]+)$/.exec(sel);
		if (idMatch) {
			const found = findByIdFast(this, idMatch[1]);
			if (found) return [found];
		} else if (/^[a-zA-Z][\w-]*$/.test(sel)) {
			// B"H fast path: bare tag name, no matcher needed.
			const tag = sel.toLowerCase();
			const output = [];
			for (const child of this.children || []) collectByTag(child, tag, output);
			return output;
		} else if (sel === "*") {
			// B"H fast path: universal selector.
			const output = [];
			for (const child of this.children || []) collectAllElements(child, output);
			return output;
		}
		// B"H (Chrome Jun-2026 selector port): single-class fast path. The
		// general compiled-matcher path builds an element key signature per
		// node (elementKeys) plus 3+ function calls per node; for `.cls` the
		// whole match is one class-words membership test. Same derivation
		// the matcher uses (className, attributes.class fallback).
		const classMatch = /^\.([\w-]+)$/.exec(sel);
		if (classMatch) {
			const output = [];
			for (const child of this.children || []) collectByClass(child, classMatch[1], output);
			return output;
		}
		// B"H: general path compiles once (parse-once compounds + bloom
		// pre-check via the matcher's global bounded cache), then walks
		// with the compiled matcher. Upgrades the tokenized path: compounds
		// are no longer re-parsed per node.
		const compiled = selectors.compileSelectorList(sel);
		const output = [];
		for (const child of this.children || []) {
			collectCompiled(child, compiled, output);
		}
		return output;
	}

	/** Traverses descendants in tree order using compiled selectors. */
	function collectCompiled(node, compiled, output) {
		if (node.nodeType === 1 && selectors.matchesCompiledSelectorList(node, compiled)) {
			output.push(node);
		}
		for (const child of node.children || []) {
			collectCompiled(child, compiled, output);
		}
		if (node.shadowRoot) {
			collectCompiled(node.shadowRoot, compiled, output);
		}
	}

	function collectByTag(node, tag, output) {
		if (node.nodeType === 1 && node.localName === tag) output.push(node);
		for (const child of node.children || []) collectByTag(child, tag, output);
		if (node.shadowRoot) collectByTag(node.shadowRoot, tag, output);
	}

	function collectAllElements(node, output) {
		if (node.nodeType === 1) output.push(node);
		for (const child of node.children || []) collectAllElements(child, output);
		if (node.shadowRoot) collectAllElements(node.shadowRoot, output);
	}

	/** B"H: class-words derivation identical to the compiled matcher's. */
	function classWordsOf(node) {
		let classAttr = node.className;
		if (classAttr == null) classAttr = (node.attributes && node.attributes.class) || "";
		if (!classAttr) return null;
		return String(classAttr).split(/\s+/);
	}

	function collectByClass(node, cls, output) {
		if (node.nodeType === 1 && node.classList) {
			const w = classWordsOf(node);
			if (w && w.indexOf(cls) >= 0) output.push(node);
		}
		for (const child of node.children || []) collectByClass(child, cls, output);
		if (node.shadowRoot) collectByClass(node.shadowRoot, cls, output);
	}

	return { installVirtualElementQueryBehavior };
});
