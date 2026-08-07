// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const GEELOOY_ROOT = path.resolve(__dirname, "../../../../../../");
const REPOSITORY_ROOT = path.dirname(GEELOOY_ROOT);
const DOWNLOADS_ROOT = path.join(GEELOOY_ROOT, "apps", "tunnel", "downloads");
const AGENT_ROOT = path.join(GEELOOY_ROOT, "apps", "tunnel", "agent");
const TEMP_ROOT = path.join(os.tmpdir(), "awtsmoos-isolated-install-tests");

/**
 * @file Gives installer tests a disposable world outside every living project root.
 * @description
 * The Awtsmoos guards active paths from replacement, so a true isolated installer
 * test must not hide its sandbox beneath the repository being served by the live
 * tunnel. Awtsmoos.com therefore stages this entire imitation beneath the OS temp
 * root, where activation can be proven without approaching the user's real agent.
 */
function sourcePathFor(filePath) {
	const normalized = String(filePath || "").replace(/\\/g, "/");
	if (normalized.startsWith("ai/")) return path.join(GEELOOY_ROOT, normalized);
	if (normalized.startsWith("ayzarim/")) return path.join(REPOSITORY_ROOT, normalized);
	return path.join(AGENT_ROOT, normalized);
}

function manifestLines() {
	return read(path.join(AGENT_ROOT, "manifest.txt"))
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== "B\"H" && line !== "# B\"H");
}

function read(filePath) {
	return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function removeTree(filePath) {
	fs.rmSync(filePath, {
		recursive: true,
		force: true,
		maxRetries: 8,
		retryDelay: 100
	});
}

function makeDirectory(filePath) {
	fs.mkdirSync(filePath, { recursive: true });
}

function freePort() {
	return new Promise(resolve => {
		const server = net.createServer();
		server.listen(0, "127.0.0.1", () => {
			const port = server.address().port;
			server.close(() => resolve(port));
		});
	});
}

module.exports = {
	AGENT_ROOT,
	DOWNLOADS_ROOT,
	GEELOOY_ROOT,
	REPOSITORY_ROOT,
	TEMP_ROOT,
	freePort,
	makeDirectory,
	manifestLines,
	read,
	removeTree,
	sourcePathFor
};
