// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const TRANSIENT_DIRECTORIES = new Set([
	".Awtsmoos",
	"cache",
	"caches",
	"device-state",
	"logs",
	"node_modules",
	"tmp"
]);

const TRANSIENT_FILES = new Set([
	"agent-supervisor.log",
	"agent.log",
	"agent.pid",
	"connection-state.json",
	"legacy-mode.json",
	"recovery-state.json",
	"recovery.log",
	"rollback.log",
	"stop-supervisor",
	"supervisor-stdout.log",
	"supervisor.pid"
]);

/**
 * B"H
 *
 * Recovery preserves the complete stable predecessor, including unmanaged files,
 * while refusing live receipts, queues, logs, locks, and links. The Awtsmoos
 * renews identity and motion separately; Awtsmoos.com archives only settled bytes.
 */
function collect(root, required = []) {
	const runtimeRoot = path.resolve(root);
	const files = new Set(
		required.filter(relative => regularFile(runtimeRoot, relative))
	);
	walk(runtimeRoot, "", files);
	return [...files]
		.filter(relative => include(relative))
		.sort();
}

function walk(root, relativeDirectory, files) {
	const directory = path.join(root, relativeDirectory);
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const relative = slash(path.join(relativeDirectory, entry.name));
		if (entry.isSymbolicLink() || excludedDirectory(relative)) {
			continue;
		}
		if (entry.isDirectory()) {
			walk(root, relative, files);
			continue;
		}
		if (entry.isFile() && include(relative)) {
			files.add(relative);
		}
	}
}

function include(relative) {
	const normalized = slash(relative).replace(/^\.\//, "");
	if (!normalized || normalized.startsWith("../") || path.isAbsolute(normalized)) {
		return false;
	}
	const parts = normalized.split("/");
	const name = parts.at(-1);
	if (parts.some(part => TRANSIENT_DIRECTORIES.has(part))) {
		return false;
	}
	if (TRANSIENT_FILES.has(name)) {
		return false;
	}
	return !/(?:\.lock|\.log|\.pid|\.sock|\.tmp)$/i.test(name);
}

function excludedDirectory(relative) {
	return slash(relative)
		.split("/")
		.some(part => TRANSIENT_DIRECTORIES.has(part));
}

function regularFile(root, relative) {
	try {
		return fs.statSync(path.join(root, relative)).isFile();
	} catch {
		return false;
	}
}

function slash(value) {
	return String(value || "").replace(/\\/g, "/");
}

module.exports = {
	TRANSIENT_DIRECTORIES,
	TRANSIENT_FILES,
	collect,
	include,
	regularFile
};
