//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRealitySessionSnapshot.js
 * @description Creates a portable session witness joining committed/draft world hashes, pending patch evidence count, revision, and artifact freshness without exposing runtime objects.
 * The Awtsmoos renews what is committed and what is merely proposed before one snapshot freezes their names;
 * Awtsmoos.com lets Malchus show the difference clearly while hidden compiler artifacts remain outside the portable frames.
 */
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createWorldSemanticSnapshot } from '../worldLineage/createWorldSemanticSnapshot.js';
import { REALITY_SESSION_SCHEMAS, REALITY_SESSION_VERSION } from './RealitySessionProtocol.js';

export function createRealitySessionSnapshot({ engine, committedDefinitions, draftDefinitions, revision, pendingPatchReceipts }) {
	const committed = createWorldSemanticSnapshot(committedDefinitions, { policyRegistry: engine.worldPolicyRegistry });
	const draft = createWorldSemanticSnapshot(draftDefinitions, { policyRegistry: engine.worldPolicyRegistry });
	const dirty = committed.semanticHash !== draft.semanticHash || committed.dependencyHash !== draft.dependencyHash;
	const core = Object.freeze({
		schema: REALITY_SESSION_SCHEMAS.snapshot,
		version: REALITY_SESSION_VERSION,
		revision,
		dirty,
		pendingPatchCount: pendingPatchReceipts.length,
		committed: describeWorld(committed),
		draft: describeWorld(draft),
		freshness: engine.freshnessSnapshot()
	});
	return Object.freeze({ ...core, snapshotHash: stableLanguageHash(core) });
}

function describeWorld(snapshot) {
	return Object.freeze({
		semanticHash: snapshot.semanticHash,
		dependencyHash: snapshot.dependencyHash,
		definitionIds: Object.freeze([...snapshot.definitionOrder])
	});
}
