// B"H
const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("./release/runtimeCatalog.js");
const SourcePaths = require("./release/sourcePaths.js");

const ROOT = __dirname;
const OUT = path.join(ROOT, "manifest.txt");

/**
 * B"H — The manifest no longer guesses that every vessel lives beneath one
 * roof. The Awtsmoos joins agent, AI relay, and repository roots into one
 * explicit covenant and turns every omission into a release-stopping error.
 */
function buildManifest(options = {}) {
	const previous = readCurrent();
	const version = options.version || process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE || nextPatch(previous.version);
	const roots = SourcePaths.resolveRoots(options.repoRoot);
	const files = Catalog.collectManifestFiles(previous.files, roots);
	return { version, entry: "main.js", files, text: render(version, files) };
}

function readCurrent() {
	if (!fs.existsSync(OUT)) return { version: "1.0.0", files: [] };
	const lines = cleanLines(fs.readFileSync(OUT, "utf8"));
	return {
		version: /^\d+\.\d+\.\d+$/.test(lines[0] || "") ? lines[0] : "1.0.0",
		files: lines[1] === "main.js" ? lines.slice(2) : lines.slice(1)
	};
}

function writeManifest(options = {}) {
	const manifest = buildManifest(options);
	fs.writeFileSync(OUT, manifest.text);
	return { ...manifest, output: OUT };
}

function cleanLines(text) {
	return String(text || "").split(/\r?\n/).map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
}

function nextPatch(version) {
	const parts = String(version).split(".").map(Number);
	return parts.length === 3 && parts.every(Number.isInteger)
		? `${parts[0]}.${parts[1]}.${parts[2] + 1}`
		: "1.0.1";
}

function render(version, files) {
	return `B"H\n${version}\nmain.js\n${files.join("\n")}\n`;
}

if (require.main === module) {
	const result = writeManifest();
	console.log(JSON.stringify({ ok: true, version: result.version, files: result.files.length, output: result.output }, null, 2));
}

module.exports = { buildManifest, cleanLines, readCurrent, writeManifest };
