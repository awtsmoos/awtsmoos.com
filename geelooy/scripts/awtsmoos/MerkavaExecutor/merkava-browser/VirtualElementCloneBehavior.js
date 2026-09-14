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
	/** Installs cloning, containment, root, and shadow-root behavior. */
	function installVirtualElementCloneBehavior(prototype) {
		prototype.attachShadow = attachShadow;
		prototype.cloneNode = cloneNode;
		prototype.contains = contains;
		prototype.getRootNode = getRootNode;
	}

	/** Creates one executor-owned shadow-root fragment. */
	function attachShadow(options = {}) {
		if (this.shadowRoot) {
			throw new Error("Shadow root already attached");
		}
		const root = this.__newFragment();
		root.mode = options.mode || "open";
		root.host = this;
		this.shadowRoot = root;
		this.__notify("shadowRoot", { mode: root.mode });
		return root;
	}

	/** Clones element state and optionally the complete descendant subtree. */
	function cloneNode(deep = false) {
		const copy = new this.constructor(this.localName, this.ownerDocument);
		for (const [name, value] of Object.entries(this.attributes)) {
			copy.setAttribute(name, value);
		}
		copy._textContent = this._textContent;
		copy.value = this.value;
		copy.checked = this.checked;
		copy.selected = this.selected;
		copy.width = this.width;
		copy.height = this.height;
		if (deep) {
			for (const child of this.children) copy.appendChild(child.cloneNode(true));
		}
		if (deep && this.localName === "template") {
			for (const child of this.content.children) copy.content.appendChild(child.cloneNode(true));
		}
		return copy;
	}

	function contains(node) {
		for (let current = node; current; current = current.parentNode) {
			if (current === this) return true;
		}
		return false;
	}

	function getRootNode() {
		let current = this;
		while (current.parentNode || current.host) {
			current = current.parentNode || current.host;
		}
		return current.ownerDocument || current;
	}

	return { installVirtualElementCloneBehavior };
});
