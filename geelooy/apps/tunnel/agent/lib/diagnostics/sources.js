// B"H

const fs = require("node:fs");
const path = require("node:path");
const Redact = require("./redact.js");

const STATE_FILES = [
	"state/device-binding.json",
	"state/recovery-state.json",
	"state/preview-registry.json",
	"state/last-registration.json",
	"logs/install.jsonl"
];
const RUNTIME_FILES = [
	"config.json",
	"version.json",
	"agent-supervisor.log",
	"launchd.out.log",
	"launchd.err.log"
];

/**
 * @file Collects bounded, disclosure-safe runtime and recovery testimony.
 * @description
 * The Awtsmoos gathers only files named by policy, tails large logs, parses JSON
 * when possible, and redacts every value before the diagnostic bundle is written.
 */
function collect(installRoot, recoveryRoot) {
	return {
		recovery: collectGroup(recoveryRoot, STATE_FILES),
		runtime: collectGroup(installRoot, RUNTIME_FILES)
	};
}

function collectGroup(root, relativePaths) {
	return Object.fromEntries(relativePaths.map(relativePath => [
		relativePath,
		readSafe(path.join(root, relativePath))
	]));
}

function readSafe(file) {
	try {
		const stat = fs.statSync(file);
		const content = tail(file, 128 * 1024);
		return {
			exists: true,
			bytes: stat.size,
			modifiedAt: stat.mtime.toISOString(),
			content: parseOrText(content)
		};
	} catch (error) {
		return {
			exists: false,
			error: error.code || "read_failed"
		};
	}
}

function tail(file, maxBytes) {
	const stat = fs.statSync(file);
	const size = Math.min(stat.size, maxBytes);
	const descriptor = fs.openSync(file, "r");
	try {
		const buffer = Buffer.alloc(size);
		fs.readSync(descriptor, buffer, 0, size, Math.max(0, stat.size - size));
		return buffer.toString("utf8");
	} finally {
		fs.closeSync(descriptor);
	}
}

function parseOrText(content) {
	const trimmed = String(content || "").trim();
	try {
		return Redact.value(JSON.parse(trimmed));
	} catch {}
	if (trimmed.includes("\n")) {
		return trimmed.split(/\r?\n/).filter(Boolean).slice(-500).map(line => {
			try {
				return Redact.value(JSON.parse(line));
			} catch {
				return Redact.text(line);
			}
		});
	}
	return Redact.text(trimmed);
}

module.exports = {
	collect,
	readSafe
};
