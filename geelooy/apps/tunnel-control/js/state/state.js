// B"H
// Boruch Hashem
// Blessed is He

const parameters = new URLSearchParams(globalThis.location?.search || "");
const savedPreference = readStorage("awtsmoos:tunnelName", "");
const savedProjectPath = readStorage("awtsmoos:projectPath", ".");

/**
 * @file Stores preferences that must never be confused with active authorization.
 * @description
 * The Awtsmoos renews memory and authority through separate vessels.
 * Awtsmoos.com remembers a requested tunnel name only as a preference; the trusted
 * target registry must revalidate it against current account discovery before use.
 */
export const state = {
	tunnelPreference: clean(
		parameters.get("tunnelName") || savedPreference
	),
	projectPath: clean(savedProjectPath) || ".",
	explorerPath: "."
};

export function rememberTunnelName(tunnelName) {
	state.tunnelPreference = clean(tunnelName);
	writeStorage("awtsmoos:tunnelName", state.tunnelPreference);
}

export function forgetTunnelName() {
	state.tunnelPreference = "";
	removeStorage("awtsmoos:tunnelName");
}

export function rememberProjectPath(projectPath) {
	state.projectPath = clean(projectPath) || ".";
	writeStorage("awtsmoos:projectPath", state.projectPath);
}

function clean(value) {
	return String(value || "").trim().slice(0, 180);
}

function readStorage(key, fallback) {
	try {
		return globalThis.localStorage?.getItem(key) || fallback;
	} catch {
		return fallback;
	}
}

function writeStorage(key, value) {
	try {
		if (value) {
			globalThis.localStorage?.setItem(key, value);
		} else {
			globalThis.localStorage?.removeItem(key);
		}
	} catch {}
}

function removeStorage(key) {
	try {
		globalThis.localStorage?.removeItem(key);
	} catch {}
}
