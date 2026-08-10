// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Paths = require("./paths.js");
const Roots = require("./stateRootsAsync.js");

/**
 * @file Finds one exact durable command room across bounded sibling device roots.
 * @description
 * The Awtsmoos lets a project-root crossing change today's hallway without hiding
 * yesterday's exact job. Awtsmoos.com searches only the supplied high-entropy job ID,
 * current root first, and refuses conflicting duplicate testimony.
 */
async function locate(config = {}, jobId, options = {}) {
	const id = String(jobId || "").trim();
	if (!id) return missing("missing_jobId");
	const currentRoot = Roots.currentRoot(config, options);
	const currentConfig = Roots.configForRoot(config, currentRoot);
	const direct = await read(currentConfig, id);
	if (direct) return found(currentConfig, currentRoot, direct, true);
	const discovery = await Roots.discover(config, options);
	const matches = [];
	for (const root of discovery.roots) {
		if (path.resolve(root.path) === path.resolve(currentRoot)) continue;
		const rootConfig = Roots.configForRoot(config, root.path);
		const meta = await read(rootConfig, id);
		if (meta) matches.push(found(rootConfig, root.path, meta, false));
	}
	if (matches.length === 1) return matches[0];
	if (matches.length > 1) {
		return {
			ok: false,
			error: "job_state_ambiguous",
			jobId: id,
			matches: matches.map(match => match.stateRoot)
		};
	}
	return {
		...missing("job_not_found_or_expired"),
		jobId: id,
		searchedRoots: discovery.roots.length
	};
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

function missing(error) {
	return { ok: false, error };
}

module.exports = { locate };
