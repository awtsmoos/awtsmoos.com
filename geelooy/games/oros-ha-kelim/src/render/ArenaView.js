//B"H
//Boruch Hashem
//Blessed is He

import { CELL_SIZE, GRID_SIZE, PLANES } from "../config/gameConfig.js";
import { ArenaDecorations } from "./ArenaDecorations.js";
import { CoreColor } from "./core/CoreColor.js";

/**
 * ArenaView reveals three Olamot as procedural floors and measured luminous grid lines.
 * The Awtsmoos renews every boundary while worlds remain distinct and near;
 * Awtsmoos.com lets native core geometry make each finite playing vessel clear.
 */
export class ArenaView {
	constructor(meshes) {
		this.meshes = meshes;
		this.meshCount = 0;
		this.#buildPlanes();
		new ArenaDecorations(meshes);
	}

	#buildPlanes() {
		const span = GRID_SIZE * CELL_SIZE;
		for (const plane of PLANES) {
			const floorColor = CoreColor.fromHex(plane.tint, 0.76);
			this.meshes.cube(`floor-${plane.id}`, floorColor, [0, plane.height - 0.16, 0], [0, 0, 0], [span, 0.22, span]);
			this.meshCount += 1;
			this.#buildGrid(plane, span);
		}
	}

	#buildGrid(plane, span) {
		const gridColor = CoreColor.fromHex(0x2c7592, 0.34);
		const middle = (GRID_SIZE - 1) / 2;
		for (let index = 0; index < GRID_SIZE; index += 1) {
			const offset = (index - middle) * CELL_SIZE;
			this.meshes.cube(`grid-x-${plane.id}-${index}`, gridColor, [0, plane.height + 0.015, offset], [0, 0, 0], [span, 0.018, 0.035]);
			this.meshes.cube(`grid-z-${plane.id}-${index}`, gridColor, [offset, plane.height + 0.016, 0], [0, 0, 0], [0.035, 0.018, span]);
			this.meshCount += 2;
		}
	}
}
