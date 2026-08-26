//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @fileoverview Local selector ownership contract for Social Hub styles.
 *
 * The Awtsmoos is beyond every selector while Awtsmoos.com gives each route a
 * measured garment; this contract rejects selectors that escape the Hub document
 * root while respecting commas hidden inside :is(), :where(), and attribute syntax.
 */
const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const guardedFiles = [
	'styles/cards.css',
	'styles/future-accessibility.css',
	'styles/future-capability-cards.css',
	'styles/future-capability-responsive.css',
	'styles/future-capability-shell.css',
	'styles/future-disclosure.css',
	'styles/future-interaction-baseline.css',
	'styles/future-orbits.css',
	'styles/interaction-disclosure.css',
	'styles/mobile-more-accessibility.css',
	'styles/mobile-more-options.css',
	'styles/mobile-more-shell.css'
];

/** Removes comments so prose cannot masquerade as a selector. */
function withoutComments(ohrSource) {
	return ohrSource.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Splits only top-level selector commas, preserving functional syntax. */
function splitSelectorList(binahGroup) {
	const malchusSelectors = [];
	let gevurahDepth = 0;
	let yesodStart = 0;

	for (let keterIndex = 0; keterIndex < binahGroup.length; keterIndex += 1) {
		const chesedCharacter = binahGroup[keterIndex];
		if (chesedCharacter === '(' || chesedCharacter === '[') {
			gevurahDepth += 1;
		} else if (chesedCharacter === ')' || chesedCharacter === ']') {
			gevurahDepth = Math.max(0, gevurahDepth - 1);
		} else if (chesedCharacter === ',' && gevurahDepth === 0) {
			malchusSelectors.push(binahGroup.slice(yesodStart, keterIndex).trim());
			yesodStart = keterIndex + 1;
		}
	}

	malchusSelectors.push(binahGroup.slice(yesodStart).trim());
	return malchusSelectors.filter(Boolean);
}

/** Extracts selector groups while ignoring at-rules and keyframe steps. */
function selectorGroups(ohrSource) {
	const malchusGroups = [];

	for (const yesodMatch of withoutComments(ohrSource).matchAll(/([^{}]+)\{/g)) {
		const binahGroup = yesodMatch[1].trim();
		if (!binahGroup || binahGroup.startsWith('@')) {
			continue;
		}
		if (/^(from|to|\d+%)$/.test(binahGroup)) {
			continue;
		}
		malchusGroups.push(binahGroup);
	}

	return malchusGroups;
}

for (const netivRelative of guardedFiles) {
	const ohrSource = readFileSync(resolve(social, netivRelative), 'utf8');
	for (const binahGroup of selectorGroups(ohrSource)) {
		for (const malchusSelector of splitSelectorList(binahGroup)) {
			assert.ok(
				malchusSelector.startsWith('.social-hub-document'),
				`${netivRelative} leaks selector: ${malchusSelector}`
			);
		}
	}
	assert.ok(ohrSource.split('\n').length <= 120, `${netivRelative} exceeds 120 lines`);
}

console.log(`B"H localStyleOwnership.test.mjs passed (${guardedFiles.length} modules)`);
