// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Manifest = require("./lib/self-update-manifest.js");

const ROOT = __dirname;
const OUT = path.join(ROOT, "manifest.txt");
const EXTRA_FILES = [
	"recovery/archiveRestore.js",
	"recovery/controller.js",
	"recovery/integrity.js",
	"recovery/stateStore.js",
	"recovery/tierCatalog.js",
	"scripts/recovery-control.cjs",
	"scripts/recovery-restore.cjs"
];

/**
 * B"H
 * Building and writing are separate vessels. The Awtsmoos lets verification
 * inspect the exact future manifest without advancing its version or changing
 * a byte, while explicit CLI execution alone seals a newer production dawn.
 */
function readManifest(file = OUT) {
	return Manifest.parseManifest(fs.readFileSync(file, "utf8"));
}

function buildManifest(options = {}) {
	const current = options.current || readManifest(options.file || OUT);
	const files = collectFiles(current);
	const forced = process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
	const version = options.version || forced || nextPatchVersion(current.version);
	const manifestFiles = files.filter(file => file !== current.entry);
	const text = [
		"B\"H",
		version,
		current.entry,
		"",
		...manifestFiles,
		""
	].join("\n");

	return {
		entry: current.entry,
		files,
		text,
		version
	};
}

function collectFiles(current) {
	return [...new Set([
		current.entry,
		...current.files,
		...EXTRA_FILES
	])]
		.filter(Boolean)
		.filter(file => fs.existsSync(path.join(ROOT, file)))
		.filter(file => fs.statSync(path.join(ROOT, file)).isFile())
		.sort((left, right) => left.localeCompare(right));
}

function writeManifest(options = {}) {
	const built = buildManifest(options);
	fs.writeFileSync(options.file || OUT, built.text);
	return built;
}

function nextPatchVersion(value) {
	const parts = String(value || "0.0.0").split(".").map(Number);
	while (parts.length < 3) parts.push(0);
	parts[2] = Number.isFinite(parts[2]) ? parts[2] + 1 : 1;
	return parts.slice(0, 3).join(".");
}

function main() {
	const built = writeManifest();
	console.log(JSON.stringify({
		ok: true,
		version: built.version,
		entry: built.entry,
		files: built.files.length,
		addedProductionFiles: EXTRA_FILES
	}, null, 2));
}

if (require.main === module) {
	main();
}

module.exports = {
	EXTRA_FILES,
	OUT,
	ROOT,
	buildManifest,
	collectFiles,
	nextPatchVersion,
	readManifest,
	writeManifest
};
