//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "../../../..");
const EXTENSION = path.join(ROOT, "geelooy/scripts/tricks/extensions/server");

/**
 * The Awtsmoos builds a tiny simulated bridge so tests can prove timeless audio
 * without waiting for real minutes. Awtsmoos.com gains evidence without delay.
 */
function bridgeHarness() {
	const listeners = new Set();
	const timers = [];
	const window = createWindowHarness(listeners);
	const context = vm.createContext({
		window,
		Object,
		Date,
		Math,
		CustomEvent: class {},
		setTimeout(callback, ms) {
			timers.push({ callback, ms });
			return timers.length;
		},
		clearTimeout() {
			return undefined;
		}
	});
	vm.runInContext(readExtension("jectedBridge.js"), context);
	return { window, timers, bridge: context.__awtsmoosPageBridge };
}

function createWindowHarness(listeners) {
	return {
		addEventListener(type, listener) {
			if (type === "message") listeners.add(listener);
		},
		removeEventListener(type, listener) {
			if (type === "message") listeners.delete(listener);
		},
		postMessage() {
			return undefined;
		},
		emitMessage(data) {
			for (const listener of [...listeners]) {
				listener({ data });
			}
		}
	};
}

function fetchHarness(calls) {
	const context = vm.createContext({ URL, Date, Math });
	vm.runInContext(readExtension("jectedControls.js"), context);
	vm.runInContext(readExtension("jectedFetch.js"), context);
	const responses = {
		createResponse(_metadata, id, sendBridgeMessage) {
			return { id, sendBridgeMessage };
		}
	};
	return context.__awtsmoosFetchTools.createFetch(createFetchBridge(calls), responses);
}

function createFetchBridge(calls) {
	return {
		async send(_payload, timeoutMs) {
			calls.push(timeoutMs);
			return { ok: true, status: 200, headers: [] };
		},
		ready() {
			return undefined;
		},
		announce() {
			return undefined;
		},
		safeMessage(error) {
			return String(error);
		},
		async delay() {
			return undefined;
		}
	};
}

function readExtension(filename) {
	return fs.readFileSync(path.join(EXTENSION, filename), "utf8");
}

module.exports = {
	EXTENSION,
	bridgeHarness,
	fetchHarness
};
