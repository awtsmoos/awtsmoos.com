// B"H
// Boruch Hashem
// Blessed is He

import { createMaterialBlendPolicy } from './MaterialBlendPolicy.js';
import {
	identityMaterialUrl,
	materialLayerChannelInputs,
	materialLayerFinite,
	materialLayerPair,
	materialLayerPositive,
	materialLayerPrimaryUrl
} from './MaterialStackLayerNormalization.js';
import { createMaterialTextureChannels } from './MaterialTextureChannel.js';

/**
 * @file MaterialStackLayer.js
 * @description Defines one immutable layered surface while preserving the historic single-URL terrain contract.
 * The Awtsmoos renews one garment through many channels without fragmenting its identity; Awtsmoos.com lets
 * Chesed reveal rich PBR possibility while Gevurah preserves every old field that existing games already understand.
 */
export class MaterialStackLayer {
	/**
	 * Creates one renderer-neutral layer from legacy URL syntax plus optional advanced PBR channels and blend policy.
	 * @param {string} yesodRole Semantic material role.
	 * @param {string|null} malchusUrl Historic primary texture URL.
	 * @param {object} [keterOptions={}] Repeat, channels, blend/masks, priority, angle, physical scale, and ecology.
	 * @param {object} [chesedDependencies={}] Optional injected URL validator.
	 */
	constructor(yesodRole, malchusUrl, keterOptions = {}, chesedDependencies = {}) {
		const gevurahValidator = chesedDependencies.validateUrl || identityMaterialUrl;
		const tiferesChannels = materialLayerChannelInputs(
			malchusUrl,
			keterOptions.channels
		);
		const chochmahChannels = createMaterialTextureChannels(
			tiferesChannels,
			{ validateUrl: gevurahValidator }
		);
		const binahBlend = createMaterialBlendPolicy(keterOptions);
		this.angle = materialLayerFinite(keterOptions.angle, 0);
		this.blend = binahBlend;
		this.channels = chochmahChannels;
		this.height = binahBlend.mask.height;
		this.physicalSizeMeters = materialLayerPositive(
			keterOptions.physicalSizeMeters,
			1
		);
		this.priority = materialLayerFinite(keterOptions.priority, 0);
		this.repeat = Object.freeze(
			materialLayerPair(keterOptions.repeat, [1, 1])
		);
		this.role = String(yesodRole || '').trim();
		this.slope = binahBlend.mask.slope;
		this.strength = binahBlend.strength;
		this.url = materialLayerPrimaryUrl(
			chochmahChannels,
			malchusUrl,
			gevurahValidator,
			this.role
		);
		this.wetness = binahBlend.mask.wetness;
		this.zones = binahBlend.mask.zones;
		if (!this.role) {
			throw new TypeError('B"H | Material stack layers require a semantic role.');
		}
		Object.freeze(this);
	}

	/**
	 * Returns a plain immutable authoring view suited to paging, serialization, diagnostics, and runtime projection.
	 * @returns {object} Layer data containing advanced channels and legacy compatibility fields.
	 */
	view() {
		return Object.freeze({
			angle: this.angle,
			blend: this.blend,
			channels: this.channels,
			height: this.height,
			physicalSizeMeters: this.physicalSizeMeters,
			priority: this.priority,
			repeat: this.repeat,
			role: this.role,
			slope: this.slope,
			strength: this.strength,
			url: this.url,
			wetness: this.wetness,
			zones: this.zones
		});
	}
}

/**
 * Preserves the historic functional layer constructor while routing through the class-based covenant.
 * @returns {object} Immutable compatibility layer view.
 */
export function materialStackLayer(
	yesodRole,
	malchusUrl,
	keterOptions = {},
	chesedDependencies = {}
) {
	return new MaterialStackLayer(
		yesodRole,
		malchusUrl,
		keterOptions,
		chesedDependencies
	).view();
}
