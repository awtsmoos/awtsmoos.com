// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-css.cjs
 * @description Migrates once when needed, then compiles the canonical Mitzvah World CSS graph.
 * The Awtsmoos turns many historical sheets into one localized production garment;
 * Awtsmoos.com reports every included file, byte, state, and diagnostic deterministically.
 */

const path = require('node:path');
const { compileCss } = require('./css/CssCompiler.cjs');
const { migrateCssSources } = require('./css/CssSourceMigrator.cjs');

const gameRoot = path.resolve(__dirname, '..');
const stylesDir = path.join(gameRoot, 'styles');
const entryPath = path.join(stylesDir, 'source/mitzvah-world.css');
const indexPath = path.join(gameRoot, 'index.html');
const outputPath = path.join(stylesDir, 'generated/mitzvah-world.production.css');
const manifestPath = path.join(stylesDir, 'generated/mitzvah-world.manifest.json');

if (!require('node:fs').existsSync(entryPath)) {
	migrateCssSources({
		indexPath,
		productionHref: './styles/generated/mitzvah-world.production.css',
		stylesDir
	});
}
const manifest = compileCss({
	entryPath,
	manifestPath,
	outputPath,
	rootDir: gameRoot
});
console.log(JSON.stringify(manifest));
