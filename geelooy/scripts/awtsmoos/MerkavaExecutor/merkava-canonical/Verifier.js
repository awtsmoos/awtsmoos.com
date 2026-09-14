//B"H
//Boruch Hashem
//Blessed be He

const { SECTION } = require('./Format.js');
const { decodeManifest } = require('./Manifest.js');
const { readCanonicalContainer } = require('./Reader.js');

/**
 * Performs semantic verification above the structural container reader.
 * Required executable sections, manifest schema, program encoding, and declared
 * capability names are checked before a runtime is allowed to dispatch bytes.
 * @param {Uint8Array|Buffer|ArrayBuffer|number[]} input Container bytes.
 * @param {{knownCapabilities?:string[],allowedEncodings?:string[]}} options Verification policy.
 * @returns {{ok:boolean,errors:string[],warnings:string[],container?:object,manifest?:object}} Verification report.
 */
function verifyCanonicalContainer(input, options = {}) {
	const errors = [];
	const warnings = [];
	try {
		const container = readCanonicalContainer(input);
		const manifestSection = container.byType.get(SECTION.MANIFEST);
		const bytecodeSection = container.byType.get(SECTION.BYTECODE);
		if (!manifestSection) {
			errors.push('missing_manifest');
		}
		if (!bytecodeSection) {
			errors.push('missing_bytecode');
		}
		const manifest = manifestSection
			? decodeManifest(manifestSection.bytes)
			: null;
		validateManifest(manifest, options, errors, warnings);
		return {
			container,
			errors,
			manifest,
			ok: errors.length === 0,
			warnings
		};
	} catch (error) {
		errors.push(error?.message || String(error));
		return {
			errors,
			ok: false,
			warnings
		};
	}
}

/** @returns {void} */
function validateManifest(manifest, options, errors, warnings) {
	if (!manifest) {
		return;
	}
	const encodings = options.allowedEncodings || ['merkava-v1', 'mapp-transition', 'mode2-transition', 'native-web-v4'];
	if (!encodings.includes(manifest.programEncoding)) {
		errors.push(`unsupported_program_encoding:${manifest.programEncoding}`);
	}
	const known = new Set(options.knownCapabilities || []);
	if (!known.size) {
		return;
	}
	for (const capability of manifest.capabilities) {
		if (!known.has(capability)) {
			warnings.push(`unknown_capability:${capability}`);
		}
	}
}

module.exports = {
	verifyCanonicalContainer
};
