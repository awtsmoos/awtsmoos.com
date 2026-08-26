// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentPlanNode.js
 * @description Constructs one fully normalized Reality plan node while keeping the outer graph planner small and declarative.
 * The Awtsmoos renews one intent before profile, seed, authority, option, and dependency can appear as separate facts;
 * Awtsmoos.com gathers those facts into one inspectable vessel so every later graph law and specialist call can trace the same acts.
 */
import { normalizeNatureProfile } from '../../natureApi/NatureApiProfiles.js';
import {
	createRealityIntentNodeOptions
} from './RealityIntentDefaults.js';
import { resolveRealityIntentDescriptor } from './RealityIntentDescriptor.js';
import { normalizeRealityIntent } from './RealityIntentNormalizer.js';
import {
	deriveRealityIntentSeed,
	normalizeRealityIntentRootSeed
} from './RealityIntentSeed.js';

/**
 * Creates one non-realized node with canonical ownership, effective options, profile, seed, and dependencies.
 * @param {object} realityYesod Fully composed Reality API.
 * @param {object} registryYesod Reality-exclusive intent registry.
 * @param {unknown} sourceOhr One already-expanded source intent.
 * @param {number} indexNetzach Authored source index.
 * @param {object} defaultsBinah Canonical root defaults artifact.
 * @returns {object} JSON-safe plan-node data ready for graph validation and freezing.
 */
export function createRealityIntentPlanNode(
	realityYesod,
	registryYesod,
	sourceOhr,
	indexNetzach,
	defaultsBinah
) {
	const normalizedBinah = normalizeRealityIntent(sourceOhr);
	const descriptorChochmah = resolveRealityIntentDescriptor(
		realityYesod,
		registryYesod,
		normalizedBinah.kind
	);
	const profileTiferes = normalizeNatureProfile({
		quality: normalizedBinah.options.quality ?? defaultsBinah.profile.quality,
		realism: normalizedBinah.options.realism ?? defaultsBinah.profile.realism
	});
	const seedYesod = normalizedBinah.options.seed === undefined
		? deriveRealityIntentSeed(defaultsBinah.rootSeed, normalizedBinah, indexNetzach)
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
		options: createRealityIntentNodeOptions(
			defaultsBinah,
			normalizedBinah.options,
			profileTiferes,
			seedYesod
		),
		profile: profileTiferes,
		resultKind: descriptorChochmah.resultKind,
		seed: seedYesod,
		sourceIntent: normalizedBinah.sourceIntent
	};
}

function collectDependencies(referencesYesod) {
	const dependenciesNetzach = new Set();
	for (const valueOhr of Object.values(referencesYesod)) {
		collectReference(valueOhr, dependenciesNetzach);
	}
	return [...dependenciesNetzach];
}

function collectReference(valueOhr, dependenciesNetzach) {
	if (typeof valueOhr === 'string') dependenciesNetzach.add(valueOhr);
	if (Array.isArray(valueOhr)) {
		for (const childOhr of valueOhr) collectReference(childOhr, dependenciesNetzach);
	}
}
