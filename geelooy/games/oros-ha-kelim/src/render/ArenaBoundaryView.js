//B"H
//Boruch Hashem
//Blessed is He

import { ARENA_VISUALS, CELL_SIZE, GRID_SIZE, PLANES } from "../config/gameConfig.js";
import { CoreColor } from "./core/CoreColor.js";
import { OROS_MATERIALS } from "./materials/OrosMaterialProfiles.js";

/**
 * ArenaBoundaryView gives the enlarged world tactile metal-stone rails without compromising their luminous warning.
 * The Awtsmoos renews edge and material while finite riders still require an unmistakable shore;
 * Awtsmoos.com lets remote grain add physical weight before collision meets the border.
 */
export class ArenaBoundaryView {
	constructor(meshes) {
		this.meshes = meshes;
		this.count = 0;
		this.#build();
	}

	#build() {
		const span = GRID_SIZE * CELL_SIZE;
		const edge = span / 2;
		const color = CoreColor.fromHex(0x5be7ff, 0.74);
		for (const plane of PLANES) {
			this.#rail(`north-${plane.id}`, [0, plane.height + 0.08, -edge], [span, ARENA_VISUALS.boundaryHeight, ARENA_VISUALS.boundaryThickness], color);
			this.#rail(`south-${plane.id}`, [0, plane.height + 0.08, edge], [span, ARENA_VISUALS.boundaryHeight, ARENA_VISUALS.boundaryThickness], color);
			this.#rail(`west-${plane.id}`, [-edge, plane.height + 0.08, 0], [ARENA_VISUALS.boundaryThickness, ARENA_VISUALS.boundaryHeight, span], color);
			this.#rail(`east-${plane.id}`, [edge, plane.height + 0.08, 0], [ARENA_VISUALS.boundaryThickness, ARENA_VISUALS.boundaryHeight, span], color);
		}
	}

	#rail(id, position, scale, color) {
		this.meshes.cube(`boundary-${id}`, color, position, [0, 0, 0], scale, OROS_MATERIALS.boundary);
		this.count += 1;
	}
}
