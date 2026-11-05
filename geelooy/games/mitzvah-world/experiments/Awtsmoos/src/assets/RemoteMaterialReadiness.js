//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialReadiness.js
 * @description Chooses viable remote candidates and grants readiness only to images with verified HTTP(S) provenance.
 * The Awtsmoos is beyond failure and retry while every finite URL walks an ordered gate;
 * Awtsmoos.com reveals one material only after distant image evidence arrives, never because local pixels merely imitate.
 */

import {
	cachedTextureImage,
	publicMaterialLoading,
	publicMaterialUrlRecord
} from './PublicMaterialCacheState.js';
import {
	materialHasRealMap,
	materialHasRejectedGeneratedMap,
	isRealMaterialImage
} from './RemoteMaterialImageValidity.js';
import { inferRemoteMaterialIdentity } from './RemoteMaterialRoleInference.js';

/** Prepares one material for bounded hydration and returns immutable readiness evidence. */
export function prepareRemoteMaterialForHydration(object, material) {
	const receipt = remoteMaterialReadiness(object, material);
	if (receipt.ready || !receipt.selectedUrl) {
		return receipt;
	}
	assignRemoteIdentity(material, receipt);
	return remoteMaterialReadiness(object, material);
}

/** Classifies one material without initiating network I/O. */
export function remoteMaterialReadiness(object, material = {}) {
	if (materialHasRealMap(material)) {
		return evidence('ready', true, material.textureUrl || null, inferRemoteMaterialIdentity(object, material));
	}
	const identity = inferRemoteMaterialIdentity(object, material);
	const selectedUrl = selectRemoteCandidate(identity.candidates);
	if (!identity.candidates.length) {
		const state = materialHasRejectedGeneratedMap(material) ? 'non-remote-rejected' : 'missing-role';
		return evidence(state, false, null, identity);
	}
	if (!selectedUrl) {
		return evidence('all-failed', false, null, identity);
	}
	const cached = cachedTextureImage(selectedUrl);
	const state = isRealMaterialImage(cached)
		? 'cached-awaiting-bind'
		: publicMaterialLoading(selectedUrl) ? 'loading' : 'pending';
	return evidence(state, false, selectedUrl, identity);
}

/** Selects remote-proven cached/loading/not-yet-failed candidates in deterministic order. */
export function selectRemoteCandidate(candidates = []) {
	for (const url of candidates) {
		if (isRealMaterialImage(cachedTextureImage(url))) {
			return url;
		}
	}
	for (const url of candidates) {
		if (publicMaterialLoading(url)) {
			return url;
		}
	}
	return candidates.find((url) => publicMaterialUrlRecord(url)?.ok !== false) || null;
}

function assignRemoteIdentity(material, receipt) {
	try {
		material.textureUrl = receipt.selectedUrl;
		material.mapRepeat ||= [...receipt.repeat];
		material.texturePolicy = {
			...(material.texturePolicy || {}),
			remoteOnly: true,
			semanticRole: receipt.role || null
		};
		material.userData = {
			...(material.userData || {}),
			awtsmoosRemoteCandidates: [...receipt.candidates]
		};
	} catch {
		// Frozen materials remain hidden unless their image itself carries verified remote provenance.
	}
}

function evidence(state, ready, selectedUrl, identity) {
	return Object.freeze({
		candidates: identity.candidates,
		ready,
		repeat: identity.repeat,
		role: identity.role,
		selectedUrl,
		state
	});
}
