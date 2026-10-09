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
	 * B"H (2026-10-09): extreme DOM optimization pass.
	 * The constructor stores only cheap intrinsic state. Expensive sub-objects
	 * (style declaration, class list, attribute map, listener map, dataset)
	 * and the children array are created LAZILY on first use: a bare div is
	 * now ~20 own fields with zero sub-allocations instead of 30+ fields and
	 * 6 child objects. See installLazyDomState below.
	 *
	 * Standards-facing behavior is installed from small repository modules so
	 * DOM evolution stays testable, readable, and below the source-law line
	 * cap without external libraries.
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
			// B"H: children/childNodes/attributes/listeners/style/dataset/classList/id
			// are lazy prototype accessors now (installLazyDomState). No eager
			// allocation: a fresh node costs only the fields below.
			this._textContent = "";
			this.value = "";
			this.checked = false;
			this.selected = false;
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

	/**
	 * B"H: shared frozen empty-children singleton. Every childless node
	 * aliases this instead of owning a private []. The tree behavior swaps
	 * in a real array on first mutation via __mutableChildren().
	 */
	const EMPTY_CHILDREN = Object.freeze([]);

	/**
	 * B"H: keeps the document id index in sync. Called by the id setter.
	 * Duplicate ids map to the most recently assigned node (invalid HTML
	 * edge case; tree-order fallback still works through querySelector).
	 */
	function setElementId(element, value) {
		const next = String(value ?? "");
		const doc = element.ownerDocument;
		const prev = element._id || "";
		if (prev === next) {
			element._id = next;
			return;
		}
		if (doc && doc.__idMap) {
			if (prev) doc.__idMap.delete(prev);
			if (next) doc.__idMap.set(next, element);
		}
		element._id = next;
		// B"H: id changes can re-match selectors with layout properties.
		if (prev !== next && doc && doc.__layoutScheduler) doc.__layoutScheduler.noteIdChange();
	}

	/**
	 * B"H: lazy DOM state. Getters allocate backing stores on first touch and
	 * cache them, so repeated access keeps identity (el.style === el.style).
	 * children/childNodes alias a shared frozen empty array until mutated.
	 */
	function installLazyDomState(prototype, mods) {
		Object.defineProperties(prototype, {
			style: {
				configurable: true,
				get() {
					const s = this._style || (this._style = new mods.VirtualStyleDeclaration());
					// B"H: layout thrashing defense — style writes notify the
					// document scheduler. Re-linked on every access so pooled
					// / recycled nodes can never notify a stale owner.
					s.__owner = this;
					return s;
				}
			},
			classList: {
				configurable: true,
				get() { return this._classList || (this._classList = new mods.VirtualClassList(this)); }
			},
			attributes: {
				configurable: true,
				get() { return this._attributes || (this._attributes = {}); }
			},
			listeners: {
				configurable: true,
				get() { return this._listeners || (this._listeners = {}); }
			},
			dataset: {
				configurable: true,
				get() { return this._dataset || (this._dataset = {}); }
			},
			children: {
				configurable: true,
				get() { return this._children || EMPTY_CHILDREN; },
				set(value) { this._children = value && value.length ? value : undefined; }
			},
			childNodes: {
				configurable: true,
				get() { return this._children || EMPTY_CHILDREN; },
				set(value) { this._children = value && value.length ? value : undefined; }
			},
			id: {
				configurable: true,
				get() { return this._id || ""; },
				set(value) { setElementId(this, value); }
			}
		});
		/**
		 * B"H: returns the mutable children array, allocating on first use.
		 * All tree mutations go through this so the frozen shared empty
		 * array is never written to.
		 */
		prototype.__mutableChildren = function() {
			return this._children || (this._children = []);
		};
	}

	modules.installVirtualElementProperties(VirtualElement.prototype);
	modules.installVirtualElementTreeBehavior(VirtualElement.prototype);
	modules.installVirtualElementCloneBehavior(VirtualElement.prototype);
	modules.installVirtualElementAttributeBehavior(VirtualElement.prototype);
	modules.installVirtualElementEventSupport(VirtualElement.prototype);
	modules.installVirtualElementEventBehavior(VirtualElement.prototype);
	modules.installVirtualElementQueryBehavior(VirtualElement.prototype);
	modules.installVirtualElementContentBehavior(VirtualElement.prototype);
	installLazyDomState(VirtualElement.prototype, modules);

	return { VirtualElement, EMPTY_CHILDREN, setElementId };
});
