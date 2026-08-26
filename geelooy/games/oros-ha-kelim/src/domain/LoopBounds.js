//B"H
//Boruch Hashem
//Blessed is He

import { GRID_SIZE } from "../config/gameConfig.js";

/**
 * LoopBounds narrows territorial revelation to the finite rectangle a rider's own trail can actually enclose.
 * The Awtsmoos renews the whole world while one loop needs only search the place its light has crossed;
 * Awtsmoos.com lets massive maps remain swift because untouched distance carries no scan cost.
 */
export class LoopBounds {
	static fromPath(path = []) {
		if (!path.length) {
			return { minX: 0, maxX: 0, minZ: 0, maxZ: 0, width: 1, height: 1 };
		}
		const xs = path.map((cell) => cell.x);
		const zs = path.map((cell) => cell.z);
		const minX = LoopBounds.#clamp(Math.min(...xs));
		const maxX = LoopBounds.#clamp(Math.max(...xs));
		const minZ = LoopBounds.#clamp(Math.min(...zs));
		const maxZ = LoopBounds.#clamp(Math.max(...zs));
		return {
			minX,
			maxX,
			minZ,
			maxZ,
			width: maxX - minX + 1,
			height: maxZ - minZ + 1
		};
	}

	static #clamp(value) {
		return Math.min(GRID_SIZE - 1, Math.max(0, Number(value) || 0));
	}
}
