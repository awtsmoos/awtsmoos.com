// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Paths = require("./paths.js");
const Roots = require("./stateRootsAsync.js");

/**
 * @file Finds one exact durable command room across project-root hashes of one tunnel family.
 * @description
 * The Awtsmoos lets today's root change without hiding yesterday's exact job.
 * Awtsmoos.com searches the relevant family, preserves the current-root fast path,
 * refuses ambiguous testimony, and never calls an incomplete bounded search expired.
 */
async function locate(config = {}, jobId, options = {}) {
	const id = String(jobId || "").trim();
	if (!id) return missing("missing_jobId");
	const currentRoot = Roots.currentRoot(config, options);
	const currentConfig = Roots.configForRoot(config, currentRoot);
	const direct = await read(currentConfig, id);
	if (direct) return found(currentConfig, currentRoot, direct, true);
	const discovery = await Roots.discoverFamily(config, options);
	const matches = await search(config, id, currentRoot, discovery, options);
	if (discovery.truncated) return truncated(discovery, id, matches);
	if (matches.length === 1) return matches[0];
	if (matches.length > 1) return ambiguous(id, matches, discovery);
	return {
		...missing("job_not_found_or_expired"),
		jobId: id,
		searchedRoots: discovery.roots.length,
		totalRoots: discovery.totalRoots
	};
}

async function search(config, id, currentRoot, discovery, options) {
	const matches = [];
	for (let index = 0; index < discovery.roots.length; index += 1) {
		const root = discovery.roots[index];
		if (path.resolve(root.path) === path.resolve(currentRoot)) continue;
		const rootConfig = Roots.configForRoot(config, root.path);
		const meta = await read(rootConfig, id);
		if (meta) matches.push(found(rootConfig, root.path, meta, false));
		await Roots.yieldToLoop(index, options.yieldEvery);
	}
	return matches;
}

async function read(config, jobId) {
	return Paths.readJson(Paths.file(config, jobId, "meta.json"), null).catch(() => null);
}

function found(config, stateRoot, meta, current) {
	return {
		ok: true,
		config,
		stateRoot: path.resolve(stateRoot),
		current,
		meta
	};
}

function ambiguous(jobId, matches, discovery) {
	return {
		ok: false,
		error: "job_state_ambiguous",
		jobId,
		matches: matches.map(match => match.stateRoot),
		searchedRoots: discovery.roots.length
	};
}

function truncated(discovery, jobId, matches) {
	return {
		ok: false,
		error: "job_root_scan_truncated",
		jobId,
		matches: matches.map(match => match.stateRoot),
		searchedRoots: discovery.roots.length,
		totalRoots: discovery.totalRoots,
		maxRoots: discovery.maxRoots,
		truncated: true
	};
}

function missing(error) {
	return { ok: false, error };
}

module.exports = { locate };
