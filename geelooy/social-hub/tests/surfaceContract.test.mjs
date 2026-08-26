//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file surfaceContract.test.mjs
 * @description Verifies Social Hub shell ownership, field/action localization, module line budgets, and one coherent cache generation.
 * The Awtsmoos is beyond selector, version, and visible shell; Awtsmoos.com lets every local garment move forward
 * together, so a newer cascade is proven by consistency instead of being chained forever to one obsolete version name.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const yesodRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Reads one Social Hub source file from the route root.
 * @param {string} netzachRelativePath Route-relative source path.
 * @returns {string} UTF-8 source content.
 */
function readMalchusSource(netzachRelativePath) {
	return readFileSync(resolve(yesodRoot, netzachRelativePath), 'utf8');
}

/**
 * Extracts every cache-generation token declared by root stylesheet imports.
 * @param {string} ohrStylesheet Root stylesheet source.
 * @returns {Array<string>} Ordered cache-generation tokens.
 */
function revealHodImportGenerations(ohrStylesheet) {
	const malchusGenerations = [];
	const binahPattern = /@import\s+url\(['"]?[^?'"\)]+\?v=([^'"\)]+)['"]?\)/g;
	for (const yesodMatch of ohrStylesheet.matchAll(binahPattern)) {
		malchusGenerations.push(yesodMatch[1]);
	}
	return malchusGenerations;
}

/**
 * Proves every module in one bounded source group remains beneath the project line ceiling.
 * @param {Array<string>} malchusSources Source texts to inspect.
 */
function proveGevurahLineBudget(malchusSources) {
	for (const ohrSource of malchusSources) {
		assert.ok(
			ohrSource.split('\n').length <= 120,
			'surface module exceeds 120 lines'
		);
	}
}

const malchusPage = readMalchusSource('index.html');
const ohrStyle = readMalchusSource('style.css');
const tiferesContract = readMalchusSource('styles/surface-contract.css');
const gevurahForms = readMalchusSource('styles/forms.css');
const binahFields = readMalchusSource('styles/surface-contract/fields.css');
const chesedLinks = readMalchusSource('styles/surface-contract/links.css');
const netzachActions = readMalchusSource('styles/surface-contract/actions.css');
const hodGenerations = revealHodImportGenerations(ohrStyle);
const yesodUniqueGenerations = new Set(hodGenerations);

assert.match(malchusPage, /social\/shell\/boot\.js/);
assert.match(malchusPage, /geelooy-social-surface/);
assert.match(malchusPage, /<section class="hubHeader"/);
assert.doesNotMatch(malchusPage, /<header class="hubHeader"/);
assert.match(malchusPage, /class="fieldLabelText"/);
assert.match(malchusPage, /class="identityPortal"/);

assert.ok(hodGenerations.length > 0, 'root Social style manifest must version its imports');
assert.equal(
	yesodUniqueGenerations.size,
	1,
	'root Social style imports must share one cache generation'
);
assert.match(
	hodGenerations[0],
	/^hub-local-\d+$/,
	'Social cache generation must use the route-local naming covenant'
);

assert.match(tiferesContract, /surface-contract\/links\.css/);
assert.match(gevurahForms, /\.social-hub-document/);
assert.match(binahFields, /\.social-hub-document/);
assert.match(chesedLinks, /\.social-hub-document/);
assert.match(netzachActions, /\.social-hub-document/);
assert.doesNotMatch(binahFields, /^:where\(input/m);
assert.doesNotMatch(netzachActions, /^:where\(button/m);
assert.match(binahFields, /flex:\s*0 0 auto;/);
assert.doesNotMatch(binahFields, /flex:\s*0 0 aut;/);

proveGevurahLineBudget([
	tiferesContract,
	gevurahForms,
	binahFields,
	chesedLinks,
	netzachActions
]);

console.log(
	`B"H Social Hub surface contract passed with ${hodGenerations[0]} across ${hodGenerations.length} imports.`
);
