// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("./release/runtimeCatalog.js");
const SourcePaths = require("./release/sourcePaths.js");

const ROOT = __dirname;
const OUT = path.join(ROOT, "manifest.txt");

/** Builds a deterministic manifest from the live production source inventory. */
function buildManifest(options = {}) {
	const previous = readCurrent(options.file || OUT);
	const version = options.version ||
		process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE ||
		nextPatch(previous.version);
	const roots = SourcePaths.resolveRoots(options.repoRoot);
	const files = Catalog.collectManifestFiles([], roots);
	return { version, entry: "main.js", files, text: render(version, files) };
}

function readCurrent(file = OUT) {
	if (!fs.existsSync(file)) return { version: "1.0.0", entry: "main.js", files: [] };
	const lines = cleanLines(fs.readFileSync(file, "utf8"));
	return {
		version: /^\d+\.\d+\.\d+$/.test(lines[0] || "") ? lines[0] : "1.0.0",
		entry: lines[1] === "main.js" ? lines[1] : "main.js",
		files: lines[1] === "main.js" ? lines.slice(2) : lines.slice(1)
	};
}

function writeManifest(options = {}) {
	const output = path.resolve(options.file || OUT);
	const manifest = buildManifest({ ...options, file: output });
	fs.writeFileSync(output, manifest.text, "utf8");
	return { ...manifest, output };
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

function agentFiles(repoRoot) {
	return Catalog.agentFiles(SourcePaths.resolveRoots(repoRoot));
}

function externalFiles(repoRoot) {
	return Catalog.externalFiles(SourcePaths.resolveRoots(repoRoot));
}

if (require.main === module) {
	const result = writeManifest();
	console.log(JSON.stringify({
		ok: true,
		version: result.version,
		files: result.files.length,
		output: result.output
	}, null, 2));
}

module.exports = {
	OUT,
	ROOT,
	agentFiles,
	buildManifest,
	cleanLines,
	externalFiles,
	nextPatch,
	readCurrent,
	render,
	slash: SourcePaths.slash,
	writeManifest
};
