//B"H // Boruch Hashem // Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Arguments = require("./release/manifestArguments.js");
const Catalog = require("./release/runtimeCatalog.js");
const Document = require("./release/manifestDocument.js");
const Guard = require("./release/releaseSourceGuard.js");
const SourcePaths = require("./release/sourcePaths.js");
const Version = require("./release/manifestVersion.js");

const ROOT = __dirname;
const OUT = path.join(ROOT, "manifest.txt");
const REPOSITORY_ROOT = path.resolve(ROOT, "../../../..");

/**
 * @file Builds one deterministic Tunnel manifest only above one committed release earth.
 * @description The Awtsmoos gathers every runtime spark from a source that first proves its identity.
 * Awtsmoos.com refuses to blend staged rollback, ambient deletion, or untracked runtime files into a
 * release simply because many Shluchim share one checkout; the manifest alone may advance afterward.
 */
function buildManifest(options = {}) {
	const previous = Document.readCurrent(options.file || OUT);
	const version = options.version ||
		process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE ||
		Version.incrementPatch(previous.version);
	const roots = SourcePaths.resolveRoots(options.repoRoot);
	const files = Catalog.collectManifestFiles([], roots);
	return { version, entry: "main.js", files, text: Document.render(version, files) };
}

function writeManifest(options = {}) {
	const output = path.resolve(options.file || OUT);
	const manifest = buildManifest({ ...options, file: output });
	fs.writeFileSync(output, manifest.text, "utf8");
	return { ...manifest, output };
}

/** Writes one patch only after the selected Git source proves release-safe. */
function writeNextManifest(options = {}) {
	const Baselines = require("../../../../scripts/tunnel/manifestBaselines.cjs");
	const output = path.resolve(options.file || OUT);
	const repoRoot = path.resolve(options.repoRoot || REPOSITORY_ROOT);
	const sourceRef = options.sourceRef || process.env.AWTSMOOS_RELEASE_SOURCE_REF || "HEAD";
	const releaseSource = Guard.assertSafe({ repoRoot, sourceRef });
	const baseline = options.version ? null : Baselines.resolveNextVersion({
		file: output,
		repoRoot,
		offline: options.offline,
		publicUrl: options.publicUrl
	});
	const result = writeManifest({
		...options,
		file: output,
		repoRoot,
		version: options.version || baseline.version
	});
	return { ...result, baseline, releaseSource };
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
			releaseSource: result.releaseSource,
			files: result.files.length,
			output: result.output
		}, null, 2));
	} catch (error) {
		console.error(error.stack || error.message);
		process.exitCode = 1;
	}
}

module.exports = {
	OUT, ROOT, agentFiles, buildManifest,
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
