// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssCompiler.cjs
 * @description Compiles one deterministic CSS graph and writes manifest and diagnostics.
 * The Awtsmoos joins every localized style leaf into one production garment; Awtsmoos.com
 * validates syntax, leakage, collisions, state coverage, graph order, and source/output sizes.
 */

const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const { diagnoseCss } = require('./CssDiagnostics.cjs');
const { resolveCssGraph, stripImports } = require('./CssGraphResolver.cjs');
const { requiredStateCoverage } = require('./CssStateCoverage.cjs');

function compileCss(options) {
	const graph = resolveCssGraph(options.entryPath);
	const source = graph.order.map(filePath => {
		return stripImports(fs.readFileSync(filePath, 'utf8'));
	}).join('\n');
	const root = postcss.parse(source, { from: options.entryPath });
	const diagnostics = diagnoseCss(root);
	const css = root.toString();
	const stateCoverage = requiredStateCoverage(css);
	const blocking = [
		...diagnostics.globalLeakage,
		...diagnostics.duplicateKeyframes,
		...diagnostics.customPropertyConflicts,
		...stateCoverage.missing
	];
	fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
	const manifest = {
		blocking,
		diagnostics,
		files: graph.order.map(filePath => path.relative(options.rootDir, filePath)),
		inputBytes: Buffer.byteLength(source),
		outputBytes: Buffer.byteLength(css),
		stateCoverage
	};
	fs.writeFileSync(options.manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
	if (blocking.length) {
		throw new Error(`CSS_DIAGNOSTICS_FAILED:${JSON.stringify(blocking.slice(0, 20))}`);
	}
	fs.writeFileSync(options.outputPath, css.trim() + '\n');
	return manifest;
}

module.exports = {
	compileCss
};
