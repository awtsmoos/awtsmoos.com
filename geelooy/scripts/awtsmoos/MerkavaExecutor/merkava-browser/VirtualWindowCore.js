//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualDocument.js"), require("./VirtualStorage.js"),
			require("./VirtualConsole.js"), require("./VirtualFetch.js"),
			require("./VirtualEvents.js"), require("./VirtualMouse.js"),
			require("./VirtualKeyboard.js"), require("./VirtualInteractions.js"),
			require("./RuntimeProbe.js"), require("./VirtualWebGLBoxRenderer.js"),
			require("./BrowserRenderPipeline.js"), require("./VirtualWindowPlatform.js"),
			require("./VirtualWindowHelpers.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualWindowCore = factory(
			root.Merkava, root.Merkava, root.Merkava, root.Merkava,
			root.Merkava, root.Merkava, root.Merkava, root.Merkava,
			root.Merkava, root.Merkava, root.Merkava, root.Merkava,
			root.Merkava
		).VirtualWindowCore;
	}
})(typeof self !== "undefined" ? self : this, function(
	docMod, storageMod, consoleMod, fetchMod, events, mouseMod, keyboardMod,
	interactionMod, probeMod, boxRendererMod, pipelineMod, platformMod, helperMod
) {
	/**
	 * Creates the immutable foundations of one virtual browser sky. The Awtsmoos
	 * creates document, network, input, and GPU ledger anew; Awtsmoos.com lets only
	 * an explicit host transport carry unresolved fetches beyond the virtual world.
	 */
	class VirtualWindowCore {
		constructor(options = {}) {
			this.graph = options.graph || null;
			this.files = options.files || {};
			this.document = new docMod.VirtualDocument();
			this.document.defaultView = this;
			this.console = new consoleMod.VirtualConsole(this.graph);
			this.localStorage = new storageMod.VirtualStorage();
			this.sessionStorage = new storageMod.VirtualStorage();
			this.location = new URL(options.url || "http://127.0.0.1:8080/");
			this.innerWidth = Number(options.width || 1024);
			this.innerHeight = Number(options.height || 768);
			this.devicePixelRatio = Number(options.devicePixelRatio || 1);
			this.navigator = Object.freeze({
				language: "en-US",
				onLine: true,
				platform: "Merkava",
				userAgent: "MerkavaSyntheticChrome/2.0"
			});
			this.history = helperMod.makeVirtualHistory(this);
			this.performance = { now: () => Date.now() };
			this.__timers = new Map();
			this.__timerBudget = {
				callbacks: 0,
				frozen: false,
				maximumCallbacks: Number(options.maximumTimerCallbacks || 250)
			};
			this.__network = new fetchMod.VirtualFetch({
				baseUrl: this.location.href,
				files: this.files,
				graph: this.graph,
				transport: options.fetchTransport || options.networkTransport || null
			});
			this.fetch = this.__network.fetch.bind(this.__network);
			this.Event = events.VirtualEvent;
			this.CustomEvent = events.VirtualCustomEvent;
			this.KeyboardEvent = events.VirtualKeyboardEvent;
			this.MouseEvent = events.VirtualMouseEvent;
			this.InputEvent = events.VirtualInputEvent;
			new platformMod.VirtualWindowPlatform(this, options);
			this.mouse = new mouseMod.VirtualMouse(this);
			this.keyboard = new keyboardMod.VirtualKeyboard(this);
			this.interactions = new interactionMod.VirtualInteractions(this);
			this.probe = new probeMod.RuntimeProbe();
			this.webglRenderer = new boxRendererMod.VirtualWebGLBoxRenderer(
				this.document.textureArena
			);
			this.renderPipeline = new pipelineMod.BrowserRenderPipeline(this, {
				renderer: this.webglRenderer,
				viewport: {
					height: options.height || 560,
					width: options.width || 760
				}
			});
			this.renderWebGLDom = () => this.renderPipeline.render();
			this.getComputedStyle = element => helperMod.virtualComputedStyle(
				this.document,
				element
			);
			this.addStyleSheet = cssText => {
				return this.document.cssEngine.parseStyleSheet(cssText);
			};
		}
	}

	return { VirtualWindowCore };
});
