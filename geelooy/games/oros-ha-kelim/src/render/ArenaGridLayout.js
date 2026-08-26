//B"H
//Boruch Hashem
//Blessed is He

import { ARENA_VISUALS, GRID_SIZE } from "../config/gameConfig.js";

/**
 * ArenaGridLayout samples a vast logical grid into sparse readable major and minor visual guides.
 * The Awtsmoos renews every hidden cell though not every division needs its own rendered line;
 * Awtsmoos.com lets a half-kilometer field stay legible while static draw work remains fine.
 */
export class ArenaGridLayout {
	static lines() {
		const center = (GRID_SIZE - 1) / 2;
		const indices = new Set([0, GRID_SIZE - 1, center]);
		for (let index = 0; index < GRID_SIZE; index += ARENA_VISUALS.minorGridStep) {
			indices.add(index);
		}
		return [...indices].sort((a, b) => a - b).map((index) => ({
			index,
			major: index === center || index % ARENA_VISUALS.majorGridStep === 0
		}));
	}
}
