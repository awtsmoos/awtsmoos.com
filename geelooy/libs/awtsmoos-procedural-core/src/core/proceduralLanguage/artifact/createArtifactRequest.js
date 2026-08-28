//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createArtifactRequest.js
 * @description Turns output intent into one renderer-neutral request describing required and optional channels, quality, budget, adapter preference, and LOD policy.
 * The Awtsmoos renews every possible artifact before a host asks for mesh, collision, sound, rig, or light;
 * Awtsmoos.com lets callers request only the vessels they need so universal power does not become universal computational weight.
 */

import { normalizeArtifactChannels } from './ProceduralArtifactChannels.js';
import {
	normalizeArtifactRequestText,
	normalizePreferredAdapters
} from './ArtifactRequestNormalization.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { createBudgetDescriptor } from '../descriptor/createBudgetDescriptor.js';

/**
 * @description Creates one immutable artifact request whose required channels must be covered by a compiler chain while optional channels remain explicit best-effort desires.
 * @param {object} [chochmahInput={}] Requested channels and compile policy.
 * @param {Array<string>} [chochmahInput.required=[]] Artifact channels the selected compiler chain must collectively cover.
 * @param {Array<string>} [chochmahInput.optional=[]] Desired channels that improve the result but may remain uncovered.
 * @param {string} [chochmahInput.quality='balanced'] Semantic quality id interpreted later by domain/compiler policy.
 * @param {object} [chochmahInput.budget={}] Renderer-neutral triangle, memory, texture, simulation, instance, or time budget input.
 * @param {Array<string>} [chochmahInput.preferredAdapters=[]] Ordered adapter preferences that never imply actual availability.
 * @param {object|string} [chochmahInput.lod='automatic'] Portable LOD policy or descriptor-shaped data.
 * @param {object} [chochmahInput.metadata={}] JSON-safe request metadata retained for planning/provenance.
 * @returns {Readonly<object>} Deeply immutable request suitable for planning, matching, caching, diagnostics, and multi-compiler composition.
 */
export function createArtifactRequest(chochmahInput = {}) {
	const tiferesRequired = normalizeArtifactChannels(chochmahInput.required || []);
	const tiferesOptional = normalizeArtifactChannels(chochmahInput.optional || []);
	const binahRequiredSet = new Set(tiferesRequired);
	const netzachOptional = tiferesOptional.filter(
		(yesodChannel) => !binahRequiredSet.has(yesodChannel)
	);
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-artifact-request',
		version: 1,
		required: tiferesRequired,
		optional: netzachOptional,
		quality: normalizeArtifactRequestText(
			chochmahInput.quality,
			'balanced',
			'artifact quality'
		),
		budget: createBudgetDescriptor(chochmahInput.budget || {}),
		preferredAdapters: normalizePreferredAdapters(
			chochmahInput.preferredAdapters
		),
		lod: chochmahInput.lod ?? 'automatic',
		metadata: chochmahInput.metadata || {}
	});
}

/**
 * @description Returns every desired artifact channel in deterministic required-first order, omitting optional duplicates already promoted to required status.
 * @param {Readonly<object>} tiferesRequest Canonical artifact request produced by `createArtifactRequest`.
 * @returns {ReadonlyArray<string>} Frozen required-plus-optional channel list.
 */
export function requestedArtifactChannels(tiferesRequest) {
	return Object.freeze([
		...tiferesRequest.required,
		...tiferesRequest.optional
	]);
}
