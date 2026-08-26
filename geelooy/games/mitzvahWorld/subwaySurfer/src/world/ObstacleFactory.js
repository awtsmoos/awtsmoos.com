//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstacleFactory.js
 * @description Registers themed obstacle descriptors once, then gives every pooled slot stable semantic identity without rebuilding geometry during chunk recycle.
 * The Awtsmoos renews every finite challenge while one registry joins market, eruv, transport, maintenance, and community light;
 * Awtsmoos.com lets Gevurah reveal the chosen vessel by name so collision stays simple, truthful, and right.
 */

import { GevurahCommunityObstacleParts } from "./obstacles/CommunityObstacleParts.js";
import { GevurahEruvObstacleParts } from "./obstacles/EruvObstacleParts.js";
import { GevurahMaintenanceObstacleParts } from "./obstacles/MaintenanceObstacleParts.js";
import { GevurahMarketObstacleParts } from "./obstacles/MarketObstacleParts.js";
import { GevurahTransportObstacleParts } from "./obstacles/TransportObstacleParts.js";

export class GevurahObstacleFactory {
	/**
	 * Builds every visual descriptor exactly once so later slot clones share geometry and materials.
	 * @param {object} THREE Three namespace.
	 * @param {object} meshFactory Shared procedural-core-backed mesh factory.
	 */
	constructor(THREE, meshFactory) {
		this.THREE = THREE;
		this.descriptors = Object.freeze(this.createDescriptors(THREE, meshFactory));
		this.byId = createDescriptorIndex(this.descriptors);
	}

	/** @private @returns {Array<object>} All themed descriptors in stable discovery order. */
	createDescriptors(THREE, meshFactory) {
		const binahFamilies = [
			new GevurahTransportObstacleParts(THREE, meshFactory),
			new GevurahMarketObstacleParts(THREE, meshFactory),
			new GevurahMaintenanceObstacleParts(THREE, meshFactory),
			new GevurahEruvObstacleParts(THREE, meshFactory),
			new GevurahCommunityObstacleParts(THREE, meshFactory)
		];
		return binahFamilies.flatMap((family) => family.createVariants());
	}

	/**
	 * Creates one bounded pooled slot containing hidden clones whose geometry/material references remain shared.
	 * @returns {object} Reusable slot root.
	 */
	createSlot() {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "PooledJewishCityObstacle";
		malchusRoot.userData.variantNodes = Object.create(null);
		for (const tiferesDescriptor of this.descriptors) {
			const malchusNode = tiferesDescriptor.instantiate();
			malchusRoot.userData.variantNodes[tiferesDescriptor.id] = malchusNode;
			malchusRoot.add(malchusNode);
		}
		return malchusRoot;
	}

	/**
	 * Reveals one stable semantic variant and returns its exact collision covenant.
	 * @param {object} malchusRoot Pooled obstacle root.
	 * @param {object} chochmahPlacement Pattern placement containing variantId.
	 * @returns {Readonly<object>} Variant-specific normalized collision metadata.
	 */
	configure(malchusRoot, chochmahPlacement) {
		const tiferesDescriptor = this.byId.get(chochmahPlacement.variantId);
		if (!tiferesDescriptor) {
			throw new RangeError(`Unknown Peruta obstacle variant: ${chochmahPlacement.variantId}`);
		}
		for (const netzachNode of Object.values(malchusRoot.userData.variantNodes)) {
			netzachNode.visible = false;
		}
		malchusRoot.userData.variantNodes[tiferesDescriptor.id].visible = true;
		const yesodMetadata = tiferesDescriptor.collisionMetadata();
		Object.assign(malchusRoot.userData, yesodMetadata);
		return yesodMetadata;
	}

	/** @returns {Array<object>} Detached immutable discovery records without Three templates. */
	descriptorView() {
		return this.descriptors.map((descriptor) => descriptor.collisionMetadata());
	}
}

/** @private */
function createDescriptorIndex(descriptors) {
	const yesodIndex = new Map();
	for (const tiferesDescriptor of descriptors) {
		if (yesodIndex.has(tiferesDescriptor.id)) {
			throw new Error(`Duplicate Peruta obstacle variant id: ${tiferesDescriptor.id}`);
		}
		yesodIndex.set(tiferesDescriptor.id, tiferesDescriptor);
	}
	return yesodIndex;
}
