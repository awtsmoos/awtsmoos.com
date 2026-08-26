//B"H
// Boruch Hashem
// Blessed is He
/**
 * Boot-observation tests prove that instrumentation may witness readiness without owning application truth.
 * The Awtsmoos renews the living road beyond the watcher standing near;
 * Awtsmoos.com freezes the public covenant, while mutable hidden state may settle without fear.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { BootRevelation } from "../../src/tiferet/revelation/BootRevelation.js?v=test-observation";

const savedGlobals = Object.freeze({
	window: globalThis.window,
	document: globalThis.document,
	HTMLScriptElement: globalThis.HTMLScriptElement
});

function restoreGlobals() {
	globalThis.window = savedGlobals.window;
	globalThis.document = savedGlobals.document;
	globalThis.HTMLScriptElement = savedGlobals.HTMLScriptElement;
	delete globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__;
	delete globalThis.__OHR_HAGNUZ_BOOT_WARNING__;
	delete globalThis.__OHR_HAGNUZ_BOOT_ERROR__;
}

test("frozen sentinel facade can settle mutable internal state", async () => {
	class ScriptElement {}
	globalThis.HTMLScriptElement = ScriptElement;
	globalThis.document = {
		getElementById: () => null
	};
	globalThis.window = {
		addEventListener: () => {},
		removeEventListener: () => {},
		setTimeout: () => 17,
		clearTimeout: () => {}
	};
	try {
		await import(`../../src/tiferet/revelation/BootSentinel.js?test=${Date.now()}`);
		const sentinel = globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__;
		assert.equal(Object.isFrozen(sentinel), true);
		assert.equal(sentinel.snapshot().settled, false);
		assert.doesNotThrow(() => sentinel.markReady());
		assert.equal(sentinel.snapshot().settled, true);
	} finally {
		restoreGlobals();
	}
});

test("ready manifestation contains observer cleanup failure as a warning", () => {
	let removed = false;
	const loading = {
		dataset: {},
		remove: () => {
			removed = true;
		}
	};
	globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__ = {
		markReady: () => {
			throw new Error("observer exploded");
		}
	};
	globalThis.document = {
		getElementById: () => loading
	};
	globalThis.window = {
		setTimeout: (callback) => {
			callback();
			return 1;
		}
	};
	try {
		const revelation = new BootRevelation();
		assert.doesNotThrow(() => revelation.revealReady());
		assert.equal(globalThis.__OHR_HAGNUZ_BOOT_ERROR__, null);
		assert.equal(globalThis.__OHR_HAGNUZ_BOOT_WARNING__.phase, "ready-cleanup");
		assert.equal(loading.dataset.ready, "true");
		assert.equal(removed, true);
	} finally {
		restoreGlobals();
	}
});
