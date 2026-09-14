//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualHtmlSerializer.js"),
			require("./VirtualCanvas2DContext.js"),
			require("./VirtualWebGLContext.js"),
			require("./VirtualElementSupport.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(htmlModule, canvasModule, webglModule, support) {
	/** Installs HTML serialization, canvas contexts, and debug snapshots. */
	function installVirtualElementContentBehavior(prototype) {
		Object.defineProperties(prototype, {
			innerHTML: {
				get: innerHtml,
				set: setInnerHtml
			},
			outerHTML: {
				get: outerHtml
			}
		});
		prototype.getContext = getContext;
		prototype.toJSON = toJSON;
	}

	function serializer() {
		return new htmlModule.VirtualHtmlSerializer();
	}

	function innerHtml() {
		return serializer().serializeChildren(this);
	}

	function setInnerHtml(value) {
		serializer().parseInto(this, value);
		this.__notify("childList", { html: String(value ?? "") });
	}

	function outerHtml() {
		return serializer().serialize(this);
	}

	/** Returns executor-owned Canvas2D or WebGL contexts for canvas elements. */
	function getContext(kind) {
		const type = String(kind || "").toLowerCase();
		if (this.tagName !== "CANVAS") return null;
		this.__syncCanvasTextureSize();
		if (type === "2d") {
			this.__canvas2dContext ||= new canvasModule.VirtualCanvas2DContext(this, this.ownerDocument?.textureArena);
			return this.__canvas2dContext;
		}
		if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") {
			this.__webglContext ||= new webglModule.VirtualWebGLContext(this, this.ownerDocument?.textureArena);
			return this.__webglContext;
		}
		return null;
	}

	/** Returns a deterministic executor snapshot for tests and DevTools. */
	function toJSON() {
		return {
			...this.__handle(),
			attributes: this.attributes,
			checked: this.checked,
			children: this.children.map(support.virtualElementChildSnapshot),
			dataset: this.dataset,
			height: this.height,
			name: this.name,
			nodeType: this.nodeType,
			selected: this.selected,
			shadowRoot: this.shadowRoot?.toJSON?.() || null,
			style: this.style.toJSON(),
			type: this.type,
			webgl: this.__webglContext?.snapshot?.() || null,
			width: this.width
		};
	}

	return { installVirtualElementContentBehavior };
});
