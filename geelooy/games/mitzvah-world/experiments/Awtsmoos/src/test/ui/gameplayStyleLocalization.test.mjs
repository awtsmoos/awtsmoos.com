// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gameplayStyleLocalization.test.mjs
 * @description Guards localized gameplay style manifests, interaction completeness, and authored line limits.
 * The Awtsmoos renews every surface beneath its rightful root; Awtsmoos.com rejects global leakage, giant style blobs, and unfinished input truth.
 */

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const gameplayRoot = fileURLToPath(new URL('../../ui/styles/gameplay/', import.meta.url));
const responsiveRoot = fileURLToPath(new URL('../../ui/styles/responsive/', import.meta.url));

/**
 * Reads UTF-8 style source from a known localized style folder.
 * @param {string} root Absolute folder path.
 * @param {string} fileName Relative CSS filename.
 * @returns {Promise<string>} CSS source.
 */
async function revealCss(root, fileName) {
	return readFile(`${root}${fileName}`, 'utf8');
}

/**
 * Returns authored CSS filenames from a localized style folder.
 * @param {string} root Absolute folder path.
 * @returns {Promise<string[]>} Sorted CSS filenames.
 */
async function revealCssFiles(root) {
	return (await readdir(root)).filter(name => name.endsWith('.css')).sort();
}

test('gameplay styles never publish root html or body selectors', async () => {
	for (const root of [gameplayRoot, responsiveRoot]) {
		for (const fileName of await revealCssFiles(root)) {
			const css = await revealCss(root, fileName);
			assert.doesNotMatch(css, /(^|[\n,{])\s*:root\b/);
			assert.doesNotMatch(css, /(^|[\n,{])\s*(html|body)\b/);
		}
	}
});

test('gameplay interactions cover hover active focus disabled and reduced motion', async () => {
	const foundation = await revealCss(gameplayRoot, 'gameplay-foundation.css');
	const responsive = await revealCss(gameplayRoot, 'gameplay-responsive.css');
	assert.match(foundation, /:hover/);
	assert.match(foundation, /:active/);
	assert.match(foundation, /:focus-visible/);
	assert.match(foundation, /:disabled/);
	assert.match(responsive, /prefers-reduced-motion/);
});

test('every gameplay authored CSS module remains below the 120-line ceiling', async () => {
	for (const root of [gameplayRoot, responsiveRoot]) {
		for (const fileName of await revealCssFiles(root)) {
			const css = await revealCss(root, fileName);
			const lineCount = css.split('\n').length;
			assert.ok(lineCount <= 120, `${fileName} has ${lineCount} lines`);
		}
	}
});

test('named gameplay layers and safe-area tokens replace anonymous geometry', async () => {
	const foundation = await revealCss(gameplayRoot, 'gameplay-foundation.css');
	assert.match(foundation, /--gp-z-dialogue/);
	assert.match(foundation, /--gp-z-modal/);
	assert.match(foundation, /safe-area-inset-top/);
	assert.match(foundation, /safe-area-inset-bottom/);
});
