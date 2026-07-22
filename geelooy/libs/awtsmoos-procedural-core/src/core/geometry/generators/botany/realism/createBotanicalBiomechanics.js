// B"H
// Boruch Hashem
// Blessed is He
/** Stems, leaves, and flowers become spring-mass wind vessels, not rigid props. */

import { measureBotanicalBounds } from "./botanicalBounds.js";

function mode(name, frequency, damping, amplitude, axis) {
	return Object.freeze({ name, frequency, damping, amplitude, axis: Object.freeze(axis) });
}

/** Creates renderer-neutral wind and deformation modes from generated geometry. */
export function createBotanicalBiomechanics(plant, options = {}) {
	const bounds = measureBotanicalBounds(plant);
	const stiffness = Math.max(0.01, Number(options.stiffness ?? 0.55));
	const mass = Math.max(0.001, Number(options.mass ?? bounds.vertexCount * 0.00018));
	const scale = Math.max(0.1, bounds.height || 1);
	const baseFrequency = Math.sqrt(stiffness / mass) / (2 * Math.PI * scale);
	const hasBloom = plant.parts.some((part) => part.role === "bloom");
	return Object.freeze({
		schema: "awtsmoos.botanical-biomechanics",
		sourceSpeciesId: plant.speciesId,
		bounds,
		material: Object.freeze({
			youngsModulus: Number(options.youngsModulus ?? 1.2e8),
			density: Number(options.density ?? 650),
			stemStiffness: stiffness,
			leafFlexibility: Number(options.leafFlexibility ?? 0.78),
			petalFlexibility: Number(options.petalFlexibility ?? 0.9)
		}),
		windModes: Object.freeze([
			mode("trunk-sway", baseFrequency, 0.16, bounds.height * 0.035, [1, 0, 0]),
			mode("cross-sway", baseFrequency * 1.17, 0.18, bounds.height * 0.028, [0, 0, 1]),
			mode("leaf-flutter", baseFrequency * 8.5, 0.34, bounds.spread * 0.012, [1, 0.2, 1]),
			...(hasBloom ? [mode("bloom-nod", baseFrequency * 2.2, 0.24, bounds.height * 0.018, [1, 0, 1])] : [])
		]),
		anchors: Object.freeze({ rootPlane: bounds.minimum[1], freeTipHeight: bounds.maximum[1] }),
		collisionRadius: Math.max(0.002, bounds.spread * 0.006)
	});
}
