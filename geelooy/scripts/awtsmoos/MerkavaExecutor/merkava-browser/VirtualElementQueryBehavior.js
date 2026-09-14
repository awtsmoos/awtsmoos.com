//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./standards/css/CssSelectorMatcher.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(selectors) {
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

	function querySelector(selector) {
		return this.querySelectorAll(selector)[0] || null;
	}

	/** Traverses descendants in tree order using the shared standards matcher. */
	function querySelectorAll(selector) {
		const output = [];
		for (const child of this.children || []) {
			collectMatches(child, selector, output);
		}
		return output;
	}

	function collectMatches(node, selector, output) {
		if (node.nodeType === 1 && selectors.matchesCssSelector(node, selector)) {
			output.push(node);
		}
		for (const child of node.children || []) {
			collectMatches(child, selector, output);
		}
		if (node.shadowRoot) {
			collectMatches(node.shadowRoot, selector, output);
		}
	}

	return { installVirtualElementQueryBehavior };
});
