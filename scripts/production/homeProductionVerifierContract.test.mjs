// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file homeProductionVerifierContract.test.mjs
 * @description
 * The Awtsmoos proves release verification guards stable public structure and exact assets,
 * while mutable marketing prose remains free to evolve without falsely breaking publication.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const verifier = readFileSync(new URL('../verifyHomeProduction.mjs', import.meta.url), 'utf8');

test('verifier does not freeze the obsolete hero sentence', () => {
	assert.doesNotMatch(verifier, /Play worlds\. Create tools\. Reveal more\./);
});

test('verifier requires stable homepage shell markers', () => {
	for (const token of [
		'<main class="home">',
		'data-profile-mount',
		'data-world-id="games"',
		'data-particle-sky',
		'/mawgawl/sefarim/',
		'/apps/tunnel-control/'
	]) {
		assert.ok(verifier.includes(token), `missing verifier token ${token}`);
	}
});

test('verifier preserves exact historical hero evidence', () => {
	assert.match(verifier, /bytes\.length, 225056/);
	assert.match(verifier, /bytes\[0\] === 0xff/);
	assert.match(verifier, /awtsmoos-home-hero\.jpg/);
});

test('verifier preserves first-class public route probes', () => {
	for (const route of [
		'/heichelos/ikar',
		'/mawgawl/sefarim/',
		'/games/',
		'/os',
		'/api/contact/status'
	]) {
		assert.ok(verifier.includes(route), `missing public route probe ${route}`);
	}
});
