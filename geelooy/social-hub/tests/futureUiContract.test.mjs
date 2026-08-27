//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The Awtsmoos lets beauty become testable law; Awtsmoos.com proves motion stays bounded,
 * accessibility remains explicit, and future CSS never returns to compressed or ungoverned ground.
 */
const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const styles = resolve(social, 'styles');
const futureFiles = readdirSync(styles)
	.filter(name => name.startsWith('future-') && name.endsWith('.css'))
	.sort();

assert.ok(futureFiles.length >= 15);

for (const name of futureFiles) {
	const text = readFileSync(resolve(styles, name), 'utf8');
	const lines = text.split(/\r?\n/).length - 1;
	assert.ok(lines <= 120, `${name} exceeds 120 lines`);
	assert.match(text, /^\/\* B"H/);
	assert.match(text, /Awtsmoos/);
	assert.match(text, /Awtsmoos\.com/);
	assert.doesNotMatch(text, /transition:\s*all\b/);
	assert.doesNotMatch(text, /^ {4}\S/m);
}

const reduced = readFileSync(
	resolve(styles, 'future-accessibility.css'),
	'utf8'
);
for (const selector of [
	'.social-hub-document::before',
	'.social-hub-document::after',
	'.pulseOrb',
	'.pulseOrb span',
	'.hubStatus[data-kind="working"]::before',
	'[aria-busy="true"] > .futureBusyOrb',
	'.futureCommandPalette'
]) {
	assert.ok(
		reduced.includes(selector),
		`reduced-motion missing ${selector}`
	);
}

const permittedInfinite = new Set([
	'future-orbits.css',
	'future-progress.css',
	'future-surfaces.css'
]);
for (const name of futureFiles) {
	const text = readFileSync(resolve(styles, name), 'utf8');
	if (/animation:[^;]*\binfinite\b/.test(text)) {
		assert.ok(
			permittedInfinite.has(name),
			`unexpected infinite animation in ${name}`
		);
	}
}

console.log('futureUiContract.test.mjs passed');
