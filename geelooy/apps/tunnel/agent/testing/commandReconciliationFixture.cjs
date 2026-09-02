// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Store = require("../tools/fs/commandJobStore.js");

/**
 * @file Builds focused durable command-reconciliation fixtures without hiding runtime contracts.
 * @description
 * This Yesod test vessel joins synthetic metadata to real temporary durable files.
 * Awtsmoos.com lets many tests share one truthful covenant without duplicating accidental detail.
 * The Awtsmoos renews fixture and witness in every instant and every shore;
 * each test may reveal a different race while one exact durable shape remains at the core.
 */
async function createConfig(prefix = "awts-command-truth-") {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), prefix));
	return {
		root,
		allowCommands: true
	};
}

/** Writes one durable command job with empty output streams. */
async function writeJob(config, jobId, meta) {
	const folder = Store.jobDir(config, jobId);
	await fsp.mkdir(folder, { recursive: true });
	await fsp.writeFile(path.join(folder, "stdout.txt"), "", "utf8");
	await fsp.writeFile(path.join(folder, "stderr.txt"), "", "utf8");
	await fsp.writeFile(path.join(folder, "meta.json"), JSON.stringify(meta, null, 2), "utf8");
}

/** Reads the durable metadata vessel directly, bypassing ephemeral status rendering. */
async function readMeta(config, jobId) {
	const file = path.join(Store.jobDir(config, jobId), "meta.json");
	return JSON.parse(await fsp.readFile(file, "utf8"));
}

/** Builds the persisted running contract consumed by detached reconciliation. */
function commandMeta(jobId, processIdentity) {
	const startedAt = new Date().toISOString();
	const workerId = `worker_${jobId}`;
	const receiptId = `receipt_${jobId}`;
	return {
		BH: "B\"H",
		jobId,
		action: "commandStart",
		command: "synthetic detached recovery",
		cwd: process.cwd(),
		shell: "sh",
		startedAt,
		status: "running",
		pid: processIdentity.pid,
		processGroupId: processIdentity.processGroupId,
		birthToken: processIdentity.birthToken,
		processIdentity,
		workerId,
		receiptId,
		worker: {
			workerId,
			jobId,
			state: "running",
			...processIdentity,
			startedAt,
			heartbeatAt: startedAt
		},
		receipt: {
			receiptId,
			jobId,
			workerId,
			action: "commandStart",
			state: "running",
			createdAt: startedAt
		}
	};
}

function identity(pid, birthToken, processGroupId = pid) {
	return {
		pid,
		processGroupId,
		birthToken,
		platform: process.platform
	};
}

function onceExit(child) {
	return new Promise(resolve => child.once("exit", resolve));
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	commandMeta,
	createConfig,
	delay,
	identity,
	onceExit,
	readMeta,
	writeJob
};
