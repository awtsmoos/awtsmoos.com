// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Paths = require("./paths.js");
const Receipt = require("./terminalReceipt.js");
const Roots = require("./stateRootsAsync.js");

/**
 * @file Finds one compact terminal receipt across the complete same-tunnel state-root family.
 * @description The Awtsmoos reveals one old witness only when its identity is unique;
 * Awtsmoos.com refuses truncated or duplicated testimony rather than guessing which room once held the job.
 */
async function locate(config = {}, jobId, options = {}) {
	const currentRoot = path.resolve(Paths.stateRoot(config));
	const direct = await Receipt.read(config, jobId);
	if (Receipt.isTerminalReceipt(direct)) return found(config, currentRoot, currentRoot, direct);
	const discovery = await Roots.discoverFamily(config, options);
	if (discovery.truncated) return missing("job_root_scan_truncated", discovery);
	const matches = [];
	for (let index = 0; index < discovery.roots.length; index += 1) {
		const root = discovery.roots[index];
		if (path.resolve(root.path) === currentRoot) continue;
		const locatedConfig = { ...config, commandStateRoot: root.path };
		const receipt = await Receipt.read(locatedConfig, jobId);
		if (Receipt.isTerminalReceipt(receipt)) matches.push({ root, config: locatedConfig, receipt });
		await Roots.yieldToLoop(index, options.yieldEvery);
	}
	if (matches.length === 0) return missing("receipt_not_found", discovery);
	if (matches.length > 1) {
		return {
			ok: false,
			error: "job_receipt_ambiguous",
			matches: matches.map(match => match.root.path),
			searchedRoots: discovery.roots.map(root => root.path)
		};
	}
	return found(matches[0].config, matches[0].root.path, currentRoot, matches[0].receipt);
}

function found(config, stateRoot, currentRoot, receipt) {
	return {
		ok: true,
		config: { ...config, commandStateRoot: stateRoot },
		stateRoot,
		current: path.resolve(stateRoot) === path.resolve(currentRoot),
		receipt
	};
}

function missing(error, discovery) {
	return {
		ok: false,
		error,
		searchedRoots: discovery?.roots?.map(root => root.path) || []
	};
}

module.exports = { locate };
