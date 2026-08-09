//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualWindowMedia.js"),
			require("./VirtualDeterministicCrypto.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualWindowPlatform = factory(
			root.Merkava, root.Merkava
		).VirtualWindowPlatform;
	}
})(typeof self !== "undefined" ? self : this, function(mediaMod, cryptoMod) {
	const installVirtualWindowMedia = mediaMod.installVirtualWindowMedia;
	const VirtualDeterministicCrypto = cryptoMod.VirtualDeterministicCrypto;

	/**
	 * Installs deterministic platform services onto one virtual window. The Awtsmoos
	 * creates observer, clone, URL, picker, and crypto law anew; Awtsmoos.com keeps
	 * all host authority outside the synthetic browser.
	 */
	class VirtualWindowPlatform {
		constructor(windowObject, options = {}) {
			this.window = windowObject;
			this.options = options;
			this.install();
		}

		install() {
			const windowObject = this.window;
			windowObject.URL = URL;
			windowObject.URLSearchParams = URLSearchParams;
			windowObject.structuredClone = cloneValue;
			windowObject.queueMicrotask = callback => Promise.resolve().then(callback);
			windowObject.crypto = new VirtualDeterministicCrypto(this.options.seed);
			installVirtualWindowMedia(windowObject);
			const Observer = createMutationObserver(windowObject.document);
			windowObject.MutationObserver = Observer;
			windowObject.ResizeObserver = Observer;
			windowObject.IntersectionObserver = Observer;
			windowObject.showDirectoryPicker = async () => directoryHandle();
			windowObject.showOpenFilePicker = async () => [];
		}
	}

	function cloneValue(value) {
		if (globalThis.structuredClone) return globalThis.structuredClone(value);
		return JSON.parse(JSON.stringify(value));
	}

	function directoryHandle() {
		return { kind: "directory", name: "virtual-root", async *values() {} };
	}

	function createMutationObserver(documentObject) {
		return class MutationObserver {
			constructor(callback) { this.callback = callback; this.records = []; }
			observe(target, options = {}) {
				this.target = target;
				this.options = options;
				documentObject.__registerMutationObserver(this);
			}
			disconnect() { documentObject.__unregisterMutationObserver(this); }
			takeRecords() {
				const records = this.records.slice();
				this.records.length = 0;
				return records;
			}
			__enqueue(record) {
				this.records.push(record);
				this.callback?.([record], this);
			}
		};
	}

	return { VirtualWindowPlatform };
});
