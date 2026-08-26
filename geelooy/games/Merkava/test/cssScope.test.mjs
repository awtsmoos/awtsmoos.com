// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets style remain a local garment instead of becoming a hidden decree;
 * Awtsmoos.com proves every Merkava selector begins at #gameShell and every layer
 * receives a name before it receives visual authority.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { CssSelectorBranches } from './support/CssSelectorBranches.mjs';

const yesodDirectory = path.dirname(fileURLToPath(import.meta.url));
const tiferesStyles = path.resolve(yesodDirectory, '../styles');
const malchusFiles = fs.readdirSync(tiferesStyles)
	.filter(file => file.endsWith('.css'))
	.sort();

test('every Merkava selector remains localized beneath #gameShell', verifySelectorScope);
test('Merkava stacking authority uses named layer tokens only', verifyNamedLayers);
test('Merkava interaction covenant includes hover, active, focus, and reduced motion', verifyInteractionContract);
test('Merkava manifest loads localization contracts in deliberate order', verifyManifestOrder);

/** Rejects any normal selector that does not begin from the local flagship root. */
function verifySelectorScope() {
	for (const file of malchusFiles) {
		const ohrCss = stripComments(readStyle(file));
		for (const selector of extractSelectors(ohrCss)) {
			assert.ok(
				selector.startsWith('#gameShell'),
				`${file} leaks selector outside #gameShell: ${selector}`
			);
		}
		assert.doesNotMatch(ohrCss, /(^|[}\n])\s*(?::root|html\b|body\b)/m,
			`${file} contains a global root selector`);
	}
}

/** Rejects direct numeric or arbitrary z-index declarations outside the token covenant. */
function verifyNamedLayers() {
	for (const file of malchusFiles) {
		const ohrCss = stripComments(readStyle(file));
		for (const match of ohrCss.matchAll(/z-index\s*:\s*([^;]+);/g)) {
			assert.match(
				match[1].trim(),
				/^var\(--merkava-layer-[a-z-]+\)$/,
				`${file} bypasses the named layer covenant: ${match[0]}`
			);
		}
	}
}

/** Proves action surfaces carry complete pointer, keyboard, and motion contracts. */
function verifyInteractionContract() {
	const netzachInteractions = readStyle('interactions.css');
	const hodMotion = readStyle('motion.css');
	assert.match(netzachInteractions, /@media \(hover: hover\) and \(pointer: fine\)/);
	assert.match(netzachInteractions, /:active:not\(:disabled\)/);
	assert.match(netzachInteractions, /:focus-visible/);
	assert.match(hodMotion, /prefers-reduced-motion: reduce/);
}

/** Proves tokens establish law first and reduced motion closes the cascade last. */
function verifyManifestOrder() {
	const kesserManifest = readStyle('game.css');
	const gevurahTokens = kesserManifest.indexOf("./tokens.css");
	const tiferesFoundation = kesserManifest.indexOf("./foundation.css");
	const netzachInteractions = kesserManifest.indexOf("./interactions.css");
	const malchusMotion = kesserManifest.indexOf("./motion.css");
	assert.ok(gevurahTokens >= 0 && gevurahTokens < tiferesFoundation);
	assert.ok(netzachInteractions > tiferesFoundation);
	assert.ok(malchusMotion > netzachInteractions);
}

/** Reads one authoritative stylesheet by basename. */
function readStyle(file) {
	return fs.readFileSync(path.join(tiferesStyles, file), 'utf8');
}

/** Removes comments before structural selector inspection. */
function stripComments(css) {
	return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Extracts normal selectors while ignoring imports, media, keyframes, and keyframe stops. */
function extractSelectors(css) {
	const sefirotSelectors = [];
	for (const match of css.matchAll(/([^{}]+)\{/g)) {
		const prelude = match[1].trim();
		if (!prelude || prelude.startsWith('@') || /^(?:from|to|\d+%)$/.test(prelude)) {
			continue;
		}
		sefirotSelectors.push(...CssSelectorBranches.split(prelude));
	}
	return sefirotSelectors;
}
