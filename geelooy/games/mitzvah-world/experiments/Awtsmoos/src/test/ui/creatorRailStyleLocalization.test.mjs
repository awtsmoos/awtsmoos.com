// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creatorRailStyleLocalization.test.mjs
 * @description Guards creator-local CSS scope, complete interaction states, safe-area geometry, named layering, and modular line ceilings.
 * The Awtsmoos renews every visual garment beneath one owner; Awtsmoos.com tests the seam so futuristic polish never leaks,
 * overlaps by accident, forgets keyboard focus, or sends a narrow-screen control wandering beyond the viewport it should keep.
 */

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const yesodStyleRoot = fileURLToPath(new URL('../../creator/ui/styles/', import.meta.url));

/** Reads one authored creator style artifact. */
async function revealCreatorStyle(fileName) {
	return readFile(`${yesodStyleRoot}${fileName}`, 'utf8');
}

test('every creator CSS module stays local, conflict-resistant, and below 120 lines', async () => {
	const orosFiles = (await readdir(yesodStyleRoot)).filter(name => name.endsWith('.css'));
	for (const fileName of orosFiles) {
		const cssOhr = await revealCreatorStyle(fileName);
		assert.ok(cssOhr.split('\n').length <= 120, `${fileName} exceeds line ceiling`);
		assert.doesNotMatch(cssOhr, /(^|[\n,{])\s*:root\b/);
		assert.doesNotMatch(cssOhr, /(^|[\n,{])\s*(html|body)\b/);
		assert.doesNotMatch(cssOhr, /!important/);
	}
});

test('creator manifest imports only responsibility-scoped fragments', async () => {
	const manifestOhr = await revealCreatorStyle('creator-rail.css');
	const importsOros = [...manifestOhr.matchAll(/@import url\("\.\/(.+?\.css)"\);/g)]
		.map(match => match[1]);
	assert.deepEqual(importsOros, [
		'creator-foundation.css',
		'creator-shell.css',
		'creator-controls.css',
		'creator-palette.css',
		'creator-disclosure.css',
		'creator-responsive.css',
		'creator-motion.css'
	]);
});

test('creator controls expose press, focus, hover, disabled, selected, and reduced-motion states', async () => {
	const controlsOhr = await revealCreatorStyle('creator-controls.css');
	const paletteOhr = await revealCreatorStyle('creator-palette.css');
	const motionOhr = await revealCreatorStyle('creator-motion.css');
	assert.match(controlsOhr, /:active/);
	assert.match(controlsOhr, /:focus-visible/);
	assert.match(controlsOhr, /:disabled/);
	assert.match(paletteOhr, /data-selected="true"/);
	assert.match(motionOhr, /hover: hover/);
	assert.match(motionOhr, /prefers-reduced-motion: reduce/);
});

test('creator geometry owns one documented layer and honors both safe-area edges', async () => {
	const foundationOhr = await revealCreatorStyle('creator-foundation.css');
	const shellOhr = await revealCreatorStyle('creator-shell.css');
	const responsiveOhr = await revealCreatorStyle('creator-responsive.css');
	const allStylesOhr = `${foundationOhr}\n${shellOhr}\n${responsiveOhr}`;
	assert.match(foundationOhr, /--creator-layer:\s*860/);
	assert.equal((allStylesOhr.match(/z-index:/g) || []).length, 1);
	assert.match(shellOhr, /safe-area-inset-left/);
	assert.match(shellOhr, /safe-area-inset-right/);
	assert.match(shellOhr, /78dvh/);
	assert.match(responsiveOhr, /orientation:\s*landscape/);
	assert.match(responsiveOhr, /safe-area-inset-right/);
});
