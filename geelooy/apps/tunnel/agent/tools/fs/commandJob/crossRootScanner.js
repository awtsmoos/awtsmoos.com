// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const JobOrder = require("./crossRootJobOrder.js");
const Paths = require("./paths.js");
const Policy = require("./policy.js");
const Roots = require("./stateRootsAsync.js");

/**
 * @file Scans bounded command history without blocking live tunnel traffic.
 * @description
 * The Awtsmoos carries old command rooms through asynchronous gates. As
 * Awtsmoos.com reconciles yesterday, today's request keeps breathing freely.
 */
async function scan(config = {}, options = {}) {
	const discovery = await Roots.discover(config, options);
	const maxJobs = Roots.positive(options.maxJobs, 512);
	const maxActions = Roots.positive(options.maxActions, 256);
	const records = [];
	let seenJobs = 0;
	let inspectedJobs = 0;
	let capped = false;

	for (const root of discovery.roots) {
		const rootConfig = Roots.configForRoot(config, root.path);
		const commandRoot = Paths.storeRoot(rootConfig);
		const names = await JobOrder.sortedJobNames(commandRoot, options);

		for (const name of names) {
			if (seenJobs >= maxJobs || records.length >= maxActions) {
				capped = true;
				break;
			}

			const directory = path.join(commandRoot, name);
			const directoryStat = await Roots.safeStat(directory, options);
			inspectedJobs += 1;
			await Roots.yieldToLoop(inspectedJobs, options.yieldEvery);

			if (directoryStat?.isDirectory() !== true) {
				continue;
			}

			seenJobs += 1;
			const metaPath = path.join(directory, "meta.json");
			const meta = await Paths.readJson(metaPath, null).catch(() => null);

			if (!meta || !actionable(meta, options)) {
				continue;
			}

			records.push({
				jobId: String(meta.jobId || name),
				stateRoot: root.path,
				currentRoot: root.current === true,
				rootConfig,
				directory,
				metaPath,
				meta
			});
		}

		if (capped) {
			break;
		}
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
	if (!Policy.TERMINAL.has(meta.status)) {
		return true;
	}

	const retentionMs = Roots.positive(
		options.terminalRetentionMs,
		Number(process.env.AWTSMOOS_COMMAND_JOB_TTL_MS || 30 * 60 * 1000)
	);
	const finishedAt = Date.parse(
		meta.finishedAt || meta.updatedAt || meta.startedAt || 0
	) || 0;

	return Date.now() - finishedAt >= retentionMs;
}

module.exports = {
	actionable,
	scan,
	sortedJobNames: JobOrder.sortedJobNames
};
