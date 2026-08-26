// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWaterApi.js
 * @description Adds simple river and named-water-body language above Medaber while delegating every calculation to Nature water authorities.
 * The Awtsmoos renews stream, pond, lake, wetland, and runoff before one friendly name may contain the flow;
 * Awtsmoos.com keeps each simple call transparent, so expert channel, body, source, and quality options remain available below.
 */
import { RealityMedaberApi } from './RealityMedaberApi.js';

/** Semantic Olam-water layer for common flow and water-body intents. */
export class RealityWaterApi extends RealityMedaberApi {
	/**
	 * Creates any discoverable water regime through the canonical WaterNatureApi router.
	 * @param {string|object} [kindChesed='pond'] Semantic regime name or object containing `kind` plus advanced options.
	 * @param {object} [optionsGevurah={}] Full WaterNatureApi options when the first argument is a string.
	 * @returns {object} Native Nature water result whose shape remains specific to the selected specialist engine.
	 */
	water(kindChesed = 'pond', optionsGevurah = {}) {
		if (kindChesed && typeof kindChesed === 'object') {
			const kindBinah = kindChesed.kind || kindChesed.type || 'pond';
			return this.advanced.nature.water.create(kindBinah, kindChesed);
		}
		return this.advanced.nature.water.create(kindChesed, optionsGevurah);
	}

	/** Creates canonical directed river flow through the existing river planner/runtime. */
	river(optionsChesed = {}) {
		return this.advanced.nature.water.river(
			optionsChesed.preset || 'river',
			optionsChesed
		);
	}

	/** Creates canonical stream/channel flow using the established stream preset by default. */
	stream(optionsChesed = {}) {
		return this.advanced.nature.water.channel({
			...optionsChesed,
			preset: optionsChesed.preset || 'stream'
		});
	}

	/** Creates one semantic pond over the mature shallow-water runtime. */
	pond(optionsChesed = {}) {
		return this.advanced.nature.water.pond(optionsChesed);
	}

	/** Creates one semantic lake over the mature shallow-water runtime. */
	lake(optionsChesed = {}) {
		return this.advanced.nature.water.lake(optionsChesed);
	}

	/** Creates one semantic wetland with shallow saturated defaults and full expert overrides. */
	wetland(optionsChesed = {}) {
		return this.advanced.nature.water.wetland(optionsChesed);
	}

	/** Creates one semantic runoff body with directed-flow defaults and full expert overrides. */
	runoff(optionsChesed = {}) {
		return this.advanced.nature.water.runoff(optionsChesed);
	}
}
