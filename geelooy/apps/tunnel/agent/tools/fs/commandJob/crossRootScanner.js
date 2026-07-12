// B"H
const path = require('node:path');
const Paths = require('./paths.js');
const Policy = require('./policy.js');
const Roots = require('./stateRoots.js');

/** B"H — Batches select only actionable jobs; fresh terminal receipts cost no action slot. */
async function scan(config = {}, options = {}) {
	const discovery = Roots.discover(config, options);
	const maxJobs = Roots.positive(options.maxJobs, 512);
	const maxActions = Roots.positive(options.maxActions, 256);
	const records = [];
	let seenJobs = 0;
	let capped = false;
	for (const root of discovery.roots) {
		const rootConfig = Roots.configForRoot(config, root.path);
		const commandRoot = Paths.storeRoot(rootConfig);
		const names = sortedJobNames(commandRoot);
		for (const name of names) {
			if (seenJobs >= maxJobs || records.length >= maxActions) {
				capped = true;
				break;
			}
			const directory = path.join(commandRoot, name);
			if (!Roots.safeStat(directory)?.isDirectory()) continue;
			seenJobs += 1;
			const metaPath = path.join(directory, 'meta.json');
			const meta = await Paths.readJson(metaPath, null).catch(() => null);
			if (!meta || !actionable(meta, options)) continue;
			records.push({
				jobId: String(meta.jobId || name),
				stateRoot: root.path,
				rootConfig,
				directory,
				metaPath,
				meta
			});
		}
		if (capped) break;
	}
	return {
		discovery,
		maxJobs,
		maxActions,
		seenJobs,
		records,
		truncated: discovery.truncated || capped
	};
}

function actionable(meta = {}, options = {}) {
	if (!Policy.TERMINAL.has(meta.status)) return true;
	const retentionMs = Roots.positive(
		options.terminalRetentionMs,
		Number(process.env.AWTSMOOS_COMMAND_JOB_TTL_MS || 30 * 60 * 1000)
	);
	const finishedAt = Date.parse(
		meta.finishedAt || meta.updatedAt || meta.startedAt || 0
	) || 0;
	return Date.now() - finishedAt >= retentionMs;
}

function sortedJobNames(commandRoot) {
	return Roots.safeRead(commandRoot).sort((left, right) => {
		const leftTime = Number(Roots.safeStat(path.join(commandRoot, left))?.mtimeMs || 0);
		const rightTime = Number(Roots.safeStat(path.join(commandRoot, right))?.mtimeMs || 0);
		return leftTime - rightTime || left.localeCompare(right);
	});
}

module.exports = { actionable, scan, sortedJobNames };
