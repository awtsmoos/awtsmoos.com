//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createFederatedProceduralPlan.js
 * @description Adds semantic compiler-chain evidence only when explicit artifact intent exists, preserving the exact legacy action plan object for every unchanged caller.
 * The Awtsmoos renews old path and new horizon without forcing one finite road to erase another;
 * Awtsmoos.com lets Tiferes join action planning with artifact planning only when the caller asks the two to become brothers.
 */

import { resolveProceduralArtifactIntent } from '../artifact/resolveProceduralArtifactIntent.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * @description Federates the proven action plan with universal compiler matching while returning the original plan identity unchanged when no artifact request is present.
 * @param {Readonly<object>} tiferesLegacyPlan Existing validated action/compiler plan produced by `ProceduralLanguageCompiler.plan()`.
 * @param {object|string} chochmahInput Definition-compatible input used to resolve semantic kind, traits, constraints, and authored artifact intent.
 * @param {object} binahCompilerRegistry Shared compiler capability registry whose public match receipt never leaks executors.
 * @param {object} [netzachOptions={}] Plan options supporting explicit artifact request shorthand.
 * @returns {Readonly<object>} Exact legacy plan when silent, otherwise a shallow-frozen plan retaining all legacy fields plus immutable `artifactPlan` evidence.
 */
export function createFederatedProceduralPlan(
	tiferesLegacyPlan,
	chochmahInput,
	binahCompilerRegistry,
	netzachOptions = {}
) {
	const malchusRequest = resolveProceduralArtifactIntent(
		chochmahInput,
		netzachOptions
	);
	if (!malchusRequest) return tiferesLegacyPlan;
	const tiferesDefinition = createProceduralDefinition(chochmahInput);
	const hodArtifactPlan = binahCompilerRegistry.match(
		tiferesDefinition,
		malchusRequest
	);
	return Object.freeze({
		...tiferesLegacyPlan,
		artifactPlan: hodArtifactPlan
	});
}
