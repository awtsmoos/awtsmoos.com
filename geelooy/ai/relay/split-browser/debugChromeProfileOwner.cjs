//B"H
//Boruch Hashem
//Blessed be He

const { execFile } = require("node:child_process");
const ActivePort = require("./debugChromeActivePort.cjs");

const PROCESS_CACHE_TTL_MS = 1500;

let cachedAt = 0;
let cachedText = "";
let cachedExecutor = null;

/**
 * @file Discovers the main Chrome process owning one selected AI-browser profile.
 * Renderer and utility children repeat user-data/debug flags, so they are never
 * accepted as browser authority. PID, port, profile, and process birth time are
 * derived only from the top-level Chrome process. Process reads are asynchronous
 * with a short-lived cache so hot sweeps never block the event loop on `ps`.
 */
async function ownedProfileOwner(profile, options = {}) {
	if (!profile) return null;
	const processText = options.processText ?? await readProcesses(options.executor, options.processCacheTtlMs);
	for (const line of String(processText || "").split(/\r?\n/)) {
		if (!isMainBrowserLine(line, profile)) continue;
		const portMatch = line.match(/--remote-debugging-port(?:=|\s+)(\d+)/);
		const pidMatch = line.match(/^\s*(\d+)/);
		if (!portMatch || !pidMatch) continue;
		let port = Number(portMatch[1]);
		const pid = Number(pidMatch[1]);
		if (port === 0) port = ActivePort.read(profile);
		if (!validPort(port) || !Number.isInteger(pid) || pid <= 0) continue;
		return { pid, port, profile, startedAt: options.startedAt ?? await processStartedAt(pid) };
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
async function ownedProfilePort(profile, options = {}) {
	return (await ownedProfileOwner(profile, options))?.port || null;
}

function validPort(port) {
	return Number.isInteger(port) && port > 0 && port <= 65535;
}

/** Reads only local process arguments; no browser or account content is inspected. */
async function readProcesses(executor, ttlMs = PROCESS_CACHE_TTL_MS) {
	const run = executor || defaultReadProcesses;
	const ttl = Number.isFinite(Number(ttlMs)) && Number(ttlMs) > 0 ? Number(ttlMs) : PROCESS_CACHE_TTL_MS;
	const now = Date.now();
	if (run === cachedExecutor && now - cachedAt < ttl) return cachedText;
	const text = await run();
	cachedAt = now;
	cachedText = String(text || "");
	cachedExecutor = run;
	return cachedText;
}

function defaultReadProcesses() {
	if (process.platform === "win32") return Promise.resolve("");
	return new Promise(resolve => {
		execFile("ps", ["ax", "-o", "pid=,command="], { encoding: "utf8", timeout: 3000 },
			(error, stdout) => resolve(error ? "" : stdout));
	});
}

/** Returns one stable process-birth timestamp when the platform exposes it. */
async function processStartedAt(pid) {
	if (process.platform === "win32") return 0;
	const text = await new Promise(resolve => {
		execFile("ps", ["-p", String(pid), "-o", "lstart="], { encoding: "utf8", timeout: 1500 },
			(error, stdout) => resolve(error ? "" : stdout));
	});
	const parsed = Date.parse(String(text || "").trim());
	return Number.isFinite(parsed) ? parsed : 0;
}

/** Clears the short-lived process cache (used by isolated tests). */
function clearProcessCache() {
	cachedAt = 0;
	cachedText = "";
	cachedExecutor = null;
}

module.exports = {
	PROCESS_CACHE_TTL_MS,
	clearProcessCache,
	isMainBrowserLine,
	ownedProfileOwner,
	ownedProfilePort,
	processStartedAt,
	readProcesses
};
