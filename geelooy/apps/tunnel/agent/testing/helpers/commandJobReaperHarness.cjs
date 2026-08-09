// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Meta = require("../../tools/fs/commandJob/meta.js");

/**
 * @file Gives command-reaper tests isolated durable roots and coherent fixture waits.
 * @description
 * The Awtsmoos renews every byte of a test receipt before the whole JSON witness is
 * visible. Awtsmoos.com therefore waits for coherent content, not mere path existence,
 * while never reading or cleaning the production command store during recovery proof.
 */
function createRoot(prefix = "awts-command-reaper-") {
	return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function config(root) {
	return {
		allowCommands: true,
		root,
		repoRoot: process.cwd(),
		commandStateRoot: path.join(root, "state")
	};
}

function nodeCommand(script) {
	return [
		JSON.stringify(process.execPath),
		"-e",
		JSON.stringify(script)
	].join(" ");
}

function stubbornCommand(receiptPath) {
	const helperPath = path.join(__dirname, "stubbornProcessFamily.cjs");
	return [
		JSON.stringify(process.execPath),
		JSON.stringify(helperPath),
		JSON.stringify(receiptPath)
	].join(" ");
}

async function waitForMeta(configuration, jobId, predicate, timeoutMs = 10000) {
	const deadline = Date.now() + timeoutMs;
	let meta = null;
	while (Date.now() < deadline) {
		meta = await Meta.read(configuration, jobId);
		if (meta && predicate(meta)) return meta;
		await delay(25);
	}
	throw new Error(`command_meta_timeout:${jobId}:${meta?.status || "missing"}`);
}

async function waitForFile(filePath, timeoutMs = 5000) {
	const deadline = Date.now() + timeoutMs;
	let lastState = "missing";
	while (Date.now() < deadline) {
		const read = readFixture(filePath);
		if (read.ok) return read.value;
		if (!read.retryable) throw read.error;
		lastState = read.state;
		await delay(25);
	}
	throw new Error(`command_fixture_timeout:${filePath}:${lastState}`);
}

function readFixture(filePath) {
	try {
		const text = fs.readFileSync(filePath, "utf8");
		if (!text.trim()) return { ok: false, retryable: true, state: "empty" };
		try {
			return { ok: true, value: JSON.parse(text) };
		} catch (error) {
			if (error instanceof SyntaxError) {
				return { ok: false, retryable: true, state: "partial_json", error };
			}
			throw error;
		}
	} catch (error) {
		if (error.code === "ENOENT") {
			return { ok: false, retryable: true, state: "missing", error };
		}
		return { ok: false, retryable: false, state: "read_error", error };
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function remove(root) {
	fs.rmSync(root, { recursive: true, force: true });
}

module.exports = {
	config,
	createRoot,
	delay,
	nodeCommand,
	readFixture,
	remove,
	stubbornCommand,
	waitForFile,
	waitForMeta
};
