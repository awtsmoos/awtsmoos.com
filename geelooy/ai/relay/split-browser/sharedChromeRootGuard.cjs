//B"H
//Boruch Hashem
//Blessed be He

const { spawnSync } = require("node:child_process");

/**
 * @file Enforces one main Chrome root for the canonical Shared AI profile.
 * @description
 * Renderer, GPU, network, and utility children are normal parts of one browser tree.
 * Only top-level Chrome processes carrying the exact Shared AI user-data-dir count.
 * Duplicate roots may be retired without touching any unrelated Chrome profile.
 */
function list(profile, options = {}) {
	if (!profile) return [];
	const processText = options.processText ?? readProcesses();
	return String(processText || "")
		.split(/\r?\n/)
		.map(line => parseRoot(line, profile))
		.filter(Boolean);
}

/** Returns the one existing root, or null when this profile is not running. */
function owner(profile, options = {}) {
	return list(profile, options)[0] || null;
}

/** Keeps one selected root and terminates only duplicate roots of this profile. */
function reconcile(profile, keepPid = 0, options = {}) {
	const roots = list(profile, options);
	if (roots.length <= 1) {
		return {
			ok: true,
			roots,
			keptPid: roots[0]?.pid || null,
			closed: []
		};
	}
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
	return {
		pid: Number(match[1]),
		command
	};
}

/** Reads process arguments only; browser content and credentials are never inspected. */
function readProcesses() {
	const result = spawnSync("ps", ["ax", "-o", "pid=,command="], {
		encoding: "utf8",
		timeout: 2000
	});
	return result.status === 0 ? result.stdout : "";
}

module.exports = { list, owner, parseRoot, reconcile };

/** Returns a fail-closed launch result for an already-running unhealthy profile root. */
function blocked(root, profile) {
	return {
		ok: false,
		status: "shared_chrome_root_already_running",
		profile,
		pid: root?.pid || null,
		reused: true
	};
}

module.exports.blocked = blocked;
