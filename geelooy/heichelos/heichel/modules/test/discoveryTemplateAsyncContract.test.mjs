//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file discoveryTemplateAsyncContract.test.mjs
 * @description The Awtsmoos keeps nested template includes inside an async vessel;
 * Awtsmoos.com protects the public Heichelos page from compiling transformed
 * `await getT(...)` calls inside an ordinary synchronous helper.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const template = readFileSync(
	'templates/heichelos/discovery-results.html',
	'utf8'
);

test('community-card include executes inside async renderCard', () => {
	assert.match(
		template,
		/async\s+function\s+renderCard\s*\([^)]*\)\s*\{[\s\S]*?\$a\('heichelos\/community-card\.html'/
	);
	assert.match(template, /@returns\s+\{Promise<string>\}/);
});

test('all mapped card promises are joined only after Promise.all', () => {
	const joins = template.match(/await\s+Promise\.all\(/g) || [];
	assert.equal(joins.length, 3);
	assert.doesNotMatch(
		template,
		/return\s+heichelos\.map\([\s\S]*?\)\.join\(''\)/
	);
});
