//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CssCompiler.cjs
 * @description Compiles one deterministic localized CSS graph while treating source law, cascade truth, and state coverage as release gates.
 * The Awtsmoos joins many readable garments without erasing their boundaries; Awtsmoos.com lets this Tiferes-like coordinator gather
 * graph order, source policy, semantic diagnostics, state coverage, compact output, manifest evidence, and final syntax into one small covenant.
 */

const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const { diagnoseCss } = require('./CssDiagnostics.cjs');
const { resolveCssGraph, stripImports } = require('./CssGraphResolver.cjs');
const { minifyCssRoot } = require('./CssOutputMinifier.cjs');
const { auditCssSources } = require('./CssSourcePolicy.cjs');
const { requiredStateCoverage } = require('./CssStateCoverage.cjs');

/**
 * @description Compiles, audits, manifests, and emits one localized Mitzvah World production stylesheet.
 * @param {object} options Compiler paths and release-root configuration.
 * @param {string} options.entryPath Absolute or relative CSS entry path.
 * @param {string} options.manifestPath Destination manifest path.
 * @param {string} options.outputPath Destination production identity CSS path.
 * @param {string} options.rootDir Root used for readable manifest paths and source policy evidence.
 * @returns {object} Manifest containing source graph, diagnostics, policy evidence, state coverage, and byte counts.
 */
function compileCss(options) {
	const graph = resolveCssGraph(options.entryPath);
	const sourcePolicy = auditCssSources(graph.order, options.rootDir);
	const source = graph.order.map(filePath => {
		return stripImports(fs.readFileSync(filePath, 'utf8'));
	}).join('\n');
	const root = postcss.parse(source, { from: options.entryPath });
	const diagnostics = diagnoseCss(root);
	const readableCss = root.toString();
	const stateCoverage = requiredStateCoverage(readableCss);
	const css = minifyCssRoot(root);
	const blocking = collectBlocking(sourcePolicy, diagnostics, stateCoverage);
	fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
	const manifest = createManifest(options, graph, source, css, sourcePolicy, diagnostics, stateCoverage, blocking);
	fs.writeFileSync(options.manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`);
	if (blocking.length) {
		throw new Error(`CSS_DIAGNOSTICS_FAILED:${JSON.stringify(blocking.slice(0, 20))}`);
	}
	postcss.parse(css, { from: options.outputPath });
	fs.writeFileSync(options.outputPath, `${css}\n`);
	return manifest;
}

/**
 * @description Collects every release-blocking CSS obligation into one explicit gate without hiding the evidence channel it came from.
 * @param {object} sourcePolicy Source-level policy evidence for individual imported files.
 * @param {object} diagnostics Compiled semantic cascade diagnostics.
 * @param {object} stateCoverage Required interaction-state coverage result.
 * @returns {object[]} Flattened blocking evidence consumed by build and deployment tooling.
 */
function collectBlocking(sourcePolicy, diagnostics, stateCoverage) {
	return [
		...sourcePolicy.errors,
		...diagnostics.globalLeakage,
		...diagnostics.duplicateKeyframes,
		...diagnostics.customPropertyConflicts,
		...diagnostics.overrides,
		...diagnostics.zIndexConflicts,
		...stateCoverage.missing
	];
}

/**
 * @description Creates the stable production manifest from graph, source, output, policy, diagnostics, and interaction evidence.
 * @param {object} options Compiler path configuration.
 * @param {object} graph Resolved import graph.
 * @param {string} source Readable concatenated source before minification.
 * @param {string} css Compiled production CSS.
 * @param {object} sourcePolicy Source-level policy evidence.
 * @param {object} diagnostics Compiled semantic diagnostics.
 * @param {object} stateCoverage Interaction-state coverage evidence.
 * @param {object[]} blocking Flattened release blockers.
 * @returns {object} JSON-serializable manifest object.
 */
function createManifest(options, graph, source, css, sourcePolicy, diagnostics, stateCoverage, blocking) {
	return {
		blocking,
		diagnostics,
		files: graph.order.map(filePath => path.relative(options.rootDir, filePath)),
		inputBytes: Buffer.byteLength(source),
		outputBytes: Buffer.byteLength(css),
		sourcePolicy,
		stateCoverage
	};
}

module.exports = {
	compileCss
};
