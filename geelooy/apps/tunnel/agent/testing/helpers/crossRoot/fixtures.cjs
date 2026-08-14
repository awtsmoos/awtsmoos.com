// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Filesystem fixtures for synthetic cross-root reconciliation forests.
 * @description
 * The Awtsmoos gives each test a bounded tree whose metadata can be read back
 * exactly. Awtsmoos.com keeps disk testimony separate from process testimony,
 * so each helper reveals one responsibility without becoming a monolith.
 */
function createForest(base) {
	const stateBase = path.join(base, "device-state");
	const roots = {
		old: path.join(stateBase, "old-root"),
		middle: path.join(stateBase, "middle-root"),
		current: path.join(stateBase, "current-root")
	};
	for (const root of Object.values(roots)) {
		fs.mkdirSync(root, { recursive: true });
	}
	return roots;
}

function writeJob(stateRoot, jobId, patch = {}) {
	const directory = path.join(stateRoot, ".Awtsmoos", "command-jobs", jobId);
	fs.mkdirSync(directory, { recursive: true });
	const now = new Date().toISOString();
	const status = patch.status || "running";
	const meta = {
		schemaVersion: 2,
		revision: 0,
		jobId,
		workerId: `worker-${jobId}`,
		receiptId: `receipt-${jobId}`,
		status,
		startedAt: patch.startedAt || now,
		updatedAt: patch.updatedAt || now,
		finishedAt: patch.finishedAt,
		processIdentity: patch.processIdentity || null,
		worker: {
			workerId: `worker-${jobId}`,
			jobId,
			state: status,
			pid: patch.processIdentity?.pid
		},
		receipt: {
			receiptId: `receipt-${jobId}`,
			workerId: `worker-${jobId}`,
			jobId,
			state: status,
			updatedAt: patch.updatedAt || now
		},
		stdoutChars: 0,
		stderrChars: 0,
		...patch
	};
	fs.writeFileSync(
		path.join(directory, "meta.json"),
		`${JSON.stringify(meta, null, 2)}\n`
	);
	return {
		directory,
		metaPath: path.join(directory, "meta.json"),
		meta
	};
}

function readMeta(record) {
	return JSON.parse(fs.readFileSync(record.metaPath, "utf8"));
}

function config(base, currentRoot) {
	return {
		root: path.join(base, "project"),
		deviceStateRoot: currentRoot,
		allowCommands: true,
		tools: { command: true },
		command: { enabled: true, defaultShell: "/bin/sh" }
	};
}

module.exports = {
	config,
	createForest,
	readMeta,
	writeJob
};
