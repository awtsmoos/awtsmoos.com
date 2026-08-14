//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualOffscreenCanvas.js"), require("./VirtualWorker.js"),
			require("./VirtualPath2D.js"), require("./VirtualAudioDevices.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.installVirtualWindowMedia = factory(
			root.Merkava, root.Merkava, root.Merkava, root.Merkava
		).installVirtualWindowMedia;
	}
})(typeof self !== "undefined" ? self : this, function(canvasMod, workerMod, pathMod, audioMod) {
	const VirtualOffscreenCanvas = canvasMod.VirtualOffscreenCanvas;
	const VirtualImageData = canvasMod.VirtualImageData;
	const VirtualImageBitmap = canvasMod.VirtualImageBitmap;
	const VirtualWorker = workerMod.VirtualWorker;
	const VirtualPath2D = pathMod.VirtualPath2D;

	/**
	 * Installs deterministic canvas, worker, image, and file garments. The Awtsmoos
	 * creates every simulated device anew; Awtsmoos.com keeps host APIs outside the
	 * guest and exposes only bounded virtual classes.
	 */
	function installVirtualWindowMedia(windowObject) {
		windowObject.Blob = globalThis.Blob || BasicBlob;
		windowObject.File = createFileClass(windowObject.Blob);
		windowObject.FormData = BasicFormData;
		windowObject.Image = createImageClass(windowObject);
		windowObject.ImageData = VirtualImageData;
		windowObject.ImageBitmap = VirtualImageBitmap;
		windowObject.OffscreenCanvas = createCanvasClass(windowObject);
		windowObject.Path2D = VirtualPath2D;
		windowObject.Worker = createWorkerClass(windowObject);
		audioMod.installVirtualAudioDevices(windowObject);
	}

	class BasicBlob {
		constructor(parts = [], options = {}) {
			this.parts = parts;
			this.type = options.type || "";
			this.size = parts.join("").length;
		}
	}

	class BasicFormData {
		constructor() { this.items = []; }
		append(name, value) { this.items.push([name, value]); }
	}

	function createFileClass(BlobClass) {
		return class File extends BlobClass {
			constructor(parts, name, options = {}) { super(parts, options); this.name = name; }
		};
	}

	function createCanvasClass(windowObject) {
		return class OffscreenCanvas extends VirtualOffscreenCanvas {
			constructor(width, height) {
				super(width, height, windowObject.document, windowObject.document.textureArena);
			}
		};
	}

	function createWorkerClass(windowObject) {
		return class Worker extends VirtualWorker {
			constructor(scriptUrl, options = {}) {
				super(scriptUrl, options, workerHost(windowObject));
			}
		};
	}

	function workerHost(windowObject) {
		return {
			Blob: windowObject.Blob, OffscreenCanvas: windowObject.OffscreenCanvas,
			Path2D: windowObject.Path2D, URL: windowObject.URL, console: windowObject.console,
			clearInterval: windowObject.clearInterval.bind(windowObject),
			clearTimeout: windowObject.clearTimeout.bind(windowObject), fetch: windowObject.fetch,
			files: windowObject.files, navigator: windowObject.navigator,
			setInterval: windowObject.setInterval.bind(windowObject),
			setTimeout: windowObject.setTimeout.bind(windowObject)
		};
	}

	function createImageClass(windowObject) {
		return class Image {
			constructor(width = 0, height = 0) {
				this.width = width; this.height = height; this.complete = false;
				this.onload = null; this.onerror = null; this.__src = "";
			}
			set src(value) {
				this.__src = String(value || "");
				this.complete = true;
				windowObject.setTimeout(() => this.onload?.(new windowObject.Event("load")), 0);
			}
			get src() { return this.__src; }
			decode() { return Promise.resolve(); }
			addEventListener(type, handler) {
				if (type === "load") this.onload = handler;
				if (type === "error") this.onerror = handler;
			}
			removeEventListener() {}
		};
	}

	return { installVirtualWindowMedia };
});
