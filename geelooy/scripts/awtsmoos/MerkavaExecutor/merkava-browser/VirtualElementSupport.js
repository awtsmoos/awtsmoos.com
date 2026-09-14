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
	/** Returns a stable executor-facing description of one node. */
	function virtualElementHandle(node) {
		return {
			className: node?.className || "",
			height: node?.height || 0,
			id: node?.id || "",
			nodeId: node?.__nodeId || null,
			tagName: node?.tagName || node?.nodeName || node?.constructor?.name || "FOREIGN",
			textContent: node?.textContent || "",
			value: node?.value || "",
			width: node?.width || 0
		};
	}

	/** Serializes a child without assuming it is a VirtualElement instance. */
	function virtualElementChildSnapshot(child) {
		if (child && typeof child.toJSON === "function") {
			return child.toJSON();
		}
		return {
			className: child?.className || "",
			id: child?.id || "",
			nodeType: child?.nodeType || 1,
			tagName: child?.tagName || child?.nodeName || child?.constructor?.name || "FOREIGN",
			textContent: child?.textContent || ""
		};
	}

	/** Converts dimensions to a finite non-negative integer. */
	function virtualElementPositiveInteger(value, fallback) {
		const number = Math.floor(Number(value));
		return Number.isFinite(number) && number >= 0 ? number : fallback;
	}

	/** Converts strings and primitives into executor-owned text nodes. */
	function virtualElementCoerceNode(element, node) {
		if (node && typeof node === "object" && node.nodeType) {
			return node;
		}
		return element.ownerDocument.createTextNode(String(node ?? ""));
	}

	return {
		virtualElementChildSnapshot,
		virtualElementCoerceNode,
		virtualElementHandle,
		virtualElementPositiveInteger
	};
});
