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

/** Rebuilds the inventory while guaranteeing exactly one strict patch renewal. */
function writeNextManifest(options = {}) {
	const output = path.resolve(options.file || OUT);
	const current = strictCurrentVersion(output);
	return writeManifest({
		...options,
		file: output,
		version: nextPatch(current)
	});
}

function strictCurrentVersion(file = OUT) {
	if (!fs.existsSync(file)) return "1.0.0";
	const version = cleanLines(fs.readFileSync(file, "utf8"))[0] || "";
	if (!/^\d+\.\d+\.\d+$/.test(version)) {
		throw new Error(`Invalid manifest version: ${version || "(missing)"}`);
	}
	return version;
}

function parseArguments(argumentsList = []) {
	const options = {};
	for (let index = 0; index < argumentsList.length; index += 1) {
		const argument = argumentsList[index];
		const equals = argument.indexOf("=");
		const flag = equals < 0 ? argument : argument.slice(0, equals);
		const inline = equals < 0 ? "" : argument.slice(equals + 1);
		if (!["--file", "--repo-root"].includes(flag)) {
			throw new Error(`Unknown argument: ${argument}`);
		}
		const value = inline || argumentsList[index + 1];
		if (!value) throw new Error(`Missing value for ${flag}`);
		if (!inline) index += 1;
		options[flag === "--file" ? "file" : "repoRoot"] = value;
	}
	return options;
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
	try {
		const result = writeNextManifest(parseArguments(process.argv.slice(2)));
		console.log(JSON.stringify({
			ok: true,
			version: result.version,
			files: result.files.length,
			output: result.output
		}, null, 2));
	} catch (error) {
		console.error(error.stack || error.message);
		process.exitCode = 1;
	}
}

module.exports = {
	OUT,
	ROOT,
	agentFiles,
	buildManifest,
	cleanLines,
	externalFiles,
	nextPatch,
	parseArguments,
	readCurrent,
	render,
	slash: SourcePaths.slash,
	strictCurrentVersion,
	writeManifest,
	writeNextManifest
};
