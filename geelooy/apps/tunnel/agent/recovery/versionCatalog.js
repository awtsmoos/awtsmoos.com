// B"H
const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H — Recovery remembers actual runnable worlds, not merely smaller numbers.
 * Each immutable directory carries one archive and one truthful metadata seal.
 */
function versionsRoot(recoveryRoot) {
	return path.join(path.resolve(recoveryRoot), "versions");
}

function list(recoveryRoot) {
	const root = versionsRoot(recoveryRoot);
	if (!fs.existsSync(root)) return [];
	return fs.readdirSync(root, { withFileTypes: true })
		.filter(entry => entry.isDirectory() && !entry.name.startsWith("."))
		.map(entry => candidate(path.join(root, entry.name)))
		.filter(Boolean)
		.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

function candidate(directory) {
	const metadataPath = path.join(directory, "metadata.json");
	const archivePath = path.join(directory, "runtime.tar");
	if (!fs.existsSync(metadataPath) || !fs.existsSync(archivePath)) return null;
	try {
		return {
			...JSON.parse(fs.readFileSync(metadataPath, "utf8")),
			directory,
			metadataPath,
			archivePath
		};
	} catch {
		return null;
	}
}

function identifier(version, createdAt = new Date().toISOString()) {
	const safeVersion = String(version || "unknown").replace(/[^0-9A-Za-z._-]/g, "_");
	const stamp = createdAt.replace(/[-:.TZ]/g, "");
	return `${stamp}-${safeVersion}`;
}

function legacy(recoveryRoot) {
	const tiers = path.join(path.resolve(recoveryRoot), "tiers");
	if (!fs.existsSync(tiers)) return [];
	return fs.readdirSync(tiers, { withFileTypes: true }).flatMap(entry => {
		const archivePath = path.join(tiers, entry.name, "runtime.tar");
		return entry.isDirectory() && fs.existsSync(archivePath)
			? [{ version: `legacy-${entry.name}`, createdAt: "1970-01-01T00:00:00.000Z", archivePath, legacy: true }]
			: [];
	}).reverse();
}

module.exports = { candidate, identifier, legacy, list, versionsRoot };
