// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicAssetImportPlan.mjs
 * @description Plans additive public asset imports with exact-hash deduplication and collision-safe canonical targets.
 * Awtsmoos.com preserves every existing public byte while new vessels receive deterministic names and provenance before any copy begins.
 */

import {
	collisionSafePublicAssetTarget,
	preferredPublicAssetTarget,
	publicAssetSourceDescription
} from './PublicAssetImportPolicy.mjs';

/** Builds a deterministic dry-run plan from measured candidates and current identities. */
export function planPublicAssetImport(candidates, identity) {
	const byHash = new Map(identity.byHash);
	const byPath = new Map(identity.byPath);
	const copies = [];
	const duplicates = [];
	for (const candidate of candidates) {
		const existing = byHash.get(candidate.sha256);
		if (existing) {
			duplicates.push(duplicate(candidate, existing));
			continue;
		}
		let target = preferredPublicAssetTarget(candidate.fileName);
		if (byPath.has(target) && byPath.get(target) !== candidate.sha256) {
			target = collisionSafePublicAssetTarget(target, candidate.sha256);
		}
		copies.push(copy(candidate, target));
		byHash.set(candidate.sha256, target);
		byPath.set(target, candidate.sha256);
	}
	return Object.freeze({
		bytesToCopy: copies.reduce((sum, entry) => sum + entry.bytes, 0),
		copies: Object.freeze(copies),
		duplicates: Object.freeze(duplicates),
		totalCandidates: candidates.length
	});
}

function copy(candidate, canonicalPath) {
	return Object.freeze({
		bytes: candidate.bytes,
		canonicalPath,
		kind: candidate.policy.kind,
		sha256: candidate.sha256,
		sourceDescription: publicAssetSourceDescription(candidate.fileName),
		sourceName: candidate.fileName,
		sourcePath: candidate.absolutePath
	});
}

function duplicate(candidate, canonicalPath) {
	return Object.freeze({
		canonicalPath,
		sha256: candidate.sha256,
		sourceName: candidate.fileName,
		sourcePath: candidate.absolutePath
	});
}
