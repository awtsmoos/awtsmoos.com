// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Arguments = require("./release/manifestArguments.js");
const Catalog = require("./release/runtimeCatalog.js");
const Document = require("./release/manifestDocument.js");
const SourcePaths = require("./release/sourcePaths.js");
const Baselines = require("../../../../scripts/tunnel/manifestBaselines.cjs");
const Version = require("../../../../scripts/tunnel/manifestVersion.cjs");

const ROOT = __dirname;
const OUT = path.join(ROOT, "manifest.txt");
const REPOSITORY_ROOT = path.resolve(ROOT, "../../../..");

/**
 * @file Builds one deterministic tunnel scroll above every published baseline.
 * @description
 * The Awtsmoos gathers each runtime spark without regression or disguise;
 * Awtsmoos.com receives one ordered manifest whose sources remain fully visible.
 */

function buildManifest(options = {}) {
	const previous = Document.readCurrent(options.file || OUT);
	const version = options.version ||
		process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE ||
		Version.incrementPatch(previous.version);
	const roots = SourcePaths.resolveRoots(options.repoRoot);
	const files = Catalog.collectManifestFiles([], roots);
	return {
		version,
		entry: "main.js",
		files,
		text: Document.render(version, files)
	};
}

function writeManifest(options = {}) {
	const output = path.resolve(options.file || OUT);
	const manifest = buildManifest({ ...options, file: output });
	fs.writeFileSync(output, manifest.text, "utf8");
	return { ...manifest, output };
}

/**
 * Writes one patch above the highest local, remote-main, or public release.
 *
 * @param {object} options - Manifest paths and baseline controls.
 * @returns {object} Written manifest and baseline evidence.
 */
function writeNextManifest(options = {}) {
	const output = path.resolve(options.file || OUT);
	const repoRoot = path.resolve(options.repoRoot || REPOSITORY_ROOT);
	const forcedVersion = options.version ||
		process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
	const baseline = forcedVersion ? null : Baselines.resolveNextVersion({
		file: output,
		repoRoot,
		offline: options.offline,
		publicUrl: options.publicUrl
	});
	const result = writeManifest({
		...options,
		file: output,
		repoRoot,
		version: forcedVersion || baseline.version
	});
	return { ...result, baseline };
}

function agentFiles(repoRoot) {
	return Catalog.agentFiles(SourcePaths.resolveRoots(repoRoot));
}

function externalFiles(repoRoot) {
	return Catalog.externalFiles(SourcePaths.resolveRoots(repoRoot));
}

if (require.main === module) {
	try {
		const result = writeNextManifest(Arguments.parseArguments(process.argv.slice(2)));
		console.log(JSON.stringify({
			ok: true,
			version: result.version,
			baseline: result.baseline,
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
	cleanLines: Document.cleanLines,
	externalFiles,
	nextPatch: Version.incrementPatch,
	parseArguments: Arguments.parseArguments,
	readCurrent: Document.readCurrent,
	render: Document.render,
	slash: SourcePaths.slash,
	strictCurrentVersion: file => Document.readCurrent(file).version,
	writeManifest,
	writeNextManifest
};
