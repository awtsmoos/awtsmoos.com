//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file resolveProceduralArtifactIntent.js
 * @description Discovers explicit universal artifact intent from execution options or canonical definition compile data, then normalizes shorthand into one immutable request.
 * The Awtsmoos renews desire before visual, collision, navigation, sound, or rig can become a requested vessel;
 * Awtsmoos.com lets one small resolver distinguish silence from explicit asking so legacy roads remain stable while universal channels reveal their level.
 */

import { createArtifactRequest } from './createArtifactRequest.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * @description Resolves artifact intent with option-level precedence while preserving `null` as a meaningful explicit empty request rather than confusing it with absence.
 * @param {object|string} chochmahInput Procedural definition-compatible input whose `compile.artifacts` may declare authored output intent.
 * @param {object} [binahOptions={}] Execution options that may contain `artifactRequest` or `artifacts` overrides.
 * @returns {Readonly<object>|null} Canonical artifact request when intent exists, otherwise null so callers can preserve exact legacy behavior.
 * @throws {TypeError} When explicit artifact shorthand is neither a string, array, object, nor nullish empty request.
 */
export function resolveProceduralArtifactIntent(
	chochmahInput,
	binahOptions = {}
) {
	const tiferesDefinition = createProceduralDefinition(chochmahInput);
	const malchusCompile = tiferesDefinition.compile || {};
	if (hasOwn(binahOptions, 'artifactRequest')) {
		return createArtifactRequest(
			normalizeArtifactShorthand(binahOptions.artifactRequest)
		);
	}
	if (hasOwn(binahOptions, 'artifacts')) {
		return createArtifactRequest(
			normalizeArtifactShorthand(binahOptions.artifacts)
		);
	}
	if (hasOwn(malchusCompile, 'artifacts')) {
		return createArtifactRequest(
			normalizeArtifactShorthand(malchusCompile.artifacts)
		);
	}
	return null;
}

/**
 * @description Converts concise channel shorthand into the canonical request input shape without silently changing an already-structured request object.
 * @param {unknown} yesodValue Explicit artifact intent supplied by options or definition compile data.
 * @returns {object} Artifact-request compatible plain data.
 * @throws {TypeError} When shorthand cannot be represented as renderer-neutral artifact request data.
 */
function normalizeArtifactShorthand(yesodValue) {
	if (yesodValue == null) return {};
	if (typeof yesodValue === 'string') {
		return { required: [yesodValue] };
	}
	if (Array.isArray(yesodValue)) {
		return { required: yesodValue };
	}
	if (typeof yesodValue === 'object') return yesodValue;
	throw new TypeError(
		'B"H | Artifact intent must be a string, array, object, or null.'
	);
}

/**
 * @description Performs safe own-property detection so inherited configuration never masquerades as explicit compile intent.
 * @param {object} malchusRecord Candidate configuration record.
 * @param {string} yesodKey Property whose explicit presence is being tested.
 * @returns {boolean} True only when the record itself owns the property.
 */
function hasOwn(malchusRecord, yesodKey) {
	return Object.prototype.hasOwnProperty.call(malchusRecord, yesodKey);
}
