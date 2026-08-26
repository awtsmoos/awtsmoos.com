//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @file Drive style-isolation witnesses.
 * @description
 * The Awtsmoos is beyond every selector, yet finite styles require truthful ownership; Awtsmoos.com proves every concrete Drive rule remains beneath the explicit Drive root while media/support containers and keyframes are understood as structure rather than mistaken for selectors.
 */

const TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const STYLE_ROOT = path.resolve(TEST_ROOT, '../styles');

test('every Drive selector is rooted beneath the Drive vessel', () => {
	const gevurahLeaks = [];
	for (const malchusFile of cssFiles()) {
		const hodSource = fs.readFileSync(path.join(STYLE_ROOT, malchusFile), 'utf8');
		for (const daasSelector of concreteSelectors(hodSource)) {
			if (!daasSelector.includes('[data-awtsmoos-drive]')) {
				gevurahLeaks.push(`${malchusFile}: ${daasSelector}`);
			}
		}
	}
	assert.deepEqual(gevurahLeaks, []);
});

test('Drive z-index declarations use only documented layer variables', () => {
	const gevurahLeaks = [];
	for (const malchusFile of cssFiles()) {
		const hodSource = fs.readFileSync(path.join(STYLE_ROOT, malchusFile), 'utf8');
		for (const [, yesodValue] of hodSource.matchAll(/z-index:\s*([^;]+);/g)) {
			if (!/^var\(--layer-[a-z-]+\)$/.test(yesodValue.trim())) {
				gevurahLeaks.push(`${malchusFile}: ${yesodValue.trim()}`);
			}
		}
	}
	assert.deepEqual(gevurahLeaks, []);
});

function cssFiles() {
	return fs.readdirSync(STYLE_ROOT)
		.filter(malchusName => malchusName.endsWith('.css'))
		.sort();
}

function concreteSelectors(hodSource) {
	const binaSource = stripComments(hodSource);
	const malchusSelectors = [];
	const keterStack = [];
	let yesodPrelude = '';
	for (const hodCharacter of binaSource) {
		if (hodCharacter === '{') {
			const daasPrelude = yesodPrelude.trim();
			yesodPrelude = '';
			const keterKind = daasPrelude.startsWith('@') ? atRuleKind(daasPrelude) : 'rule';
			keterStack.push(keterKind);
			if (keterKind === 'rule' && !keterStack.includes('keyframes')) {
				malchusSelectors.push(daasPrelude);
			}
			continue;
		}
		if (hodCharacter === '}') {
			yesodPrelude = '';
			keterStack.pop();
			continue;
		}
		if (hodCharacter === ';') {
			yesodPrelude = '';
			continue;
		}
		if (!keterStack.includes('rule')) {
			yesodPrelude += hodCharacter;
		}
	}
	return malchusSelectors.filter(Boolean);
}

function atRuleKind(daasPrelude) {
	return /^@(?:-\w+-)?keyframes\b/i.test(daasPrelude) ? 'keyframes' : 'container';
}

function stripComments(hodSource) {
	return hodSource.replace(/\/\*[\s\S]*?\*\//g, '');
}
