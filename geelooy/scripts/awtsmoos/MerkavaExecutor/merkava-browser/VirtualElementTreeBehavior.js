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
	/** Installs node-tree mutation and traversal behavior on VirtualElement. */
	function installVirtualElementTreeBehavior(prototype) {
		prototype.appendChild = appendChild;
		prototype.append = append;
		prototype.prepend = prepend;
		prototype.before = before;
		prototype.after = after;
		prototype.insertBefore = insertBefore;
		prototype.removeChild = removeChild;
		prototype.replaceChild = replaceChild;
		prototype.replaceChildren = replaceChildren;
	}

	/**
	 * B"H (2026-10-09): all mutations go through __mutableChildren() so the
	 * shared frozen empty-children array is never written to. childNodes is
	 * a live alias (prototype getter), so no re-sync assignments are needed.
	 */

	/** Appends a child or drains a document fragment into this element. */
	function appendChild(child) {
		if (child.nodeType === 11) {
			while (child.firstChild) this.appendChild(child.firstChild);
			return child;
		}
		if (child.parentNode) child.parentNode.removeChild(child);
		child.parentNode = this;
		this.__mutableChildren().push(child);
		this.__notify("childList", { addedNodes: [child.__handle?.() || {}], removedNodes: [] });
		return child;
	}

	function append(...nodes) {
		for (const node of nodes) this.appendChild(this.__coerceNode(node));
	}

	function prepend(...nodes) {
		for (const node of nodes.reverse()) this.insertBefore(this.__coerceNode(node), this.firstChild);
	}

	function before(...nodes) {
		if (!this.parentNode) return;
		for (const node of nodes) this.parentNode.insertBefore(this.__coerceNode(node), this);
	}

	function after(...nodes) {
		if (!this.parentNode) return;
		const reference = this.nextSibling;
		for (const node of nodes) this.parentNode.insertBefore(this.__coerceNode(node), reference);
	}

	/** Inserts one child before an existing reference node. */
	function insertBefore(child, beforeNode) {
		if (!beforeNode) return this.appendChild(child);
		const index = this.children.indexOf(beforeNode);
		if (index < 0) throw new Error("Reference node not found");
		if (child.parentNode) child.parentNode.removeChild(child);
		child.parentNode = this;
		this.__mutableChildren().splice(index, 0, child);
		this.__notify("childList", { addedNodes: [child.__handle?.() || {}], removedNodes: [] });
		return child;
	}

	/** Removes one direct child and detaches its parent pointer. */
	function removeChild(child) {
		const index = this.children.indexOf(child);
		if (index < 0) throw new Error("Child not found");
		this.__mutableChildren().splice(index, 1);
		child.parentNode = null;
		this.__notify("childList", { addedNodes: [], removedNodes: [child.__handle?.() || {}] });
		return child;
	}

	function replaceChild(newChild, oldChild) {
		this.insertBefore(newChild, oldChild);
		this.removeChild(oldChild);
		return oldChild;
	}

	/**
	 * B"H (2026-10-09): discarded subtrees are recycled into the document
	 * node pool instead of dropped for GC. One childList notification carries
	 * all removed nodes (was: one notification per removed child).
	 */
	function replaceChildren(...nodes) {
		const old = this._children;
		if (old && old.length) {
			const doc = this.ownerDocument;
			const removedNodes = [];
			for (const child of old) {
				child.parentNode = null;
				removedNodes.push(child.__handle?.() || {});
				if (doc) doc.__recycleNode(child);
			}
			this._children = undefined;
			this.__notify("childList", { addedNodes: [], removedNodes });
		}
		for (const node of nodes) this.appendChild(this.__coerceNode(node));
	}

	return { installVirtualElementTreeBehavior };
});
