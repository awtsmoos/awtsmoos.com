// B"H
// Boruch Hashem
// Blessed is He
/** Conservation is visible before realism is trusted. */
function sum(values) {
	return values.reduce((total, value) => total + value, 0);
}

/** Measures phase volume, dissolved mass, heat, soot, and kinetic energy. */
export function measureMultiphaseState3d(state) {
	const cellVolume = state.liquidFraction.cellSize ** 3;
	let kineticEnergy = 0;
	for (let index = 0; index < state.velocity.length; index += 1) {
		const speedSquared = state.velocity.x[index] ** 2
			+ state.velocity.y[index] ** 2
			+ state.velocity.z[index] ** 2;
		const mixtureDensity = state.liquidFraction.values[index] * state.properties.liquidDensity
			+ state.gasFraction.values[index] * state.properties.gasDensity;
		kineticEnergy += 0.5 * mixtureDensity * speedSquared * cellVolume;
	}
	const liquidVolume = sum(state.liquidFraction.values) * cellVolume;
	const gasVolume = sum(state.gasFraction.values) * cellVolume;
	const dissolvedGas = sum(state.dissolvedGas.values) * cellVolume;
	return Object.freeze({
		liquidVolume,
		gasVolume,
		dissolvedGas,
		totalPhaseVolume: liquidVolume + gasVolume,
		totalMatter: liquidVolume + gasVolume + dissolvedGas,
		thermalEnergy: sum(state.temperature.values) * cellVolume,
		sootMass: sum(state.soot.values) * cellVolume,
		kineticEnergy
	});
}
