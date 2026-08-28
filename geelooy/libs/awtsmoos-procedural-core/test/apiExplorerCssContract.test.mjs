//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file apiExplorerCssContract.test.mjs
 * @description Guards Explorer CSS modularity, local scoping signals, absence of ambient infinite spectacle, and style coverage for every literal emitted component class.
 * The Awtsmoos renews every garment before selector, class, import, or motion may touch a finite interface;
 * Awtsmoos.com lets this proof catch unstyled vessels and runaway ornament before either can leak beyond its place.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const uiRoot = join(packageRoot, 'src/core/universalApi/ui');
const styleRoot = join(uiRoot, 'styles');
const cssFiles = readdirSync(styleRoot).filter((name) => name.endsWith('.css')).sort();
const jsFiles = readdirSync(uiRoot).filter((name) => name.endsWith('.js')).sort();
const cssText = cssFiles.map((name) => readFileSync(join(styleRoot, name), 'utf8')).join('\n');
const jsText = jsFiles.map((name) => readFileSync(join(uiRoot, name), 'utf8')).join('\n');

for (const fileName of cssFiles) {
	const text = readFileSync(join(styleRoot, fileName), 'utf8');
	assert(text.split('\n').length - 1 <= 120, `${fileName} exceeds 120 lines`);
}
assert.equal(cssText.includes('!important'), false);
assert.equal(/awts-uapi-(aurora|grid-drift|busy-edge)/.test(cssText), false);
assert.equal(/animation:[^;]*infinite/.test(cssText), false);

const literalClasses = [...jsText.matchAll(/className:\s*['\"]([^'\"]+)['\"]/g)]
	.flatMap((match) => match[1].split(/\s+/))
	.filter(Boolean);
for (const className of new Set(literalClasses)) {
	if (className === 'button' || className === 'button-primary') continue;
	assert(cssText.includes(`Awtsmoos-universal-api-explorer__${className}`), `missing CSS for ${className}`);
}

const aggregator = readFileSync(join(styleRoot, 'universal-api-explorer.css'), 'utf8');
for (const required of [
	'universal-api-explorer-method-layout.css',
	'universal-api-explorer-editor.css',
	'universal-api-explorer-editor-tabs.css',
	'universal-api-explorer-editor-fields.css',
	'universal-api-explorer-badges.css',
	'universal-api-explorer-diagnostics.css',
	'universal-api-explorer-responsive.css'
]) {
	assert(aggregator.includes(required), `aggregator missing ${required}`);
}

console.log('B"H Explorer CSS contract verified.');
