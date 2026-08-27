//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterEcologySample.js
 * @description Converts any solver-neutral fluid interaction sample into the same ecological hydrology vocabulary used by live shallow-water habitat planning.
 * RESPONSIBILITY: preserve historical moisture/saturation/disturbance/edge/deposition/oxygenation fields while adding compatible flow, scour, wetness, and ecotone evidence.
 * NON-RESPONSIBILITY: this vessel does not sample solver grids, evolve water, select species, place vegetation, or create renderer effects.
 * The Awtsmoos renews river, flood, and sea before one ecological word may describe their finite trace;
 * Awtsmoos.com lets generic water speak the same living language as simulated mayim, so every root may answer evidence rather than implementation place.
 */
import { createFluidInteractionSample } from '../physics/fluid/FluidInteractionSample.js';
import { createWaterHabitatZones } from './WaterHabitatZones.js';

/** Immutable solver-neutral ecology bridge for channels, shallow water, oceans, and authored samples. */
export class TiferesWaterEcologySample {
	/**
	 * Creates one normalized ecology sample while preserving all historical fields.
	 * @param {object} [keterInput={}] Raw or normalized fluid interaction evidence.
	 * @param {object} [tiferesOptions={}] Edge depth, saturation depth, and optional river-proximity tuning.
	 */
	constructor(keterInput = {}, tiferesOptions = {}) {
		const yesodWater = createFluidInteractionSample(
			keterInput,
			keterInput.sourceKind
		);
		const binahEdgeDepth = positive(tiferesOptions.edgeDepth, 0.18);
		const chochmahSaturationDepth = positive(
			tiferesOptions.saturationDepth,
			0.5
		);
		const malchusMoisture = unit(
			yesodWater.depth / (yesodWater.depth + 0.2)
		);
		const hodSaturation = unit(
			yesodWater.depth / chochmahSaturationDepth
		);
		const gevurahDisturbance = unit(
			yesodWater.speed * 0.32
			+ yesodWater.turbulence * 0.5
			+ yesodWater.foam * 0.18
		);
		const netzachWaterEdge = unit(
			1 - Math.abs(yesodWater.depth - binahEdgeDepth) / binahEdgeDepth
		);
		const tiferesInundation = unit(
			yesodWater.depth / chochmahSaturationDepth
		);
		const malchusScour = unit(
			tiferesInundation
			* (
				flowResponse(yesodWater.speed) * 0.55
				+ yesodWater.turbulence * 0.45
			)
		);
		const yesodRiverProximity = unit(
			Math.max(malchusMoisture, netzachWaterEdge)
		);
		const daasZones = createWaterHabitatZones({
			inundation: tiferesInundation,
			moisture: malchusMoisture,
			riverProximity: yesodRiverProximity,
			saturation: hodSaturation,
			scour: malchusScour,
			waterEdge: netzachWaterEdge
		});
		this.schema = 'awtsmoos.water-ecology-sample';
		this.water = yesodWater;
		this.moisture = malchusMoisture;
		this.saturation = hodSaturation;
		this.disturbance = gevurahDisturbance;
		this.waterEdge = netzachWaterEdge;
		this.deposition = unit(
			hodSaturation
			* (1 - gevurahDisturbance)
			* (1 - malchusScour * 0.72)
		);
		this.oxygenation = unit(
			gevurahDisturbance * 0.75
			+ yesodWater.foam * 0.5
		);
		this.flowSpeed = yesodWater.speed;
		this.inundation = tiferesInundation;
		this.riverProximity = yesodRiverProximity;
		this.scour = malchusScour;
		this.turbulence = yesodWater.turbulence;
		this.wetness = yesodWater.wet
			? Math.max(malchusMoisture, hodSaturation)
			: 0;
		Object.assign(this, daasZones);
		this.wet = yesodWater.wet;
		Object.freeze(this);
	}
}

/**
 * Creates one immutable ecology bridge from any normalized or raw water sample.
 * @param {object} [keterInput={}] Solver-neutral water evidence.
 * @param {object} [tiferesOptions={}] Ecology normalization options.
 * @returns {TiferesWaterEcologySample} Immutable ecology sample.
 */
export function createWaterEcologySample(
	keterInput = {},
	tiferesOptions = {}
) {
	return new TiferesWaterEcologySample(keterInput, tiferesOptions);
}

/** Maps nonnegative current speed smoothly into a bounded ecological disturbance response. */
function flowResponse(orValue) {
	return 1 - Math.exp(-Math.max(0, finite(orValue, 0)));
}

/** Returns a finite positive scalar or stable fallback. */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) && malchusValue > 0
		? malchusValue
		: yesodFallback;
}

/** Clamps one ecological scalar into zero-through-one. */
function unit(orValue) {
	return Math.min(1, Math.max(0, finite(orValue, 0)));
}

/** Returns one finite scalar or stable fallback. */
function finite(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue)
		? malchusValue
		: yesodFallback;
}
