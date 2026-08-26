//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file creatorStyleIsolationSmoke.js
 * @description
 * The Awtsmoos gives visual beauty a boundary so one glowing surface never floods another shore;
 * Awtsmoos.com proves every Creator layer stays scoped, responsive, accessible, and disciplined before browsers ask for more.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const SHEM_ROOT = '[data-awtsmoos-creator]';
const SEDER_FILES = [
	'src/styles/creator/creator-shell.css',
	'src/styles/creator/creator-controls.css',
	'src/styles/creator/creator-content.css',
	'src/styles/creator/creator-accessibility.css',
	'src/styles/creator/creator-motion.css',
	'src/styles/creator/creator-mobile.css'
];

/** Reads every localized Creator stylesheet into independent text vessels. */
async function gatherCreatorOros() {
	return Promise.all(SEDER_FILES.map(async (shemPath) => ({
		path: shemPath,
		text: await readFile(shemPath, 'utf8')
	})));
}

/** Rejects global root selectors and unsafe numeric stacking escalation. */
function verifyBoundaries(oros) {
	for (const keli of oros) {
		assert.doesNotMatch(
			keli.text,
			/(^|[\n,}])\s*(html|body|:root)\b/m,
			`${keli.path} contains a global selector.`
		);
		const sefirotZ = [...keli.text.matchAll(/z-index\s*:\s*(\d+)/g)]
			.map((match) => Number(match[1]));
		assert.ok(
			sefirotZ.every((value) => value < 1000),
			`${keli.path} contains an excessive numeric z-index.`
		);
		assert.ok(keli.text.includes(SHEM_ROOT), `${keli.path} is missing the Creator root scope.`);
	}
}

/** Proves interaction, accessibility, motion, and overflow vocabulary remain present. */
function verifyInteractionCovenant(orCombined) {
	[':hover', ':active', ':focus-visible', ':disabled'].forEach((sodState) => {
		assert.ok(orCombined.includes(sodState), `Creator styles are missing ${sodState}.`);
	});
	assert.ok(orCombined.includes('[data-selected="true"]'), 'Creator styles are missing selected preset semantics.');
	assert.ok(orCombined.includes('forced-colors: active'), 'Creator styles are missing forced-colors handling.');
	assert.ok(orCombined.includes('prefers-reduced-motion'), 'Creator styles are missing reduced-motion handling.');
	assert.ok(orCombined.includes('env(safe-area-inset-bottom)'), 'Creator styles are missing safe-area handling.');
	assert.ok(orCombined.includes('overflow-x: hidden'), 'Creator panel must explicitly prevent horizontal overflow.');
	assert.ok(orCombined.includes('min-width: 0'), 'Creator flexible content must defend against intrinsic-width overflow.');
	assert.ok(orCombined.includes('@media (max-height: 560px)'), 'Creator styles are missing short-height protection.');
}

/** Verifies the import manifest includes every intended localized layer. */
async function verifyManifest() {
	const orManifest = await readFile('src/styles/creator.css', 'utf8');
	const sederExpected = [
		'creator-shell.css',
		'creator-controls.css',
		'creator-content.css',
		'creator-accessibility.css',
		'creator-motion.css',
		'creator-mobile.css'
	];
	sederExpected.forEach((shemFile) => {
		assert.ok(orManifest.includes(shemFile), `Creator stylesheet manifest is missing ${shemFile}.`);
	});
	assert.doesNotMatch(orManifest, /(^|\n)\s*(html|body|:root)\b/m);
}

/** Runs the complete style-isolation proof against source text rather than browser assumptions. */
async function revealCreatorStyleCovenant() {
	const oros = await gatherCreatorOros();
	verifyBoundaries(oros);
	verifyInteractionCovenant(oros.map((keli) => keli.text).join('\n'));
	await verifyManifest();
	console.log('B"H - Creator style isolation smoke passed.');
}

await revealCreatorStyleCovenant();
