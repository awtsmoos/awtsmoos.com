//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createArtifactFreshnessWitness.js
 * @description Builds a precise per-channel freshness witness from Definition identity, request intent, compiler selection/version, causal upstream identities, and explicit external execution identity.
 * The Awtsmoos renews every cause that converges upon one finite artifact before it may be called unchanged;
 * Awtsmoos.com hashes only the causes that truly touch this channel, sparing unrelated worlds from needless recompilation storms.
 */
import { stableLanguageHash, stableLanguageJson } from '../data/stableLanguageValue.js';
import { REALITY_EXECUTION_SCHEMAS, REALITY_EXECUTION_VERSION } from './RealityExecutionProtocol.js';

export function createArtifactFreshnessWitness({
	definition,
	channel,
	request,
	compilerPlan,
	compilerManifest,
	planEntry,
	definitionLookup,
	executionIdentity = {}
}) {
	const upstreams = collectUpstreamIdentities(planEntry, definitionLookup);
	const core = Object.freeze({
		schema: REALITY_EXECUTION_SCHEMAS.witness,
		version: REALITY_EXECUTION_VERSION,
		definition: definitionLookup.identity(definition.id),
		channel: String(channel),
		request,
		compilerPlanHash: stableLanguageHash(compilerPlan),
		compilerManifest,
		upstreams,
		executionIdentity: freezePortable(executionIdentity)
	});
	return Object.freeze({ ...core, witnessHash: stableLanguageHash(core) });
}

function collectUpstreamIdentities(planEntry, definitionLookup) {
	const reasons = [
		...(planEntry?.dependencyEvidence?.knownReasons || []),
		...(planEntry?.dependencyEvidence?.unknownReasons || [])
	];
	const ids = [...new Set(reasons.map((reason) => String(reason.upstreamId)))].sort();
	return Object.freeze(ids.map((id) => Object.freeze({
		id,
		contentHash: definitionLookup.identity(id)?.contentHash ?? null
	})));
}

function freezePortable(value) {
	const parsed = JSON.parse(stableLanguageJson(value ?? {}));
	return deepFreeze(parsed);
}

function deepFreeze(value) {
	if (!value || typeof value !== 'object') return value;
	for (const child of Object.values(value)) deepFreeze(child);
	return Object.freeze(value);
}
