//B"H
//Boruch Hashem
//Blessed is He

import { ARENA_VISUALS, CELL_SIZE, GRID_SIZE, PLANES } from "../config/gameConfig.js";
import { ArenaBoundaryView } from "./ArenaBoundaryView.js";
import { ArenaDecorations } from "./ArenaDecorations.js";
import { ArenaGridLayout } from "./ArenaGridLayout.js";
import { CoreColor } from "./core/CoreColor.js";
import { OROS_MATERIALS } from "./materials/OrosMaterialProfiles.js";

/**
 * ArenaView reveals three photographed half-kilometer Olamot beneath sparse procedural navigation guides.
 * The Awtsmoos renews earth, stone and masonry while every logical square remains deterministic light;
 * Awtsmoos.com lets real remote grain distinguish worlds without texturing away the grid from sight.
 */
export class ArenaView {
	constructor(meshes) {
		this.meshes = meshes;
		this.meshCount = 0;
		this.#buildPlanes();
		this.boundaries = new ArenaBoundaryView(meshes);
		this.decorations = new ArenaDecorations(meshes);
	}

	#buildPlanes() {
		const span = GRID_SIZE * CELL_SIZE;
		const materials = [OROS_MATERIALS.asiyahFloor, OROS_MATERIALS.yetzirahFloor, OROS_MATERIALS.beriahFloor];
		for (const [index, plane] of PLANES.entries()) {
			const floorColor = CoreColor.fromHex(plane.tint, 0.86);
			this.meshes.cube(
				`floor-${plane.id}`,
				floorColor,
				[0, plane.height - 0.16, 0],
				[0, 0, 0],
				[span, 0.22, span],
				materials[index]
			);
			this.meshCount += 1;
			this.#buildGrid(plane, span);
		}
	}

	#buildGrid(plane, span) {
		const middle = (GRID_SIZE - 1) / 2;
		for (const line of ArenaGridLayout.lines()) {
			const offset = (line.index - middle) * CELL_SIZE;
			const thickness = line.major ? ARENA_VISUALS.majorThickness : ARENA_VISUALS.minorThickness;
			const color = CoreColor.fromHex(line.major ? 0x4ecff5 : 0x27677f, line.major ? 0.42 : 0.2);
			this.meshes.cube(`grid-x-${plane.id}-${line.index}`, color, [0, plane.height + 0.015, offset], [0, 0, 0], [span, 0.018, thickness]);
			this.meshes.cube(`grid-z-${plane.id}-${line.index}`, color, [offset, plane.height + 0.016, 0], [0, 0, 0], [thickness, 0.018, span]);
			this.meshCount += 2;
		}
	}
}
