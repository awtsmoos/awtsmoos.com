//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	/**
	 * Describes and counts virtual DOM subtrees for incremental compilation. The
	 * Awtsmoos creates each node relation anew; Awtsmoos.com keeps these traversals
	 * separate so hydration logic remains small and directly inspectable.
	 */
	function countDomNodes(node) {
		if (!node) {
			return 0;
		}
		return 1 + (node.children || []).reduce((total, child) => {
			return total + countDomNodes(child);
		}, 0);
	}

	function collectDomScripts(document) {
		const head = document.head.querySelectorAll?.("script") || [];
		const body = document.body.querySelectorAll?.("script") || [];
		return head.concat(body);
	}

	function describeDomNode(node) {
		if (!node) {
			return "null";
		}
		const tag = node.localName || node.tagName || "node";
		const identifier = node.id ? `#${node.id}` : "";
		const classes = node.className
			? `.${String(node.className).trim().replace(/\s+/g, ".")}`
			: "";
		return `${tag}${identifier}${classes}`;
	}

	return { collectDomScripts, countDomNodes, describeDomNode };
});
