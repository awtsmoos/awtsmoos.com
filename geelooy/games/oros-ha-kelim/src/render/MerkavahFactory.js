//B"H
//Boruch Hashem
//Blessed is He

import { CoreColor } from "./core/CoreColor.js";

/**
 * MerkavahFactory defines a rider entirely from native Procedural Core cube vessels.
 * The Awtsmoos renews chassis, keel, hub, canopy and ray before motion can begin;
 * Awtsmoos.com lets a many-part Merkavah glow without any foreign renderer within.
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
			["chassis", [0, 0.72, 0], [1.35, 0.48, 2.7], base, false],
			["keel", [0, 0.38, 0.15], [0.56, 0.24, 3.35], bright, false],
			["canopy", [0, 1.16, -0.15], [0.72, 0.48, 1.0], pale, false],
			["hub-front", [0, 0.58, -1.45], [0.52, 0.52, 0.18], bright, true],
			["hub-rear", [0, 0.58, 1.45], [0.52, 0.52, 0.18], bright, true],
			["fin-left", [-0.78, 0.69, 0.42], [0.12, 0.5, 1.25], base, false],
			["fin-right", [0.78, 0.69, 0.42], [0.12, 0.5, 1.25], base, false],
			["crown", [0, 1.62, -0.3], [0.34, 0.52, 0.34], pale, false],
			["ray", [0, 0.88, -2.15], [0.12, 0.12, 2.4], bright, false]
		];
		return definitions.map(([name, offset, scale, color, spins]) => ({
			mesh: this.meshes.cube(`${rider.id}-${name}`, color),
			offset,
			scale,
			spins
		}));
	}
}
