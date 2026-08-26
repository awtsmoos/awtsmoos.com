//B"H
//Boruch Hashem
//Blessed is He

import { CoreColor } from "./core/CoreColor.js";
import { OROS_MATERIALS } from "./materials/OrosMaterialProfiles.js";

/**
 * MerkavahFactory combines generated geometry, rider tint and remote metal/mineral grain without foreign rendering.
 * The Awtsmoos renews chassis, keel, hub, canopy and ray before motion can begin;
 * Awtsmoos.com lets a tactile many-part Merkavah keep its luminous identity entirely within Procedural Core.
 */
export class MerkavahFactory {
	constructor(meshes) {
		this.meshes = meshes;
	}

	create(rider) {
		const base = CoreColor.fromHex(rider.color, 1);
		const bright = CoreColor.scale(base, 1.35, 1);
		const pale = CoreColor.scale(base, 1.8, 0.9);
		const definitions = [
			["chassis", [0, 0.72, 0], [1.35, 0.48, 2.7], base, false, OROS_MATERIALS.chassis],
			["keel", [0, 0.38, 0.15], [0.56, 0.24, 3.35], bright, false, OROS_MATERIALS.chassis],
			["canopy", [0, 1.16, -0.15], [0.72, 0.48, 1.0], pale, false, OROS_MATERIALS.canopy],
			["hub-front", [0, 0.58, -1.45], [0.52, 0.52, 0.18], bright, true, OROS_MATERIALS.hub],
			["hub-rear", [0, 0.58, 1.45], [0.52, 0.52, 0.18], bright, true, OROS_MATERIALS.hub],
			["fin-left", [-0.78, 0.69, 0.42], [0.12, 0.5, 1.25], base, false, OROS_MATERIALS.chassis],
			["fin-right", [0.78, 0.69, 0.42], [0.12, 0.5, 1.25], base, false, OROS_MATERIALS.chassis],
			["crown", [0, 1.62, -0.3], [0.34, 0.52, 0.34], pale, false, OROS_MATERIALS.canopy],
			["ray", [0, 0.88, -2.15], [0.12, 0.12, 2.4], bright, false, null]
		];
		return definitions.map(([name, offset, scale, color, spins, material]) => ({
			mesh: this.meshes.cube(`${rider.id}-${name}`, color, [0, 0, 0], [0, 0, 0], [1, 1, 1], material),
			offset,
			scale,
			spins
		}));
	}
}
