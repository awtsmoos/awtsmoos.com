//B"H
//Boruch Hashem
//Blessed be He

const { spawnSync } = require("node:child_process");
const ActivePort = require("./debugChromeActivePort.cjs");

/**
 * @file Discovers the main Chrome process owning one selected AI-browser profile.
 * @description
 * Renderer and utility children repeat user-data/debug flags, so they are never
 * accepted as browser authority. PID, port, profile, and process birth time are
 * derived only from the top-level Chrome process for the selected profile.
 */
function ownedProfileOwner(profile, options = {}) {
	if (!profile) return null;
	const processText = options.processText ?? readProcesses();
	for (const line of String(processText || "").split(/\r?\n/)) {
		if (!isMainBrowserLine(line, profile)) continue;
		const portMatch = line.match(/--remote-debugging-port(?:=|\s+)(\d+)/);
		const pidMatch = line.match(/^\s*(\d+)/);
		if (!portMatch || !pidMatch) continue;
		let port = Number(portMatch[1]);
		const pid = Number(pidMatch[1]);
		if (port === 0) port = ActivePort.read(profile);
		if (!validPort(port) || !Number.isInteger(pid) || pid <= 0) continue;
		return {
			pid,
			port,
			profile,
			startedAt: options.startedAt ?? processStartedAt(pid)
		};
	}
	return null;
}
/** Returns true only for the main browser process of the selected profile. */
function isMainBrowserLine(line, profile) {
	return Boolean(line) &&
		line.includes(`--user-data-dir=${profile}`) &&
		/--remote-debugging-port(?:=|\s+)\d+/.test(line) &&
		!/(?:^|\s)--type=/.test(line);
}

/** Compatibility helper for callers that only need the current owner port. */
function ownedProfilePort(profile, options = {}) {
	return ownedProfileOwner(profile, options)?.port || null;
}

function validPort(port) {
	return Number.isInteger(port) && port > 0 && port <= 65535;
}

/** Reads only local process arguments; no browser or account content is inspected. */
function readProcesses() {
	if (process.platform === "win32") return "";
	const result = spawnSync("ps", ["ax", "-o", "pid=,command="], {
		encoding: "utf8",
		timeout: 3000
	});
	return result.status === 0 ? result.stdout : "";
}
/** Returns one stable process-birth timestamp when the platform exposes it. */
function processStartedAt(pid) {
	if (process.platform === "win32") return 0;
	const result = spawnSync("ps", ["-p", String(pid), "-o", "lstart="], {
		encoding: "utf8",
		timeout: 1500
	});
	if (result.status !== 0) return 0;
	const parsed = Date.parse(String(result.stdout || "").trim());
	return Number.isFinite(parsed) ? parsed : 0;
}

module.exports = {
	isMainBrowserLine,
	ownedProfileOwner,
	ownedProfilePort,
	processStartedAt
};
