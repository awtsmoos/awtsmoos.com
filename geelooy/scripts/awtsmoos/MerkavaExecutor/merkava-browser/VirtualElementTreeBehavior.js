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

	/** Appends a child or drains a document fragment into this element. */
	function appendChild(child) {
		if (child.nodeType === 11) {
			while (child.firstChild) this.appendChild(child.firstChild);
			return child;
		}
		if (child.parentNode) child.parentNode.removeChild(child);
		child.parentNode = this;
		this.children.push(child);
		this.childNodes = this.children;
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
		this.children.splice(index, 0, child);
		this.childNodes = this.children;
		this.__notify("childList", { addedNodes: [child.__handle?.() || {}], removedNodes: [] });
		return child;
	}

	/** Removes one direct child and detaches its parent pointer. */
	function removeChild(child) {
		const index = this.children.indexOf(child);
		if (index < 0) throw new Error("Child not found");
		this.children.splice(index, 1);
		this.childNodes = this.children;
		child.parentNode = null;
		this.__notify("childList", { addedNodes: [], removedNodes: [child.__handle?.() || {}] });
		return child;
	}

	function replaceChild(newChild, oldChild) {
		this.insertBefore(newChild, oldChild);
		this.removeChild(oldChild);
		return oldChild;
	}

	function replaceChildren(...nodes) {
		while (this.firstChild) this.removeChild(this.firstChild);
		for (const node of nodes) this.appendChild(this.__coerceNode(node));
	}

	return { installVirtualElementTreeBehavior };
});
