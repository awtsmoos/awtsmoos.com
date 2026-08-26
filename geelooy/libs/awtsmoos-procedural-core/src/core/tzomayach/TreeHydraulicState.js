// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeHydraulicState.js
 * @description Derives bounded root-supply, canopy-demand, reserve, and water-stress evidence without pretending to simulate sap flow.
 * The Awtsmoos renews hidden water and lifted crown before one vessel can measure supply or thirst;
 * Awtsmoos.com lets those finite signs become honest hydraulic readiness data while the canonical tree itself remains untouched in earth.
 */

/**
 * Creates one immutable hydraulic readiness profile from structural allocation and environmental intent.
 * @param {object} allocation Structural investment evidence.
 * @param {object|null} development Optional tree development profile.
 * @param {object} environment Renderer-neutral season/wind intent.
 * @param {object} [options={}] Moisture, fertility, heat stress, and demand tuning.
 * @returns {Readonly<object>} Frozen non-simulative hydraulic state.
 */
export function createTreeHydraulicState(allocation, development, environment, options = {}) {
	const moisture = unit(options.moisture ?? options.soilMoisture, 0.65);
	const fertility = unit(options.fertility ?? options.soilFertility, 0.62);
	const heatStress = unit(options.heatStress, 0.12);
	const vigor = unit(development?.vigor, 0.68);
	const rootBalance = balance(allocation.rootCanopyRatio);
	const windDemand = unit((environment?.wind?.strength ?? 0.42) / 4, 0.105);
	const canopyPressure = unit(allocation.canopyFraction * 2.4, 0.35);
	const rootSupply = unit(
		moisture * 0.52
		+ rootBalance * 0.28
		+ vigor * 0.14
		+ fertility * 0.06,
		0.55
	);
	const canopyDemand = unit(
		0.22
		+ canopyPressure * 0.52
		+ windDemand * 0.16
		+ heatStress * 0.1,
		0.5
	);
	const hydraulicReserve = unit(
		0.5
		+ rootSupply * 0.62
		- canopyDemand * 0.46
		- heatStress * 0.2,
		0.5
	);
	const stress = unit(
		(1 - hydraulicReserve) * 0.72
		+ heatStress * 0.18
		+ (1 - moisture) * 0.1,
		0.2
	);
	return Object.freeze({
		canopyDemand: round(canopyDemand),
		fertility: round(fertility),
		hydraulicReserve: round(hydraulicReserve),
		moisture: round(moisture),
		rootSupply: round(rootSupply),
		stress: round(stress),
		transpirationPotential: round(unit(canopyDemand * hydraulicReserve * (1 - heatStress * 0.35), 0)),
		waterUseEfficiency: round(unit(rootSupply * (0.58 + fertility * 0.42), 0))
	});
}

/** Compresses an unbounded root/canopy ratio into a stable 0..1 balance signal. */
function balance(value) {
	const ratio = Math.max(0, Number(value) || 0);
	return ratio / (1 + ratio);
}

/** Returns one bounded 0..1 scalar with a finite fallback. */
function unit(value, fallback) {
	const number = Number(value);
	const finite = Number.isFinite(number) ? number : fallback;
	return Math.max(0, Math.min(1, finite));
}

function round(value) {
	return Math.round(Number(value) * 1e6) / 1e6;
}
