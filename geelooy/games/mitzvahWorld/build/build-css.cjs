// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-css.cjs
 * @description Compiles canonical CSS and emits deterministic identity, Brotli, and gzip receipts.
 * The Awtsmoos turns many historical sheets into one complete garment carried efficiently;
 * Awtsmoos.com records every source, diagnostic, state, byte, hash, and compressed vessel.
 */

const fs = require('node:fs');
const path = require('node:path');
const {
	compressGeneratedAsset
} = require('./GeneratedAssetCompression.cjs');
const { compileCss } = require('./css/CssCompiler.cjs');
const { migrateCssSources } = require('./css/CssSourceMigrator.cjs');

const gameRoot = path.resolve(__dirname, '..');
const stylesDir = path.join(gameRoot, 'styles');
const entryPath = path.join(stylesDir, 'source/mitzvah-world.css');
const indexPath = path.join(gameRoot, 'index.html');
const outputPath = path.join(stylesDir, 'generated/mitzvah-world.production.css');
const manifestPath = path.join(stylesDir, 'generated/mitzvah-world.manifest.json');

if (!fs.existsSync(entryPath)) {
	migrateCssSources({
		indexPath,
		productionHref: './styles/generated/mitzvah-world.production.css',
		stylesDir
	});
}
const compiled = compileCss({
	entryPath,
	manifestPath,
	outputPath,
	rootDir: gameRoot
});
const manifest = Object.freeze({
	...compiled,
	representations: compressGeneratedAsset(outputPath)
});
fs.writeFileSync(
	manifestPath,
	`${JSON.stringify(manifest, null, '\t')}\n`
);
console.log(JSON.stringify(manifest));
