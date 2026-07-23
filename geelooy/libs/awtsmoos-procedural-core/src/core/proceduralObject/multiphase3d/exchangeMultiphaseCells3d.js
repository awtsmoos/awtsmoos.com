// B"H
// Boruch Hashem
// Blessed is He
/** Heat moves matter between phases while exact per-cell transfers remain bounded. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

/** Performs evaporation, condensation, and dissolved-gas exsolution. */
export function exchangeMultiphaseCells3d(fields, properties, options) {
	const liquid = [];
	const gas = [];
	const dissolved = [];
	const temperature = [];
	const transfers = { evaporated: 0, condensed: 0, exsolved: 0 };
	for (let index = 0; index < fields.liquid.length; index += 1) {
		let nextLiquid = Math.max(0, fields.liquid[index]);
		let nextGas = Math.max(0, fields.gas[index]);
		let nextDissolved = Math.max(0, fields.dissolved[index]);
		let nextTemperature = fields.temperature[index];
		const evaporation = Math.min(
			nextLiquid,
			Math.max(0, nextTemperature - properties.boilingTemperature)
				* options.evaporationRate * options.deltaTime
		);
		nextLiquid -= evaporation;
		nextGas += evaporation;
		nextTemperature -= evaporation * properties.latentHeat;
		transfers.evaporated += evaporation;
		const condensation = Math.min(
			nextGas,
			Math.max(0, properties.condensationTemperature - nextTemperature)
				* options.condensationRate * options.deltaTime
		);
		nextGas -= condensation;
		nextLiquid += condensation;
		nextTemperature += condensation * properties.latentHeat;
		transfers.condensed += condensation;
		const saturation = options.solubility * Math.max(0, nextLiquid);
		const exsolved = Math.min(
			nextDissolved,
			Math.max(0, nextDissolved - saturation) * options.exsolutionRate * options.deltaTime
		);
		nextDissolved -= exsolved;
		nextGas += exsolved;
		transfers.exsolved += exsolved;
		const occupied = nextLiquid + nextGas;
		const scale = occupied > 1 ? 1 / occupied : 1;
		liquid.push(clamp(nextLiquid * scale, 0, 1));
		gas.push(clamp(nextGas * scale, 0, 1));
		dissolved.push(Math.max(0, nextDissolved));
		temperature.push(nextTemperature);
	}
	return Object.freeze({ liquid, gas, dissolved, temperature, transfers: Object.freeze(transfers) });
}
