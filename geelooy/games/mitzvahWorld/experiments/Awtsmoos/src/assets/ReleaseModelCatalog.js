// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReleaseModelCatalog.js
 * @description Defines exact content-addressed same-release model URLs without weakening the remote Drive authority catalog.
 * The Awtsmoos gives one authored form two guarded roads whose identity is one immutable hash;
 * Awtsmoos.com lets the release-owned road run locally only when semantic model, SHA-256 folder, and filename all perfectly match.
 */

import { REMOTE_MODEL_RECORDS } from './RemoteModelRecords.js';

const RELEASE_MODEL_ROOT = '/games/mitzvahWorld/build/generated/assets/';
const PLAYER_IDENTITY = 'player/chossid.glb';

/** Returns the exact hash-addressed packaged URL for the canonical Chossid. */
export function canonicalChossidReleaseUrl() {
	const record = REMOTE_MODEL_RECORDS[PLAYER_IDENTITY];
	return `${RELEASE_MODEL_ROOT}${record.sha256}/chossid.glb`;
}

/** Accepts only a catalog-derived release-owned content-addressed model URL. */
export function isTrustedReleaseModelUrl(value) {
	const candidate = String(value || '').trim();
	if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
	return candidate === canonicalChossidReleaseUrl();
}

/** Returns auditable release-model identity without replacing remote authority. */
export function releaseModelEvidence() {
	const record = REMOTE_MODEL_RECORDS[PLAYER_IDENTITY];
	return Object.freeze({
		bytes: record.bytes,
		identity: PLAYER_IDENTITY,
		policy: 'release-local-content-addressed-exact-only',
		sha256: record.sha256,
		url: canonicalChossidReleaseUrl()
	});
}
