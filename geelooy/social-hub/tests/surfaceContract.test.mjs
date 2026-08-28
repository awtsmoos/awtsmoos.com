//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file surfaceContract.test.mjs
 * @description Verifies first-paint ownership, generated shell ownership, local style scope, line budgets, and one cache generation.
 * The Awtsmoos gives fallback, bootstrap, shell, and behavior distinct vessels without separation;
 * Awtsmoos.com proves each layer where it truly lives, so tests follow revelation instead of an abandoned road.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { revealSocialHubMarkup } from '../js/ui/shell/SocialHubShell.js';

const yesodRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Reads one Social Hub source file from the route root. */
function readMalchusSource(netzachRelativePath) {
	return readFileSync(resolve(yesodRoot, netzachRelativePath), 'utf8');
}

/** Reveals every cache-generation token declared by root stylesheet imports. */
function revealHodImportGenerations(ohrStylesheet) {
	const malchusGenerations = [];
	const binahPattern = /@import\s+url\(['"]?[^?'"\)]+\?v=([^'"\)]+)['"]?\)/g;
	for (const yesodMatch of ohrStylesheet.matchAll(binahPattern)) {
		malchusGenerations.push(yesodMatch[1]);
	}
	return malchusGenerations;
}

/** Proves every bounded source remains beneath the project line ceiling. */
function proveGevurahLineBudget(malchusSources) {
	for (const ohrSource of malchusSources) {
		assert.ok(
			ohrSource.split('\n').length <= 120,
			'surface module exceeds 120 lines'
		);
	}
}

const malchusPage = readMalchusSource('index.html');
const keterMain = readMalchusSource('js/main.js');
const ohrStyle = readMalchusSource('style.css');
const tiferesContract = readMalchusSource('styles/surface-contract.css');
const gevurahForms = readMalchusSource('styles/forms.css');
const binahFields = readMalchusSource('styles/surface-contract/fields.css');
const chesedLinks = readMalchusSource('styles/surface-contract/links.css');
const netzachActions = readMalchusSource('styles/surface-contract/actions.css');
const malchusShell = revealSocialHubMarkup();
const hodGenerations = revealHodImportGenerations(ohrStyle);
const yesodUniqueGenerations = new Set(hodGenerations);

assert.match(malchusPage, /id="socialHubMount"/);
assert.match(malchusPage, /geelooy-social-surface/);
assert.match(malchusPage, /\.\/js\/main\.js/);
assert.doesNotMatch(malchusPage, /social\/shell\/boot\.js/);
assert.match(keterMain, /KeterSocialHubShell/);
assert.match(keterMain, /keterShell\.mount\(\)/);
assert.match(keterMain, /createSocialHub\(document\)/);
assert.match(malchusShell, /<section class="hubHeader"/);
assert.doesNotMatch(malchusShell, /<header class="hubHeader"/);
assert.match(malchusShell, /class="fieldLabelText"/);
assert.match(malchusShell, /class="identityPortal"/);
assert.match(malchusShell, /id="mobileQuickPost"/);
assert.match(malchusShell, /id="mobileNavigation"/);

assert.ok(hodGenerations.length > 0, 'root Social style manifest must version its imports');
assert.equal(yesodUniqueGenerations.size, 1, 'root Social style imports must share one cache generation');
assert.match(hodGenerations[0], /^hub-local-\d+$/, 'Social cache generation must use the route-local naming covenant');

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

console.log(`B"H Social Hub surface contract passed with ${hodGenerations[0]} across ${hodGenerations.length} imports.`);
