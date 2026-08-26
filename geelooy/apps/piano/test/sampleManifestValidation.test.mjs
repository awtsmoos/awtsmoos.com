//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file sampleManifestValidation.test.mjs
 * @description
 * The Awtsmoos gives provenance and hash one truthful seal; Awtsmoos.com tests that a remote manifest
 * cannot call a mutable lie immutable merely because its JSON has graceful form and musical appeal.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSampleManifest } from '../modules/sound/sampleManifestValidation.js';
import { validateSampleRecord } from '../modules/sound/sampleRecordValidation.js';

const HASH = 'a'.repeat(64);

test('accepts a complete immutable Drive sample record', testValidRecord);
test('rejects mismatched immutable hash addressing', testMismatchedHash);
test('rejects incomplete provenance and media metadata', testMissingMetadata);
test('rejects unsupported manifest schema versions', testInvalidSchema);

/**
 * @description Creates one valid manifest sample fixture whose immutable URL terminates in its declared SHA-256 hash.
 * @param {Object} [overrides={}] - Sample fields that should replace the valid defaults for a negative test.
 * @returns {Object} Complete manifest sample fixture.
 */
function validSample(overrides = {}) {
	return {
		id: 'piano-c4',
		instrument: 'piano',
		articulation: 'mf',
		midi: 60,
		mime: 'audio/mpeg',
		bytes: 42000,
		duration: 4.25,
		objectHash: HASH,
		immutableUrl: `https://awtsmoos.com/api/social/drive/immutable/awtsmoos-piano-samples/${HASH}`,
		drivePath: 'piano-samples/v1/piano/piano-mf-c4.mp3',
		sourceUrl: 'https://example.edu/piano-c4.aiff',
		sourceLabel: 'University source',
		licenseId: 'IOWA-UNRESTRICTED',
		...overrides
	};
}

/**
 * @description Proves a complete record and schema-version-one manifest pass validation unchanged.
 * @returns {void}
 */
function testValidRecord() {
	const sample = validSample();
	assert.doesNotThrow(() => validateSampleRecord(sample));
	assert.deepEqual(validateSampleManifest({ schemaVersion: 1, samples: [sample] }).samples, [sample]);
}

/**
 * @description Proves immutable URL and declared object hash must identify the same content-addressed Drive object.
 * @returns {void}
 */
function testMismatchedHash() {
	const sample = validSample({ objectHash: 'b'.repeat(64) });
	assert.throws(() => validateSampleRecord(sample), /MANIFEST_SAMPLE_INVALID/);
}

/**
 * @description Proves MIME and provenance requirements are mandatory rather than decorative metadata.
 * @returns {void}
 */
function testMissingMetadata() {
	assert.throws(() => validateSampleRecord(validSample({ mime: 'audio/wav' })), /MANIFEST_SAMPLE_INVALID/);
	assert.throws(() => validateSampleRecord(validSample({ licenseId: '' })), /MANIFEST_SAMPLE_INVALID/);
}

/**
 * @description Proves future incompatible schema versions cannot silently flow into the current sample selector.
 * @returns {void}
 */
function testInvalidSchema() {
	assert.throws(() => validateSampleManifest({ schemaVersion: 2, samples: [] }), /MANIFEST_SCHEMA_INVALID/);
}
