// B"H
// Boruch Hashem
// Blessed is He
/** @module WorldPublicationAdapter @description Bridges immutable world contracts to a live publication service. */

/** Creates an adapter around a WorldPublicationService-compatible instance. */
export function createWorldPublicationAdapter(service) {
	for (const method of ['publish', 'unpublish', 'getPublic', 'resolveRuntime']) {
		if (typeof service?.[method] !== 'function') {
			throw new TypeError(`World publication service requires ${method}.`);
		}
	}
	return Object.freeze({
		publish(ownerId, worldId) {
			return service.publish(ownerId, worldId);
		},
		unpublish(ownerId, versionId) {
			return service.unpublish(ownerId, versionId);
		},
		getPublic(versionId) {
			return service.getPublic(versionId);
		},
		resolveRuntime(versionId) {
			return service.resolveRuntime(versionId);
		},
		toCreatorWorldVersion(nativeVersion) {
			return Object.freeze({
				id: nativeVersion.id,
				type: 'world',
				state: 'published',
				version: nativeVersion.versionNumber || nativeVersion.version,
				worldId: nativeVersion.worldId,
				payload: nativeVersion.content || nativeVersion.payload || {},
				contentHash: nativeVersion.contentHash || null,
				visibility: nativeVersion.listed === false ? 'unlisted' : 'public',
				publishedAt: nativeVersion.publishedAt || null
			});
		}
	});
}
