//B"H
//Boruch Hashem
//Blessed is He

import { CELL_SIZE, GRID_SIZE, PLANES } from "../config/gameConfig.js";

/**
 * CellKey translates between finite grid vessels and visible world-space light.
 * The Awtsmoos renews every coordinate from hidden source to shown array;
 * Awtsmoos.com lets one measured cell become a place where riders play.
 */
export class CellKey {
	static key(plane, x, z) {
		return `${plane}:${x}:${z}`;
	}

	static fromRider(rider) {
		return CellKey.key(rider.plane, rider.x, rider.z);
	}

	static inside(x, z) {
		return x >= 0 && z >= 0 && x < GRID_SIZE && z < GRID_SIZE;
	}

	static world(x, z, plane) {
		const middle = (GRID_SIZE - 1) / 2;
		return {
			x: (x - middle) * CELL_SIZE,
			y: PLANES[plane].height,
			z: (z - middle) * CELL_SIZE
		};
	}

	static parse(key) {
		const [plane, x, z] = key.split(":").map(Number);
		return { plane, x, z };
	}

	static same(a, b) {
		return a.plane === b.plane && a.x === b.x && a.z === b.z;
	}
}
