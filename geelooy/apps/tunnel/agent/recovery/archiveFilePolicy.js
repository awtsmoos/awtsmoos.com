// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Transient = require("./archiveTransientPolicy.js");

/**
 * B"H
 *
 * Recovery archives settled runtime and stable unmanaged identity, never browser
 * profiles, queues, caches, logs, or process state. The Awtsmoos renews code and
 * motion separately; Awtsmoos.com refuses transient descent before directory reads.
 */
function collect(root, required = []) {
	return collectDetailed(root, required).files;
}

function collectDetailed(root, required = []) {
	const runtimeRoot = path.resolve(root);
	const files = new Set(
		required.filter(relative => regularFile(runtimeRoot, relative))
	);
	const metrics = {
		excludedDirectories: 0,
		skippedLinks: 0,
		walkedDirectories: 0,
		walkedFiles: 0
	};
	walk(runtimeRoot, "", files, metrics);
	return {
		files: [...files].filter(Transient.include).sort(),
		metrics
	};
}

function walk(root, relativeDirectory, files, metrics) {
	const directory = path.join(root, relativeDirectory);
	metrics.walkedDirectories += 1;
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const relative = Transient.slash(path.join(relativeDirectory, entry.name));
		if (entry.isSymbolicLink()) {
			metrics.skippedLinks += 1;
			continue;
		}
		if (entry.isDirectory() && Transient.excludedDirectory(relative)) {
			metrics.excludedDirectories += 1;
			continue;
		}
		if (entry.isDirectory()) {
			walk(root, relative, files, metrics);
			continue;
		}
		if (entry.isFile()) {
			metrics.walkedFiles += 1;
			if (Transient.include(relative)) files.add(relative);
		}
	}
}

function regularFile(root, relative) {
	try {
		return fs.statSync(path.join(root, relative)).isFile();
	} catch {
		return false;
	}
}

module.exports = {
	...Transient,
	collect,
	collectDetailed,
	regularFile,
	walk
};
