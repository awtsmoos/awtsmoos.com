//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory({
			...require("./VirtualStyleDeclaration.js"),
			...require("./VirtualClassList.js"),
			...require("./VirtualElementProperties.js"),
			...require("./VirtualElementTreeBehavior.js"),
			...require("./VirtualElementCloneBehavior.js"),
			...require("./VirtualElementAttributeBehavior.js"),
			...require("./VirtualElementEventSupport.js"),
			...require("./VirtualElementEventBehavior.js"),
			...require("./VirtualElementQueryBehavior.js"),
			...require("./VirtualElementContentBehavior.js")
		});
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(modules) {
	/**
	 * Core executor-owned DOM element vessel.
	 *
	 * The constructor stores only intrinsic node state. Standards-facing behavior
	 * is installed from small repository modules so DOM evolution stays testable,
	 * readable, and below the source-law line cap without external libraries.
	 */
	class VirtualElement {
		constructor(tagName = "div", ownerDocument = null) {
			this.tagName = String(tagName).toUpperCase();
			this.nodeName = this.tagName;
			this.localName = String(tagName).toLowerCase();
			this.nodeType = nodeTypeFor(this.tagName);
			this.ownerDocument = ownerDocument;
			this.__nodeId = ownerDocument ? ownerDocument.__nextNodeId++ : 0;
			this.parentNode = null;
			this.children = [];
			this.childNodes = this.children;
			this.attributes = {};
			this.listeners = {};
			this.style = new modules.VirtualStyleDeclaration();
			this.dataset = {};
			this._textContent = "";
			this.value = "";
			this.checked = false;
			this.selected = false;
			this.id = "";
			this.className = "";
			this.name = "";
			this.type = "";
			this.tabIndex = -1;
			this.hidden = false;
			this.disabled = false;
			this.shadowRoot = null;
			this.host = null;
			this.mode = null;
			this.__width = this.localName === "canvas" ? 300 : 0;
			this.__height = this.localName === "canvas" ? 150 : 0;
			if (this.localName === "canvas") {
				this.attributes.width = "300";
				this.attributes.height = "150";
			}
			this.classList = new modules.VirtualClassList(this);
			if (this.localName === "template") {
				this.__templateContent = this.__newFragment();
			}
		}
	}

	/** Returns the DOM node type represented by one synthetic tag name. */
	function nodeTypeFor(tagName) {
		if (tagName === "#TEXT") return 3;
		if (tagName === "#FRAGMENT") return 11;
		return 1;
	}

	modules.installVirtualElementProperties(VirtualElement.prototype);
	modules.installVirtualElementTreeBehavior(VirtualElement.prototype);
	modules.installVirtualElementCloneBehavior(VirtualElement.prototype);
	modules.installVirtualElementAttributeBehavior(VirtualElement.prototype);
	modules.installVirtualElementEventSupport(VirtualElement.prototype);
	modules.installVirtualElementEventBehavior(VirtualElement.prototype);
	modules.installVirtualElementQueryBehavior(VirtualElement.prototype);
	modules.installVirtualElementContentBehavior(VirtualElement.prototype);

	return { VirtualElement };
});
