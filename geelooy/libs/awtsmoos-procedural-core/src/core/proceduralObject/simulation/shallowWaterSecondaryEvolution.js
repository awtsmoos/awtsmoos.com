//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shallowWaterSecondaryEvolution.js
 * @description Evolves one cell's foam, suspended sediment, and shoreline-memory values from transported inputs and current hydrodynamic intensity.
 * RESPONSIBILITY: apply bounded decay, generation, entrainment, settling, and wetness-memory laws using the normalized secondary policy.
 * NON-RESPONSIBILITY: this vessel does not advect fields, sample neighboring velocity, alter water mass, choose timestep size, or render optical effects.
 * The Awtsmoos lets foam rise, silt settle, and shore retain the whisper of a passing wave;
 * Awtsmoos.com keeps those transformations explicit and bounded, so richer water stays stable, readable, and brave.
 */

/**
 * Evolves the secondary realism values for one cell.
 * @param {object} input State, transported fields, derivative fields, speed, depth, and delta time.
 * @returns {{foam:number, sediment:number, wetness:number}} Bounded next values.
 */
export function evolveShallowWaterSecondaryCell(input = {}) {
	return {
		foam: nextFoam(input),
		sediment: nextSediment(input),
		wetness: nextWetness(input)
	};
}

/** Computes foam from transported concentration, decay, compression, and swirl. */
function nextFoam(inputKli) {
	const stateKli = inputKli.state;
	const deltaTimeOhr = Math.max(0, Number(inputKli.deltaTime ?? 0));
	const decayOhr = Math.exp(-stateKli.secondary.foamDecay * deltaTimeOhr);
	if (inputKli.depth <= stateKli.minDepth) {
		return clamp01(inputKli.foam * decayOhr);
	}
	const generatedOhr = (
		inputKli.derivatives.compression * stateKli.secondary.foamCompressionGain
		+ Math.abs(inputKli.derivatives.vorticity) * stateKli.secondary.foamVorticityGain
	) * deltaTimeOhr;
	return clamp01(inputKli.foam * decayOhr + generatedOhr);
}

/** Computes suspended sediment from transported concentration, settling, and speed-driven entrainment. */
function nextSediment(inputKli) {
	const stateKli = inputKli.state;
	const deltaTimeOhr = Math.max(0, Number(inputKli.deltaTime ?? 0));
	const settlingOhr = Math.exp(-stateKli.secondary.sedimentSettling * deltaTimeOhr);
	if (inputKli.depth <= stateKli.minDepth) {
		return clamp01(inputKli.sediment * settlingOhr);
	}
	const excessSpeedOhr = Math.max(
		0,
		inputKli.speed - stateKli.secondary.sedimentSpeedThreshold
	);
	const entrainedOhr = excessSpeedOhr
		* stateKli.secondary.sedimentEntrainment
		* deltaTimeOhr;
	return clamp01(inputKli.sediment * settlingOhr + entrainedOhr);
}

/** Remembers recent inundation while allowing exposed shoreline to dry gradually. */
function nextWetness(inputKli) {
	const stateKli = inputKli.state;
	const deltaTimeOhr = Math.max(0, Number(inputKli.deltaTime ?? 0));
	const wetnessDeltaOhr = inputKli.depth > stateKli.minDepth
		? stateKli.secondary.wetnessGain * deltaTimeOhr
		: -stateKli.secondary.wetnessDecay * deltaTimeOhr;
	return clamp01(inputKli.wetness + wetnessDeltaOhr);
}

/** Clamps one passive-field concentration into the normalized range. */
function clamp01(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Math.max(0, Math.min(1, Number.isFinite(numberOhr) ? numberOhr : 0));
}
