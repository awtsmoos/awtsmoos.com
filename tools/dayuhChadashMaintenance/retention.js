// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MaintenanceRetention
 * @description
 * Keeps a bounded number of complete external rollback generations. Candidates,
 * failed runs, and archives never live inside dayuhChadash, and old generations are
 * removed only after the current production verification has been sealed green.
 */

const fs = require('fs');
const path = require('path');
const { openHandles } = require('./exclusive.js');

function archiveRuns(policy) {
	const root = path.join(policy.workRoot, 'archives');
	if (!fs.existsSync(root)) return [];
	return fs.readdirSync(root, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => {
			const target = path.join(root, entry.name);
			const status = fs.statSync(target);
			return { name: entry.name, target, mtimeMs: status.mtimeMs };
		})
		.sort((left, right) => right.mtimeMs - left.mtimeMs);
}

function pruneArchives(policy, options = {}) {
	const runs = archiveRuns(policy);
	const keep = Math.max(0, Number(options.keep ?? policy.archiveRetention));
	const removed = [];
	const preserved = runs.slice(0, keep).map(run => ({
		name: run.name,
		reason: 'retained-generation'
	}));
	for (const run of runs.slice(keep)) {
		const handles = openHandles([run.target]);
		if (handles.length) {
			preserved.push({ name: run.name, reason: 'open-handles', handles });
			continue;
		}
		if (options.dryRun !== true) {
			fs.rmSync(run.target, { recursive: true, force: true });
		}
		removed.push({ name: run.name, dryRun: options.dryRun === true });
	}
	return { keep, removed, preserved };
}

function pruneRunWorkspaces(policy, currentRunId, options = {}) {
	if (!fs.existsSync(policy.workRoot)) return { removed: [] };
	const removed = [];
	for (const entry of fs.readdirSync(policy.workRoot, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		if (['archives', currentRunId].includes(entry.name)) continue;
		const target = path.join(policy.workRoot, entry.name);
		if (!/^run-\d{8}T\d{6}Z$/.test(entry.name)) continue;
		if (openHandles([target]).length) continue;
		if (options.dryRun !== true) {
			fs.rmSync(target, { recursive: true, force: true });
		}
		removed.push({ name: entry.name, dryRun: options.dryRun === true });
	}
	return { removed };
}

module.exports = {
	archiveRuns,
	pruneArchives,
	pruneRunWorkspaces
};