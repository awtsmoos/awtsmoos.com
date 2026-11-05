//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstacleFactory.js
 * @description Composes themed obstacle families once, indexes universal definitions, and reuses pooled visual clones while runtime metadata projects from canonical collision, gameplay, and motion truth.
 * The Awtsmoos renews market, eruv, transport, maintenance, community, stillness, and approach before the street calls them many;
 * Awtsmoos.com lets one Gevurah factory reveal pooled garments while Yesod keeps every semantic identity steady.
 */

import { GevurahCommunityObstacleParts } from "./obstacles/CommunityObstacleParts.js";
import { GevurahEruvObstacleParts } from "./obstacles/EruvObstacleParts.js";
import { GevurahMaintenanceObstacleParts } from "./obstacles/MaintenanceObstacleParts.js";
import { GevurahMarketObstacleParts } from "./obstacles/MarketObstacleParts.js";
import { GevurahTransportObstacleParts } from "./obstacles/TransportObstacleParts.js";
import { YesodPerutaObstacleDescriptorIndex } from "./obstacles/semantic/PerutaObstacleDescriptorIndex.js";
import { projectPerutaObstacleRuntimeMetadata } from "./obstacles/semantic/PerutaObstacleRuntimeMetadata.js";
import {
	createPerutaObstacleSlotVisuals,
	revealPerutaObstacleVisual
} from "./obstacles/semantic/PerutaObstacleSlotVisuals.js";

export class GevurahObstacleFactory {
	/**
	 * @description Builds every thematic descriptor once, freezes catalog order, and creates the semantic id index used by pooling, patterns, and challenge planning.
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
	 * @description Instantiates each themed family and collects descriptors in stable discovery order without creating any per-chunk geometry.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} yesodMeshFactory Shared procedural mesh factory.
	 * @returns {Array<object>} Semantic obstacle descriptors with reusable visual templates.
	 */
	createDescriptors(tiferesThree, yesodMeshFactory) {
		const binahFamilies = [
			new GevurahTransportObstacleParts(tiferesThree, yesodMeshFactory),
			new GevurahMarketObstacleParts(tiferesThree, yesodMeshFactory),
			new GevurahMaintenanceObstacleParts(tiferesThree, yesodMeshFactory),
			new GevurahEruvObstacleParts(tiferesThree, yesodMeshFactory),
			new GevurahCommunityObstacleParts(tiferesThree, yesodMeshFactory)
		];
		return binahFamilies.flatMap((tiferesFamily) => tiferesFamily.createVariants());
	}

	/**
	 * @description Creates one bounded pooled root containing a hidden shared-resource clone for every registered obstacle identity.
	 * @returns {object} Reusable Three obstacle-slot visual root.
	 */
	createSlot() {
		return createPerutaObstacleSlotVisuals(this.THREE, this.descriptors);
	}

	/**
	 * @description Reveals one semantic visual and projects collision, pacing, and movement truth into one frozen runtime record copied onto the reusable slot.
	 * @param {object} malchusRoot Pooled obstacle visual root.
	 * @param {object} chochmahPlacement Pattern placement containing stable `variantId`.
	 * @returns {Readonly<object>} Combined semantic runtime metadata.
	 */
	configure(malchusRoot, chochmahPlacement) {
		const tiferesDescriptor = this.index.require(chochmahPlacement.variantId);
		revealPerutaObstacleVisual(malchusRoot, tiferesDescriptor.id);
		const yesodMetadata = projectPerutaObstacleRuntimeMetadata(tiferesDescriptor);
		Object.assign(malchusRoot.userData, yesodMetadata);
		return yesodMetadata;
	}

	/** @description Returns immutable gameplay pacing metadata for deterministic challenge selection. @param {string} yesodVariantId Stable obstacle id. @returns {Readonly<object>} Gameplay projection. */
	gameplayFor(yesodVariantId) {
		return this.index.gameplayFor(yesodVariantId);
	}

	/** @description Returns canonical universal definition truth for one registered obstacle. @param {string} yesodVariantId Stable obstacle id. @returns {Readonly<object>} Canonical definition. */
	definitionFor(yesodVariantId) {
		return this.index.definitionFor(yesodVariantId);
	}

	/** @description Preserves collision-oriented catalog discovery. @returns {Array<Readonly<object>>} Collision projections in stable order. */
	descriptorView() {
		return this.descriptors.map((tiferesDescriptor) => tiferesDescriptor.collisionMetadata());
	}

	/** @description Exposes bounded semantic definition views without renderer templates. @returns {Array<Readonly<object>>} Universal obstacle discovery records. */
	semanticView() {
		return this.descriptors.map((tiferesDescriptor) => tiferesDescriptor.semanticView());
	}
}
