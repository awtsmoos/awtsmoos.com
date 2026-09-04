//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file describeRealityCompilerManifest.js
 * @description Captures the accepted compiler capabilities—including compiler versions—that a match receipt alone does not preserve for freshness identity.
 * The Awtsmoos renews the hand that compiles as surely as the Definition being formed;
 * Awtsmoos.com therefore binds the chosen compiler vessel into freshness, so a new compiler version awakens work that old memory had warmed.
 */
import { stableLanguageHash } from '../data/stableLanguageValue.js';

export function describeRealityCompilerManifest(artifactExecution, compilerPlan, provider = null) {
	const acceptedIds = Object.freeze((compilerPlan?.accepted || []).map((match) => String(match.compilerId)).sort());
	const raw = resolveManifestSource(artifactExecution, provider, acceptedIds, compilerPlan);
	const available = normalizeDescriptors(raw);
	const byId = new Map(available.map((descriptor) => [String(descriptor.id ?? descriptor.compilerId), descriptor]));
	const descriptors = Object.freeze(acceptedIds.map((id) => byId.get(id) || fallbackMatch(compilerPlan, id)));
	const core = Object.freeze({ compilerIds: acceptedIds, descriptors });
	return Object.freeze({ ...core, manifestHash: stableLanguageHash(core) });
}

function resolveManifestSource(artifactExecution, provider, acceptedIds, compilerPlan) {
	if (typeof provider === 'function') {
		return provider({ artifactExecution, acceptedIds, compilerPlan });
	}
	return artifactExecution?.compilerRegistry?.describe?.() || [];
}

function normalizeDescriptors(raw) {
	if (Array.isArray(raw)) return raw;
	if (Array.isArray(raw?.compilers)) return raw.compilers;
	if (Array.isArray(raw?.capabilities)) return raw.capabilities;
	return [];
}

function fallbackMatch(compilerPlan, compilerId) {
	return (compilerPlan?.accepted || []).find((match) => String(match.compilerId) === String(compilerId)) || Object.freeze({ compilerId });
}
