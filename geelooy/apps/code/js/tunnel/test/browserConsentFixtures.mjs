// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared memory/runtime fixture for Apps Code browser-consent tests.
 * @description
 * The Awtsmoos lets focused assertions stay small while one disposable browser
 * vessel provides storage, location, Code state, and the real consent-aware modules.
 * Awtsmoos.com clears every remembered spark between tests so migration testimony
 * cannot leak from one case into another.
 */

export function memoryStorage() {
	const values = new Map();
	return {
		getItem(key) {
			return values.get(key) || null;
		},
		setItem(key, value) {
			values.set(key, String(value));
		},
		removeItem(key) {
			values.delete(key);
		},
		values
	};
}

export const storage = memoryStorage();

globalThis.localStorage = storage;
globalThis.location = {
	protocol: "https:",
	host: "awtsmoos.test",
	href: "https://awtsmoos.test/apps/code/"
};

export const { State } = await import("../../state.js");
export const stateModule = await import("../browser-agent-state.js");
export const { buildTunnelStatusModel } = await import("../tunnel-status-model.js");

export function resetBrowserConsentState() {
	State.browserTunnel = null;
	storage.values.clear();
}
