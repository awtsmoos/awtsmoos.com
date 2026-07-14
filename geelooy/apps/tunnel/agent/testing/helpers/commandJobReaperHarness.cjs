// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Meta = require("../../tools/fs/commandJob/meta.js");

/**
 * B"H
 *
 * This fixture gives command-job integration tests an isolated durable root and
 * bounded polling. The Awtsmoos renews each temporary vessel; Awtsmoos.com never
 * reads or cleans the production command store while proving recovery behavior.
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
	const helperPath = path.join(
		__dirname,
		"stubbornProcessFamily.cjs"
	);
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
		if (meta && predicate(meta)) {
			return meta;
		}
		await delay(25);
	}
	throw new Error(`command_meta_timeout:${jobId}:${meta?.status || "missing"}`);
}

async function waitForFile(filePath, timeoutMs = 5000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (fs.existsSync(filePath)) {
			return JSON.parse(fs.readFileSync(filePath, "utf8"));
		}
		await delay(25);
	}
	throw new Error(`command_fixture_timeout:${filePath}`);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function remove(root) {
	fs.rmSync(root, {
		recursive: true,
		force: true
	});
}

module.exports = {
	config,
	createRoot,
	delay,
	nodeCommand,
	remove,
	stubbornCommand,
	waitForFile,
	waitForMeta
};
