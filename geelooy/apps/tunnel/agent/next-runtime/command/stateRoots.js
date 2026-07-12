// B"H
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/** B"H — Test roots may be many, but discovery is bounded and deterministic. */
function baseRoot(config = {}) {
	if (config.deviceStateRoot) return path.resolve(config.deviceStateRoot);
	if (process.env.AWTSMOOS_TUNNEL_STATE_ROOT) return path.resolve(process.env.AWTSMOOS_TUNNEL_STATE_ROOT);
	return path.join(os.homedir(), ".awtsmoos-tunnel", "device-state");
}

function listStateRoots(config = {}, options = {}) {
	const base = baseRoot(config);
	const maxRoots = positive(options.maxRoots, 32);
	const entries = safeRead(base).map(name => {
		const fullPath = path.join(base, name);
		const stat = safeStat(fullPath);
		return { name, path: fullPath, mtimeMs: Number(stat?.mtimeMs || 0), directory: stat?.isDirectory() === true };
	}).filter(entry => entry.directory);
	entries.sort((left, right) => right.mtimeMs - left.mtimeMs || left.name.localeCompare(right.name));
	return {
		base,
		totalRoots: entries.length,
		maxRoots,
		truncated: entries.length > maxRoots,
		roots: entries.slice(0, maxRoots)
	};
}

function commandJobsRoot(stateRoot) {
	return path.join(stateRoot, ".Awtsmoos", "command-jobs");
}

function listJobDirectories(stateRoot, options = {}) {
	const root = commandJobsRoot(stateRoot);
	const maxJobs = positive(options.maxJobs, 1280);
	const jobs = safeRead(root).map(name => {
		const fullPath = path.join(root, name);
		const stat = safeStat(fullPath);
		return { jobId: name, path: fullPath, mtimeMs: Number(stat?.mtimeMs || 0), directory: stat?.isDirectory() === true };
	}).filter(entry => entry.directory);
	jobs.sort((left, right) => left.mtimeMs - right.mtimeMs || left.jobId.localeCompare(right.jobId));
	return { root, totalJobs: jobs.length, maxJobs, truncated: jobs.length > maxJobs, jobs: jobs.slice(0, maxJobs) };
}

function safeRead(directory) {
	try { return fs.readdirSync(directory); } catch { return []; }
}
function safeStat(target) {
	try { return fs.statSync(target); } catch { return null; }
}
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
module.exports = { baseRoot, commandJobsRoot, listJobDirectories, listStateRoots };
