// B"H
// Boruch Hashem
// Blessed is He
/**
 * Roots drink, leaves transpire, and photosynthetic sugar descends through one
 * inspectable transport frame. The Awtsmoos keeps all resource flow bounded.
 */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function total(organs, key) {
	return organs.reduce((sum, organ) => sum + organ[key], 0);
}

/** Advances vascular transport and returns exact uptake, loss, and allocation evidence. */
export function stepBotanicalVascularTransport(state, input = {}) {
	const deltaTime = Math.max(0, Number(input.deltaTime ?? 1 / 60));
	const soilMoisture = clamp(input.soilMoisture ?? 0.7, 0, 1);
	const soilMinerals = clamp(input.soilMinerals ?? 0.5, 0, 1);
	const sunlight = clamp(input.sunlight ?? 0.8, 0, 1.5);
	const humidity = clamp(input.humidity ?? 0.5, 0, 1);
	const temperature = Number(input.temperature ?? 0.55);
	const rootWaterUptake = Math.min(
		state.rootReservoir.water,
		soilMoisture * Number(input.rootUptakeRate ?? 0.8) * deltaTime
	);
	const rootMineralUptake = Math.min(
		state.rootReservoir.minerals,
		soilMinerals * Number(input.mineralUptakeRate ?? 0.45) * deltaTime
	);
	const weights = state.organs.map(organ => organ.demand.water);
	const weightTotal = weights.reduce((sum, value) => sum + value, 0) || 1;
	let transpired = 0;
	let photosynthesized = 0;
	let allocatedGrowth = 0;
	const organs = state.organs.map((organ, index) => {
		const waterSupply = rootWaterUptake * weights[index] / weightTotal
			* state.transport.xylemConductance;
		const mineralSupply = rootMineralUptake * organ.demand.minerals / weightTotal
			* state.transport.mineralConductance;
		const transpiration = Math.min(
			organ.water + waterSupply,
			Math.max(0, temperature) * (1 - humidity)
				* organ.demand.water * Number(input.transpirationRate ?? 0.16) * deltaTime
		);
		const hydrationBefore = clamp((organ.water + waterSupply - transpiration) / organ.waterCapacity, 0, 1);
		const photosynthesis = sunlight * hydrationBefore
			* (organ.role === "bloom" ? 0.25 : 1)
			* Number(input.photosynthesisRate ?? 0.35) * deltaTime;
		const carbohydrate = organ.carbohydrates + photosynthesis;
		const growth = Math.min(
			carbohydrate,
			organ.minerals + mineralSupply,
			hydrationBefore
		) * organ.demand.carbohydrates * Number(input.growthRate ?? 0.08) * deltaTime;
		transpired += transpiration;
		photosynthesized += photosynthesis;
		allocatedGrowth += growth;
		const water = clamp(organ.water + waterSupply - transpiration - growth * 0.1, 0, organ.waterCapacity);
		const minerals = clamp(organ.minerals + mineralSupply - growth * 0.2, 0, organ.mineralCapacity);
		const carbohydrates = clamp(carbohydrate - growth, 0, organ.carbohydrateCapacity);
		return Object.freeze({
			...organ,
			water,
			minerals,
			carbohydrates,
			growthAllocation: organ.growthAllocation + growth,
			hydration: clamp(water / organ.waterCapacity, 0, 1),
			wilting: clamp(1 - water / Math.max(organ.waterCapacity * 0.45, 1e-6), 0, 1)
		});
	});
	return Object.freeze({
		state: Object.freeze({
			...state,
			tick: state.tick + 1,
			time: state.time + deltaTime,
			rootReservoir: Object.freeze({
				water: Math.max(0, state.rootReservoir.water - rootWaterUptake),
				minerals: Math.max(0, state.rootReservoir.minerals - rootMineralUptake)
			}),
			organs: Object.freeze(organs)
		}),
		report: Object.freeze({
			rootWaterUptake,
			rootMineralUptake,
			transpired,
			photosynthesized,
			allocatedGrowth,
			averageHydration: total(organs, "hydration") / Math.max(1, organs.length),
			averageWilting: total(organs, "wilting") / Math.max(1, organs.length)
		})
	});
}
