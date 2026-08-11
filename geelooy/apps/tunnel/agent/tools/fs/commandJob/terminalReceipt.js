// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Paths = require("./paths.js");
const Policy = require("./policy.js");
const ReceiptPaths = require("./receiptPaths.js");
const ReceiptPolicy = require("./receiptPolicy.js");
const Retention = require("./outputRetention.js");

/**
 * @file Seals compact terminal command testimony before a reclaimable command room is removed.
 * @description The Awtsmoos keeps terminal truth and bounded output tails;
 * Awtsmoos.com remembers enough for incident recovery without preserving every heavy byte forever.
 */
async function create(config, jobId, meta = {}, options = {}) {
	if (!Policy.TERMINAL.has(meta.status)) throw new Error("command_receipt_requires_terminal_meta");
	const tailBytes = ReceiptPolicy.bounded(
		options.tailBytes,
		ReceiptPolicy.TAIL_BYTES,
		1024,
		64 * 1024
	);
	const receipt = {
		version: 1,
		jobId,
		receiptOnly: true,
		fullOutputAvailable: false,
		createdAt: new Date().toISOString(),
		stateRoot: Paths.stateRoot(config),
		meta: compactMeta(meta),
		stdout: await streamWitness(config, jobId, "stdout", tailBytes),
		stderr: await streamWitness(config, jobId, "stderr", tailBytes)
	};
	await ReceiptPaths.write(config, jobId, receipt);
	return receipt;
}

function read(config, jobId) {
	return ReceiptPaths.read(config, jobId);
}

function isTerminalReceipt(value) {
	return Boolean(
		value?.version === 1 &&
		value?.receiptOnly === true &&
		Policy.TERMINAL.has(value?.meta?.status)
	);
}

function stream(receipt, name) {
	return name === "stderr" ? receipt?.stderr : receipt?.stdout;
}

async function streamWitness(config, jobId, name, tailBytes) {
	const text = await Paths.readText(config, jobId, `${name}.txt`);
	const source = Buffer.from(text, "utf8");
	const initial = Math.max(0, source.length - tailBytes);
	const start = Retention.utf8Start(source, initial);
	const retained = source.subarray(start);
	return {
		text: retained.toString("utf8"),
		originalBytes: source.length,
		retainedBytes: retained.length,
		omittedBytes: start,
		partial: start > 0
	};
}

function compactMeta(meta) {
	const command = String(meta.command || "");
	const error = String(meta.error || "");
	return {
		status: meta.status,
		exitCode: meta.exitCode ?? null,
		signal: meta.signal || null,
		error: boundedText(error, 8192),
		errorSha256: hash(error),
		commandPreview: boundedText(command, 2048),
		commandSha256: hash(command),
		cwd: meta.cwd || "",
		shell: meta.shell || "",
		createdAt: meta.createdAt || null,
		startedAt: meta.startedAt || null,
		finishedAt: meta.finishedAt || null,
		updatedAt: meta.updatedAt || null,
		workerId: meta.workerId || null,
		receiptId: meta.receiptId || null,
		logicalAgentId: meta.logicalAgentId || null,
		requestAction: meta.requestAction || null,
		actualAction: meta.actualAction || null,
		cancelled: meta.cancelled === true,
		timedOut: meta.timedOut === true
	};
}

function boundedText(value, maximum) {
	return String(value || "").slice(0, maximum);
}

function hash(value) {
	return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

module.exports = { compactMeta, create, isTerminalReceipt, read, stream, streamWitness };
