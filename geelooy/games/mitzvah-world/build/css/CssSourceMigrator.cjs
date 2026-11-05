// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssSourceMigrator.cjs
 * @description Migrates loaded legacy CSS into scoped readable fragments and one entry.
 * The Awtsmoos gathers scattered garments without losing their order; Awtsmoos.com removes
 * competing entry files only after localized fragments and recursive imports are safely written.
 */

const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const { chunkRoot, groupNodes } = require('./CssNodeChunker.cjs');
const { scopeKeyframes } = require('./CssKeyframeScope.cjs');
const { scopeCssRoot } = require('./CssSelectorScope.cjs');
const { writeFragments, writeImportTree } = require('./CssSourceWriter.cjs');

function migrateCssSources(options) {
	const outputRoot = path.join(options.stylesDir, 'source');
	fs.rmSync(outputRoot, { force: true, recursive: true });
	fs.mkdirSync(path.join(outputRoot, 'fragments'), { recursive: true });
	const files = stylesheetOrder(options.indexPath, options.stylesDir);
	const fragments = [];
	for (const filePath of files) {
		const root = postcss.parse(fs.readFileSync(filePath, 'utf8'), { from: filePath });
		scopeKeyframes(root);
		scopeCssRoot(root);
		const groups = groupNodes(chunkRoot(root));
		fragments.push(...writeFragments(
			outputRoot,
			path.basename(filePath, '.css'),
			groups
		));
	}
	const entryPath = writeImportTree(outputRoot, fragments);
	for (const filePath of files) fs.rmSync(filePath);
	rewriteIndex(options.indexPath, options.productionHref);
	return { entryPath, files, fragments };
}

function stylesheetOrder(indexPath, stylesDir) {
	const html = fs.readFileSync(indexPath, 'utf8');
	const linked = [...html.matchAll(/<link[^>]+href=['"]([^'"]+\.css)['"][^>]*>/g)]
		.map(match => path.resolve(path.dirname(indexPath), match[1]))
		.filter(filePath => filePath.startsWith(path.resolve(stylesDir)))
		.filter(filePath => fs.existsSync(filePath));
	const extras = fs.readdirSync(stylesDir)
		.filter(name => name.endsWith('.css'))
		.map(name => path.join(stylesDir, name))
		.filter(filePath => !linked.includes(filePath))
		.sort();
	return [...linked, ...extras];
}

function rewriteIndex(indexPath, productionHref) {
	const html = fs.readFileSync(indexPath, 'utf8');
	const withoutLinks = html.replace(/\s*<link[^>]+href=['"][^'"]+\.css['"][^>]*>/g, '');
	const stylesheet = `\n\t<link rel="stylesheet" href="${productionHref}">`;
	fs.writeFileSync(indexPath, withoutLinks.replace('</head>', `${stylesheet}\n</head>`));
}

module.exports = {
	migrateCssSources
};
