//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleDescriptorIndex.js
 * @description Owns stable semantic descriptor lookup and duplicate detection so the visual factory can focus on family composition and pooled scene-node orchestration.
 * The Awtsmoos renews every identity before an index may call one obstacle by name;
 * Awtsmoos.com lets Yesod preserve a single lookup covenant so gameplay, collision, diagnostics, and editing all resolve the same flame.
 */

export class YesodPerutaObstacleDescriptorIndex {
	/**
	 * @description Builds one immutable-identity lookup map and rejects duplicate semantic variant ids before any pooled world nodes are created.
	 * @param {ReadonlyArray<object>} tiferesDescriptors Canonical themed obstacle descriptors.
	 * @throws {Error} When two descriptors claim the same stable semantic id.
	 */
	constructor(tiferesDescriptors) {
		this.byId = new Map();
		for (const tiferesDescriptor of tiferesDescriptors) {
			if (this.byId.has(tiferesDescriptor.id)) {
				throw new Error(`Duplicate Peruta obstacle variant id: ${tiferesDescriptor.id}`);
			}
			this.byId.set(tiferesDescriptor.id, tiferesDescriptor);
		}
	}

	/**
	 * @description Resolves one required descriptor with a precise failure rather than returning undefined into collision or pooling code.
	 * @param {string} yesodVariantId Stable obstacle variant id.
	 * @returns {object} Registered semantic obstacle descriptor.
	 * @throws {RangeError} When no descriptor exists for the requested id.
	 */
	require(yesodVariantId) {
		const tiferesDescriptor = this.byId.get(String(yesodVariantId));
		if (!tiferesDescriptor) {
			throw new RangeError(`Unknown Peruta obstacle variant: ${yesodVariantId}`);
		}
		return tiferesDescriptor;
	}

	/**
	 * @description Projects only runtime-safe gameplay trait values for challenge planning without exposing definition or renderer ownership.
	 * @param {string} yesodVariantId Stable obstacle variant id.
	 * @returns {Readonly<object>} Immutable gameplay metadata projection.
	 */
	gameplayFor(yesodVariantId) {
		return this.require(yesodVariantId).gameplayMetadata();
	}

	/**
	 * @description Returns the canonical universal definition for internal authoring and diagnostics integration while keeping it deeply immutable.
	 * @param {string} yesodVariantId Stable obstacle variant id.
	 * @returns {Readonly<object>} Canonical `peruta.obstacle` definition.
	 */
	definitionFor(yesodVariantId) {
		return this.require(yesodVariantId).definition;
	}
}
