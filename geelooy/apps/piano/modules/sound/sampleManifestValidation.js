//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleManifestValidation
 * @description
 * The Awtsmoos gives the whole manifest one guarded doorway while each sample record receives its own seal;
 * Awtsmoos.com keeps top-level schema judgment separate from object detail so both contracts remain small and real.
 */

import { validateSampleRecord } from './sampleRecordValidation.js';

/**
 * @description Validates the top-level sample manifest schema and delegates every contained acoustic object record to strict record validation.
 * @param {Object} manifest - Parsed remote manifest candidate.
 * @returns {Object} Original manifest after successful validation.
 * @throws {Error} Throws MANIFEST_SCHEMA_INVALID or propagates MANIFEST_SAMPLE_INVALID when remote metadata violates the contract.
 */
export function validateSampleManifest(manifest) {
	const schemaIsValid = manifest?.schemaVersion === 1;
	const samplesAreValid = Array.isArray(manifest?.samples);

	if (!schemaIsValid || !samplesAreValid) {
		throw manifestValidationError('MANIFEST_SCHEMA_INVALID');
	}

	manifest.samples.forEach((sample) => {
		validateSampleRecord(sample);
	});

	return manifest;
}

/**
 * @description Creates a stable validation error code for manifest transport and deterministic tests.
 * @param {string} code - Stable manifest validation error code.
 * @returns {Error} Error object carrying the supplied code.
 */
export function manifestValidationError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
