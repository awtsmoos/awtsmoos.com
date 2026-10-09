//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./VirtualElementSupport.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(support) {
	/** Installs DOM property accessors and internal helpers on VirtualElement. */
	function installVirtualElementProperties(prototype) {
		Object.defineProperties(prototype, propertyDescriptors());
		prototype.__newFragment = function() {
			const fragment = new this.constructor("#fragment", this.ownerDocument);
			fragment.host = this;
			return fragment;
		};
		prototype.__notify = function(kind, extra) {
			// B"H (2026-10-09): single allocation, no spreads. The document
			// builds the record; detached nodes (no ownerDocument) skip.
			const doc = this.ownerDocument;
			if (doc && doc.__notifyMutation) doc.__notifyMutation(kind, this, extra);
		};
		prototype.__handle = function() {
			return support.virtualElementHandle(this);
		};
		prototype.__coerceNode = function(node) {
			return support.virtualElementCoerceNode(this, node);
		};
		prototype.__syncCanvasTextureSize = function() {
			if (this.__webglCanvasTexture) {
				this.__webglCanvasTexture.width = this.width;
				this.__webglCanvasTexture.height = this.height;
			}
		};
	}

	/** Returns the standards-facing property descriptor table. */
	function propertyDescriptors() {
		return {
			childElementCount: {
				get() {
					return this.children.filter(child => child.nodeType === 1).length;
				}
			},
			/**
			 * B"H: layout thrashing defense. className/hidden/value writes
			 * can re-match selectors or change intrinsic geometry, so they
			 * notify the document scheduler (batched, never sync layout).
			 */
			className: {
				get() { return this._className || ""; },
				set(value) {
					const next = String(value ?? "");
					if (this._className === next) return;
					this._className = next;
					this.__notify("attributes", { attributeName: "class" });
				}
			},
			hidden: {
				get() { return !!this._hidden; },
				set(value) {
					const next = !!value;
					if (!!this._hidden === next) return;
					this._hidden = next;
					this.__notify("attributes", { attributeName: "hidden" });
				}
			},
			value: {
				get() { return this._value != null ? String(this._value) : ""; },
				set(value) {
					const next = String(value ?? "");
					if (this._value === next) return;
					this._value = next;
					this.__notify("attributes", { attributeName: "value" });
				}
			},
			content: {
				get() {
					if (this.localName !== "template") return undefined;
					return this.__templateContent || (this.__templateContent = this.__newFragment());
				}
			},
			firstChild: { get() { return this.children[0] || null; } },
			firstElementChild: { get() { return this.children.find(child => child.nodeType === 1) || null; } },
			height: {
				get() { return this.__height || 0; },
				set(value) {
					this.__height = support.virtualElementPositiveInteger(value, 0);
					this.attributes.height = String(this.__height);
					this.__syncCanvasTextureSize();
					this.__notify("attributes", { attributeName: "height" });
				}
			},
			innerText: {
				get() { return this.textContent; },
				set(value) { this.textContent = value; }
			},
			lastChild: { get() { return this.children[this.children.length - 1] || null; } },
			nextSibling: { get() { return sibling(this, 1); } },
			parentElement: { get() { return this.parentNode?.nodeType === 1 ? this.parentNode : null; } },
			previousSibling: { get() { return sibling(this, -1); } },
			textContent: {
				get() {
					if (this.nodeType === 3) return this._textContent;
					return this._textContent || this.children.map(child => child.textContent || "").join("");
				},
				set(value) {
					this._textContent = String(value ?? "");
					if (this.nodeType === 3) {
						// B"H: text-node edits never notified before — stale layout.
						this.__notify("characterData");
						return;
					}
					const hadChildren = this.children.length > 0;
					this.replaceChildren();
					// replaceChildren() notifies childList only when children
					// existed; a bare text assignment still changes geometry.
					if (!hadChildren) this.__notify("characterData");
				}
			},
			width: {
				get() { return this.__width || 0; },
				set(value) {
					this.__width = support.virtualElementPositiveInteger(value, 0);
					this.attributes.width = String(this.__width);
					this.__syncCanvasTextureSize();
					this.__notify("attributes", { attributeName: "width" });
				}
			}
		};
	}

	function sibling(element, offset) {
		const siblings = element.parentNode?.children || [];
		return siblings[siblings.indexOf(element) + offset] || null;
	}

	return { installVirtualElementProperties };
});
