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

test('verifier requires semantic homepage shell markers', () => {
	assert.match(verifier, /public homepage missing semantic home main/);
	for (const token of [
		'data-profile-mount',
		'data-world-id="games"',
		'data-particle-sky',
		'/mawgawl/sefarim/',
		'/apps/tunnel-control/'
	]) {
		assert.ok(verifier.includes(token), `missing verifier token ${token}`);
	}
});


/** Proves deployment opens one real Torah reader and rejects server-template leakage there. */
test('verifier probes a real Torah reader canary', () => {
	assert.match(verifier, /const readerPath =/);
	assert.match(verifier, /data-awtsmoos-initial-post/);
	for (const marker of [
		'thereWasAnAwtsmoosErrorHere',
		'ReferenceError:',
		'Error processing code segment'
	]) {
		assert.ok(verifier.includes(marker), `missing reader leak marker ${marker}`);
	}
});

/** Proves deployment refuses to call a release whole when its canonical browser icon is absent. */
test('verifier probes the canonical SVG favicon', () => {
	assert.match(verifier, /get\('\/favicon\.svg'\)/);
	assert.match(verifier, /public favicon is not SVG/);
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
