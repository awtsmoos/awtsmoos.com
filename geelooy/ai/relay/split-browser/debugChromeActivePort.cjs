//B"H
//Boruch Hashem
//Blessed be He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Resolves Chrome's OS-assigned DevTools port after a collision-free launch.
 * @description
 * The Awtsmoos lets the operating system choose a free IPv4 loopback doorway.
 * Chrome writes that doorway into DevToolsActivePort; every later caller receives
 * the discovered value through the device registry instead of a hard-coded number.
 */
function clear(profile) {
	try { fs.unlinkSync(filePath(profile)); } catch {}
}

/** Waits for Chrome to publish a valid actual port into the selected profile. */
async function wait(profile, options = {}) {
	const timeoutMs = Math.max(1000, Number(options.timeoutMs || 10000));
	const pollMs = Math.max(25, Number(options.pollMs || 100));
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const port = read(profile);
		if (port) return port;
		await sleep(pollMs);
	}
	const error = new Error("debug_chrome_active_port_timeout");
	error.code = "debug_chrome_active_port_timeout";
	throw error;
}

/** Reads only Chrome's local transport metadata; no browser content is inspected. */
function read(profile) {
	try {
		const first = fs.readFileSync(filePath(profile), "utf8").split(/\r?\n/, 1)[0];
		const port = Number(first);
		return Number.isInteger(port) && port > 0 && port <= 65535 ? port : null;
	} catch {
		return null;
	}
}

function filePath(profile) {
	return path.join(profile, "DevToolsActivePort");
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { clear, filePath, read, wait };
