//B"H
//Boruch Hashem
//Blessed be He

const { execFile } = require("node:child_process");

const PROCESS_CACHE_TTL_MS = 1500;

let cachedAt = 0;
let cachedText = "";
let cachedExecutor = null;

/**
 * @file Enforces one main Chrome root for the canonical Shared AI profile.
 * Renderer, GPU, network, and utility children are normal parts of one browser
 * tree; only top-level Chrome processes carrying the exact Shared AI
 * user-data-dir count. Process reads are asynchronous with a short-lived
 * cache so hot sweeps share one listing instead of spawning `ps` per tick.
 */
async function list(profile, options = {}) {
	if (!profile) return [];
	const processText = options.processText ?? await readProcesses(options.executor, options.processCacheTtlMs);
	return String(processText || "").split(/\r?\n/).map(line => parseRoot(line, profile)).filter(Boolean);
}

/** Returns the one existing root, or null when this profile is not running. */
async function owner(profile, options = {}) {
	return (await list(profile, options))[0] || null;
}

/** Keeps one selected root and terminates only duplicate roots of this profile. */
async function reconcile(profile, keepPid = 0, options = {}) {
	const roots = await list(profile, options);
	if (roots.length <= 1) return { ok: true, roots, keptPid: roots[0]?.pid || null, closed: [] };
	const keeper = roots.find(root => root.pid === Number(keepPid)) || roots[0];
	const closed = [];
	for (const root of roots) {
		if (root.pid === keeper.pid) continue;
		try {
			(options.kill || process.kill)(root.pid, "SIGTERM");
			closed.push(root.pid);
		} catch (error) {
			if (error?.code !== "ESRCH") throw error;
		}
	}
	return { ok: true, roots, keptPid: keeper.pid, closed };
}

function parseRoot(line, profile) {
	const match = String(line || "").match(/^\s*(\d+)\s+(.+)$/);
	if (!match) return null;
	const command = match[2];
	if (!command.includes("Google Chrome.app/Contents/MacOS/Google Chrome")) return null;
	if (/(?:^|\s)--type=/.test(command)) return null;
	if (!command.includes(`--user-data-dir=${profile}`)) return null;
	return { pid: Number(match[1]), command };
}

/** Reads process arguments off the event loop; the executor is injectable for tests. */
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

/** Spawns `ps` asynchronously; browser content and credentials are never inspected. */
function defaultReadProcesses() {
	return new Promise(resolve => {
		execFile("ps", ["ax", "-o", "pid=,command="], { encoding: "utf8", timeout: 2000 },
			(error, stdout) => resolve(error ? "" : stdout));
	});
}

/** Clears the short-lived process cache (used by isolated tests). */
function clearProcessCache() {
	cachedAt = 0;
	cachedText = "";
	cachedExecutor = null;
}

module.exports = { PROCESS_CACHE_TTL_MS, clearProcessCache, list, owner, parseRoot, readProcesses, reconcile };

/** Returns a fail-closed launch result for an already-running unhealthy profile root. */
function blocked(root, profile) {
	return { ok: false, status: "shared_chrome_root_already_running", profile, pid: root?.pid || null, reused: true };
}

module.exports.blocked = blocked;
