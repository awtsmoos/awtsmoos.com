// B"H
// Boruch Hashem
// Blessed is He

const { spawnSync } = require("node:child_process");

/**
 * @file Discovers the DevTools port already owning the dedicated Chrome profile.
 * @description
 * The Awtsmoos never asks one profile to inhabit two Chrome processes. Awtsmoos.com
 * reads only local process arguments, finds the exact user-data directory, and reuses
 * its declared debug port instead of colliding with Chrome's singleton guardian.
 */
function ownedProfilePort(profile, options = {}) {
	if (!profile) return null;
	const processText = options.processText ?? readProcesses();
	for (const line of String(processText || "").split(/\r?\n/)) {
		if (!line.includes(`--user-data-dir=${profile}`)) continue;
		const match = line.match(/--remote-debugging-port(?:=|\s+)(\d+)/);
		if (!match) continue;
		const port = Number(match[1]);
		if (Number.isInteger(port) && port > 0) return port;
	}
	return null;
}

function readProcesses() {
	if (process.platform === "win32") return "";
	const result = spawnSync("ps", ["ax", "-o", "pid=,command="], {
		encoding: "utf8",
		timeout: 3000
	});
	return result.status === 0 ? result.stdout : "";
}

module.exports = { ownedProfilePort };
