//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstacleFactory.js
  * @description Composes themed obstacle families once, indexes their universal definitions, and reuses pooled visual clones while
  * collision/gameplay metadata projects from canonical semantic truth.
 * The Awtsmoos renews market, eruv, transport, maintenance, and community before the street may call them many;
 * Awtsmoos.com lets one Gevurah factory reveal their pooled garments while Yesod keeps every semantic identity steady.
 */

import { GevurahCommunityObstacleParts } from "./obstacles/CommunityObstacleParts.js";
import { GevurahEruvObstacleParts } from "./obstacles/EruvObstacleParts.js";
import { GevurahMaintenanceObstacleParts } from "./obstacles/MaintenanceObstacleParts.js";
import { GevurahMarketObstacleParts } from "./obstacles/MarketObstacleParts.js";
import { GevurahTransportObstacleParts } from "./obstacles/TransportObstacleParts.js";
import { YesodPerutaObstacleDescriptorIndex } from "./obstacles/semantic/PerutaObstacleDescriptorIndex.js";
import {
	createPerutaObstacleSlotVisuals,
	revealPerutaObstacleVisual
} from "./obstacles/semantic/PerutaObstacleSlotVisuals.js";

export class GevurahObstacleFactory {
	/**
	 * @description Builds every family descriptor once, freezes catalog order, and creates the stable semantic id index used by both world pooling and challenge planning.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 */
	constructor(tiferesThree, yesodMeshFactory) {
		this.THREE = tiferesThree;
		this.descriptors = Object.freeze(
			this.createDescriptors(tiferesThree, yesodMeshFactory)
		);
		this.index = new YesodPerutaObstacleDescriptorIndex(this.descriptors);
	}

	/**
	 * @description Instantiates family factories and collects their semantic descriptors in stable discovery order without building pool-slot copies yet.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} yesodMeshFactory Shared procedural mesh factory.
	 * @returns {Array<object>} Themed universal obstacle descriptors.
	 */
	createDescriptors(tiferesThree, yesodMeshFactory) {
		const binahFamilies = [
			new GevurahTransportObstacleParts(tiferesThree, yesodMeshFactory),
			new GevurahMarketObstacleParts(tiferesThree, yesodMeshFactory),
			new GevurahMaintenanceObstacleParts(tiferesThree, yesodMeshFactory),
			new GevurahEruvObstacleParts(tiferesThree, yesodMeshFactory),
			new GevurahCommunityObstacleParts(tiferesThree, yesodMeshFactory)
		];
		return binahFamilies.flatMap((family) => family.createVariants());
	}

	/**
	 * @description Creates one bounded pooled visual root containing one hidden shared-resource clone per registered semantic obstacle.
	 * @returns {object} Reusable Three obstacle slot root.
	 */
	createSlot() {
		return createPerutaObstacleSlotVisuals(this.THREE, this.descriptors);
	}

	/**
	 * @description Reveals one semantic visual and returns a combined immutable-source projection suitable for copying onto the reusable collision slot record.
	 * @param {object} malchusRoot Pooled obstacle visual root.
	 * @param {object} chochmahPlacement Pattern placement containing stable `variantId`.
	 * @returns {Readonly<object>} Collision plus safe gameplay semantic metadata.
	 */
	configure(malchusRoot, chochmahPlacement) {
		const tiferesDescriptor = this.index.require(chochmahPlacement.variantId);
		revealPerutaObstacleVisual(malchusRoot, tiferesDescriptor.id);
		const yesodMetadata = Object.freeze({
			...tiferesDescriptor.collisionMetadata(),
			...tiferesDescriptor.gameplayMetadata()
		});
		Object.assign(malchusRoot.userData, yesodMetadata);
		return yesodMetadata;
	}

	/**
	 * @description Returns immutable gameplay trait values for deterministic challenge planning.
	 * @param {string} yesodVariantId Stable semantic variant id.
	 * @returns {Readonly<object>} Gameplay projection.
	 */
	gameplayFor(yesodVariantId) {
		return this.index.gameplayFor(yesodVariantId);
	}

	/**
	 * @description Returns canonical universal definition truth for one registered obstacle.
	 * @param {string} yesodVariantId Stable semantic variant id.
	 * @returns {Readonly<object>} Canonical definition.
	 */
	definitionFor(yesodVariantId) {
		return this.index.definitionFor(yesodVariantId);
	}

	/** @description Preserves the prior collision-oriented catalog discovery contract. @returns {Array<Readonly<object>>} Collision projections in stable catalog order. */
	descriptorView() {
		return this.descriptors.map((descriptor) => descriptor.collisionMetadata());
	}

	/** @description Exposes bounded semantic definition views without renderer templates. @returns {Array<Readonly<object>>} Universal obstacle discovery views. */
	semanticView() {
		return this.descriptors.map((descriptor) => descriptor.semanticView());
	}
}
