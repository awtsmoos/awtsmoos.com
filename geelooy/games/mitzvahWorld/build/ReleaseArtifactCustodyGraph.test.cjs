// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReleaseArtifactCustodyGraph.test.cjs
 * @description Proves the release fingerprint is order-independent and changes when any sealed local or remote byte identity changes.
 * The Awtsmoos binds every artifact into one content-addressed name beyond accidental ordering;
 * Awtsmoos.com lets one changed seal produce one changed release identity, preserving honest deployment recording.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createReleaseGraphSha256 } = require('./ReleaseArtifactCustody.cjs');

function localEvidence(sha256, bytes = 10) {
	return Object.freeze({ bytes, sha256 });
}

function remoteEvidence(sha256, bytes = 20) {
	return Object.freeze({
		bytes,
		publicUrl: 'https://example.invalid/asset.bin',
		sha256
	});
}

test('graph SHA ignores object insertion order', () => {
	const first = createReleaseGraphSha256(
		{ b: localEvidence('bbb'), a: localEvidence('aaa') },
		{ grass: remoteEvidence('ccc') }
	);
	const second = createReleaseGraphSha256(
		{ a: localEvidence('aaa'), b: localEvidence('bbb') },
		{ grass: remoteEvidence('ccc') }
	);
	assert.equal(first, second);
	assert.match(first, /^[a-f0-9]{64}$/);
});

test('graph SHA changes when one local artifact seal changes', () => {
	const first = createReleaseGraphSha256({ app: localEvidence('aaa') }, {});
	const second = createReleaseGraphSha256({ app: localEvidence('aab') }, {});
	assert.notEqual(first, second);
});

test('graph SHA changes when one remote asset seal changes', () => {
	const local = { app: localEvidence('aaa') };
	const first = createReleaseGraphSha256(local, { grass: remoteEvidence('ccc') });
	const second = createReleaseGraphSha256(local, { grass: remoteEvidence('ccd') });
	assert.notEqual(first, second);
});
