//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleRecordValidation
 * @description
 * The Awtsmoos lets every remote note carry pitch, provenance, hash, and path as one truthful seal;
 * Awtsmoos.com checks each immutable object record here so a beautiful manifest cannot hide a broken deal.
 */

const HASH_PATTERN = /^[a-f0-9]{64}$/i;
const IMMUTABLE_PREFIX = 'https://awtsmoos.com/api/social/drive/immutable/awtsmoos-piano-samples/';
const DRIVE_PREFIX = 'piano-samples/v1/';

/**
 * @description Validates identity, pitch, provenance, encoded-object metadata, logical path, and immutable hash addressing for one sample.
 * @param {Object} sample - Candidate sample record from the remote Drive manifest.
 * @returns {void}
 * @throws {Error} Throws MANIFEST_SAMPLE_INVALID when any required sample property is absent, malformed, or internally inconsistent.
 */
export function validateSampleRecord(sample) {
	const stringsAreValid = requiredStringsAreValid(sample);
	const numbersAreValid = requiredNumbersAreValid(sample);
	const hashIsValid = HASH_PATTERN.test(sample?.objectHash || '');
	const immutableUrlIsValid = immutableUrlMatchesHash(sample);
	const drivePathIsValid = String(sample?.drivePath || '').startsWith(DRIVE_PREFIX);
	const sourceUrlIsValid = String(sample?.sourceUrl || '').startsWith('https://');
	const mimeIsValid = sample?.mime === 'audio/mpeg';

	if (
		!stringsAreValid
		|| !numbersAreValid
		|| !hashIsValid
		|| !immutableUrlIsValid
		|| !drivePathIsValid
		|| !sourceUrlIsValid
		|| !mimeIsValid
	) {
		throw sampleRecordError('MANIFEST_SAMPLE_INVALID');
	}
}

/**
 * @description Confirms all required textual identity, provenance, and routing fields contain nonempty strings.
 * @param {Object} sample - Candidate sample record.
 * @returns {boolean} True when every required string field is nonempty.
 */
function requiredStringsAreValid(sample) {
	const keys = [
		'id',
		'instrument',
		'articulation',
		'mime',
		'objectHash',
		'immutableUrl',
		'drivePath',
		'sourceUrl',
		'sourceLabel',
		'licenseId'
	];

	return keys.every((key) => {
		return typeof sample?.[key] === 'string' && sample[key].length > 0;
	});
}

/**
 * @description Confirms pitch, encoded byte count, and duration are finite values inside their meaningful acoustic ranges.
 * @param {Object} sample - Candidate sample record.
 * @returns {boolean} True when numeric sample metadata is safe and positive where required.
 */
function requiredNumbersAreValid(sample) {
	const midiIsValid = Number.isInteger(sample?.midi)
		&& sample.midi >= 0
		&& sample.midi <= 127;
	const bytesAreValid = Number.isSafeInteger(sample?.bytes)
		&& sample.bytes > 0;
	const durationIsValid = Number.isFinite(sample?.duration)
		&& sample.duration > 0;

	return midiIsValid && bytesAreValid && durationIsValid;
}

/**
 * @description Verifies that the immutable URL is rooted in the sample alias and terminates in the declared SHA-256 object hash.
 * @param {Object} sample - Candidate sample record containing immutableUrl and objectHash.
 * @returns {boolean} True when immutable addressing and declared hash agree exactly.
 */
function immutableUrlMatchesHash(sample) {
	const url = String(sample?.immutableUrl || '');
	const hash = String(sample?.objectHash || '').toLowerCase();
	return url === `${IMMUTABLE_PREFIX}${hash}`;
}

/**
 * @description Creates a stable record-validation error suitable for deterministic tests and manifest transport.
 * @param {string} code - Stable sample record validation code.
 * @returns {Error} Error carrying the supplied code.
 */
function sampleRecordError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
