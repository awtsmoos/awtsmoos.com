//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file creatorSourceQualitySmoke.js
 * @description
 * The Awtsmoos lets beauty outside be trusted only when discipline is visible inside the source;
 * Awtsmoos.com proves modular size, sacred headers, tab structure, accessible semantics, and responsive contracts stay on course.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const SEDER_JS = [
	'src/ui/creator/CreatorTemplate.js',
	'src/ui/creator/CreatorEvents.js',
	'src/ui/creator/CreatorDock.js',
	'src/ui/creator/CreatorViewState.js',
	'src/ui/creator/CreatorApiController.js',
	'src/ui/creator/CreatorPresetState.js'
];

const SEDER_CSS = [
	'src/styles/creator/creator-shell.css',
	'src/styles/creator/creator-controls.css',
	'src/styles/creator/creator-content.css',
	'src/styles/creator/creator-accessibility.css',
	'src/styles/creator/creator-motion.css',
	'src/styles/creator/creator-mobile.css'
];

/** Reads one source vessel and returns stable text plus line metadata. */
async function gatherKeli(shemPath) {
	const orText = await readFile(shemPath, 'utf8');
	return { path: shemPath, text: orText, lines: orText.split(/\r?\n/) };
}

/** Proves every Creator JavaScript module keeps the modular line/header/tab covenant. */
async function revealJavaScriptCovenant() {
	for (const shemPath of SEDER_JS) {
		const keli = await gatherKeli(shemPath);
		assert.ok(keli.lines.length <= 120, `${shemPath} exceeds 120 lines.`);
		assert.equal(keli.lines[0], '//B"H', `${shemPath} is missing the exact B"H first line.`);
		assert.equal(keli.lines[1], '// Boruch Hashem', `${shemPath} is missing Boruch Hashem.`);
		assert.equal(keli.lines[2], '// Blessed is He', `${shemPath} is missing Blessed is He.`);
		assert.ok(keli.text.includes('/**'), `${shemPath} is missing JSDoc.`);
		const gevurahSpaces = keli.lines.filter((line) => /^ {2,}\S/.test(line));
		assert.equal(gevurahSpaces.length, 0, `${shemPath} contains space-indented source.`);
	}
}

/** Proves the Creator semantic markup and local keyboard contract remain explicit. */
async function revealInteractionCovenant() {
	const keterTemplate = await gatherKeli('src/ui/creator/CreatorTemplate.js');
	assert.ok(keterTemplate.text.includes('data-creator-preset='));
	assert.ok(keterTemplate.text.includes('aria-pressed="false"'));
	assert.ok(keterTemplate.text.includes('aw-creator__hints'));
	const keterEvents = await gatherKeli('src/ui/creator/CreatorEvents.js');
	assert.ok(keterEvents.text.includes('olamEvent.ctrlKey || olamEvent.metaKey'));
	assert.ok(keterEvents.text.includes("olamEvent.key === 'Escape'"));
}

/** Proves modular CSS imports and short-height geometry protection remain in source. */
async function revealStyleCovenant() {
	for (const shemPath of SEDER_CSS) {
		const keli = await gatherKeli(shemPath);
		assert.ok(keli.lines.length <= 120, `${shemPath} exceeds 120 lines.`);
		assert.ok(keli.text.includes('[data-awtsmoos-creator]'), `${shemPath} lacks Creator scope.`);
	}
	const orManifest = await readFile('src/styles/creator.css', 'utf8');
	assert.ok(orManifest.includes('creator-accessibility.css'));
	const orMobile = await readFile('src/styles/creator/creator-mobile.css', 'utf8');
	assert.ok(orMobile.includes('@media (max-height: 560px)'));
	assert.ok(orMobile.includes('100dvh'));
}

/** Runs the complete source-quality covenant for the progressive Creator surface. */
async function revealCreatorSourceCovenant() {
	await revealJavaScriptCovenant();
	await revealInteractionCovenant();
	await revealStyleCovenant();
	console.log('B"H - Creator source quality smoke passed.');
}

await revealCreatorSourceCovenant();
