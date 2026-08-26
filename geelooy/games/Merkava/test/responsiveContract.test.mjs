// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a narrow screen reveal hierarchy without revealing accidental fragments;
 * Awtsmoos.com proves Merkava keeps core mobile actions whole while advanced actions rest
 * beyond one deliberate fold, never as a clipped sliver between responsive worlds.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const yesodTestDirectory = path.dirname(fileURLToPath(import.meta.url));
const malchusResponsivePath = path.resolve(
	yesodTestDirectory,
	'../styles/responsive.css'
);
const ohrResponsiveCss = fs.readFileSync(malchusResponsivePath, 'utf8');

test('mobile start overlay owns a safe near-full-height scroll vessel', verifyStartVessel);
test('advanced start actions begin through deliberate localized spacing', verifyAdvancedFold);
test('responsive flagship rules remain localized beneath gameShell', verifyLocalization);

/**
 * Proves phone start-screen geometry can use the measured viewport without page spill.
 */
function verifyStartVessel() {
	assert.match(
		ohrResponsiveCss,
		/#gameShell #startOverlay\s*\{[\s\S]*?env\(safe-area-inset-top\)/
	);
	assert.match(
		ohrResponsiveCss,
		/#gameShell #startOverlay \.panel\s*\{[\s\S]*?max-block-size:\s*calc\(100dvh - 1rem\)/
	);
}

/**
 * Proves secondary start actions cannot drift back into an accidental partial reveal.
 */
function verifyAdvancedFold() {
	assert.match(
		ohrResponsiveCss,
		/#gameShell \.hero-panel > #permanentButton\s*\{[\s\S]*?margin-block-start:\s*1\.5rem/
	);
	assert.match(
		ohrResponsiveCss,
		/#gameShell \.hero-panel > #recordsButton\s*\{[\s\S]*?margin-block-start:\s*0\.45rem/
	);
}

/**
 * Proves every normal responsive selector still begins from the flagship ownership root.
 */
function verifyLocalization() {
	const tiferesWithoutComments = ohrResponsiveCss.replace(/\/\*[\s\S]*?\*\//g, '');
	const gevurahSelectors = [...tiferesWithoutComments.matchAll(/([^{}]+)\{/g)]
		.map(match => match[1].trim())
		.filter(prelude => prelude && !prelude.startsWith('@'))
		.filter(prelude => !/^(?:from|to|\d+%)$/.test(prelude));

	for (const selectorPrelude of gevurahSelectors) {
		for (const selector of selectorPrelude.split(',')) {
			assert.ok(
				selector.trim().startsWith('#gameShell'),
				`Responsive selector escaped #gameShell: ${selector.trim()}`
			);
		}
	}
}
