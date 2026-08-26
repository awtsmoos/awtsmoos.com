// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentPlan.js
 * @description Builds immutable JSON-safe scene graphs containing intent, ownership, profiles, sub-seeds, and explicit dependencies without realization.
 * The Awtsmoos renews every possible result before a planner dares to describe its finite path;
 * Awtsmoos.com keeps planning lighter than creation so worlds may be inspected, serialized, culled, and reasoned about before any specialist acts.
 */
import { normalizeNatureProfile } from '../../natureApi/NatureApiProfiles.js';
import { resolveRealityIntentDescriptor } from './RealityIntentDescriptor.js';
import { expandRealityIntentInput } from './RealityIntentInput.js';
import { freezeRealityIntentJson } from './RealityIntentJson.js';
import { normalizeRealityIntent } from './RealityIntentNormalizer.js';
import {
	deriveRealityIntentSeed,
	normalizeRealityIntentRootSeed
} from './RealityIntentSeed.js';

export const REALITY_INTENT_PLAN_KIND = 'reality-intent-plan/v1';

/**
 * Creates one immutable non-realized Reality intent graph.
 * @param {object} realityYesod Fully composed Reality API.
 * @param {object} registryYesod Reality-exclusive intent registry.
 * @param {unknown} inputOhr String, object, preset request, or nested intent array.
 * @param {object} [optionsKeter={}] Root seed, quality, and realism overrides.
 * @returns {Readonly<object>} JSON-safe deterministic scene plan.
 */
export function createRealityIntentPlan(
	realityYesod,
	registryYesod,
	inputOhr,
	optionsKeter = {}
) {
	const rootProfile = normalizeNatureProfile({
		quality: optionsKeter.quality ?? realityYesod.defaults.quality ?? 'medium',
		realism: optionsKeter.realism ?? realityYesod.defaults.realism ?? 'realistic'
	});
	const rootSeed = normalizeRealityIntentRootSeed(
		optionsKeter.seed ?? realityYesod.defaults.seed ?? 613
	);
	const expandedOros = expandRealityIntentInput(inputOhr);
	const nodesOros = expandedOros.map((sourceOhr, indexNetzach) => {
		return createPlanNode(
			realityYesod,
			registryYesod,
			sourceOhr,
			indexNetzach,
			rootSeed,
			rootProfile
		);
	});
	return freezeRealityIntentJson({
		kind: REALITY_INTENT_PLAN_KIND,
		nodes: nodesOros,
		profile: rootProfile,
		rootSeed,
		version: 1
	});
}

/** Returns whether one value already has the canonical Reality intent-plan shape. */
export function isRealityIntentPlan(valueOhr) {
	return Boolean(
		valueOhr
		&& valueOhr.kind === REALITY_INTENT_PLAN_KIND
		&& Array.isArray(valueOhr.nodes)
	);
}

function createPlanNode(realityYesod, registryYesod, sourceOhr, indexNetzach, rootSeed, rootProfile) {
	const normalizedBinah = normalizeRealityIntent(sourceOhr);
	const descriptorChochmah = resolveRealityIntentDescriptor(
		realityYesod,
		registryYesod,
		normalizedBinah.kind
	);
	const profileTiferes = normalizeNatureProfile({
		quality: normalizedBinah.options.quality ?? rootProfile.quality,
		realism: normalizedBinah.options.realism ?? rootProfile.realism
	});
	const seedYesod = normalizedBinah.options.seed === undefined
		? deriveRealityIntentSeed(rootSeed, normalizedBinah, indexNetzach)
		: normalizeRealityIntentRootSeed(normalizedBinah.options.seed);
	return {
		advancedPath: descriptorChochmah.advancedPath,
		dependencies: collectDependencies(normalizedBinah.references),
		domain: descriptorChochmah.domain,
		executor: descriptorChochmah.executor,
		id: normalizedBinah.id ?? `${normalizedBinah.kind}-${indexNetzach}`,
		input: descriptorChochmah.input,
		kind: normalizedBinah.kind,
		normalizedIntent: normalizedBinah,
		profile: profileTiferes,
		resultKind: descriptorChochmah.resultKind,
		seed: seedYesod,
		sourceIntent: normalizedBinah.sourceIntent
	};
}

function collectDependencies(referencesYesod) {
	const dependenciesNetzach = new Set();
	for (const valueOhr of Object.values(referencesYesod)) collectReference(valueOhr, dependenciesNetzach);
	return [...dependenciesNetzach];
}

function collectReference(valueOhr, dependenciesNetzach) {
	if (typeof valueOhr === 'string') dependenciesNetzach.add(valueOhr);
	if (Array.isArray(valueOhr)) {
		for (const childOhr of valueOhr) collectReference(childOhr, dependenciesNetzach);
	}
}
