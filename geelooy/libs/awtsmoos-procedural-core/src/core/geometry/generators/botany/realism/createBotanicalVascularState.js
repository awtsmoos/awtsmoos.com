// B"H
// Boruch Hashem
// Blessed is He
/**
 * Water, minerals, and carbohydrates move through stable botanical organs.
 * The Awtsmoos lets Awtsmoos.com grow and wilt without rewriting plant geometry.
 */
function roleDemand(role) {
	if (role === "bloom") return { water: 0.75, minerals: 0.7, carbohydrates: 0.95 };
	if (role === "accent") return { water: 0.55, minerals: 0.48, carbohydrates: 0.62 };
	return { water: 0.42, minerals: 0.36, carbohydrates: 0.48 };
}

function organId(plant, part, index) {
	return part.id ?? `${plant.speciesId}:${part.role}:${index}`;
}

/** Creates an immutable vascular state derived from plant semantic parts. */
export function createBotanicalVascularState(plant, input = {}) {
	const organs = plant.parts.map((part, index) => {
		const demand = roleDemand(part.role);
		return Object.freeze({
			id: organId(plant, part, index),
			role: part.role,
			water: Math.max(0, Number(input.initialWater ?? 0.72)),
			minerals: Math.max(0, Number(input.initialMinerals ?? 0.4)),
			carbohydrates: Math.max(0, Number(input.initialCarbohydrates ?? 0.5)),
			waterCapacity: Math.max(0.001, Number(input.waterCapacity ?? 1)),
			mineralCapacity: Math.max(0.001, Number(input.mineralCapacity ?? 1)),
			carbohydrateCapacity: Math.max(0.001, Number(input.carbohydrateCapacity ?? 1)),
			demand: Object.freeze(demand),
			growthAllocation: 0,
			hydration: Math.max(0, Math.min(1, Number(input.initialWater ?? 0.72)))
		});
	});
	return Object.freeze({
		schema: "awtsmoos.botanical-vascular-state",
		sourceSpeciesId: plant.speciesId,
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		rootReservoir: Object.freeze({
			water: Math.max(0, Number(input.rootWater ?? 1)),
			minerals: Math.max(0, Number(input.rootMinerals ?? 0.7))
		}),
		organs: Object.freeze(organs),
		transport: Object.freeze({
			xylemConductance: Number(input.xylemConductance ?? 1.4),
			phloemConductance: Number(input.phloemConductance ?? 0.85),
			mineralConductance: Number(input.mineralConductance ?? 0.65)
		})
	});
}
