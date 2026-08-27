//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralSnapshot.js
 * @description Captures exact definition identity, compile intent, capability context, and optional artifact evidence for deterministic reproduction.
 * The Awtsmoos recreates every instant from nothing while this finite snapshot merely witnesses one declared state;
 * Awtsmoos.com preserves enough truth for another developer or machine to reproduce the vessel without pretending to preserve its fate.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * Creates one immutable portable snapshot suitable for bug reports, cache diagnostics, handoff, or network persistence.
 * @param {object|string} input Definition data, JSON text, or fluent wrapper.
 * @param {object} [options={}] Optional compiler, capability, artifact, and environment evidence.
 * @returns {Readonly<object>} JSON-safe snapshot with deterministic hashes and explicit evidence channels.
 */
export function createProceduralSnapshot(input, options = {}) {
	const definition = createProceduralDefinition(input);
	const artifact = options.artifact || null;
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-snapshot',
		version: 1,
		definition,
		definitionHash: stableLanguageHash(definition),
		compile: definition.compile,
		compiler: options.compiler || null,
		capabilities: options.capabilities || null,
		artifactHash: artifact ? stableLanguageHash(snapshotArtifactIdentity(artifact)) : null,
		environment: options.environment || {},
		metadata: options.metadata || {}
	});
}

/** Reduces large runtime artifacts to stable identity-relevant evidence before hashing. */
function snapshotArtifactIdentity(artifact) {
	return {
		schema: artifact.schema || null,
		version: artifact.version || null,
		definitionId: artifact.definitionId || null,
		definitionHash: artifact.definitionHash || null,
		plan: artifact.plan || null,
		metadata: artifact.metadata || {}
	};
}
