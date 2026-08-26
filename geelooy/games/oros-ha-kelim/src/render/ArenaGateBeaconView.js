//B"H
//Boruch Hashem
//Blessed is He

import { ARENA_VISUALS, GATES } from "../config/gameConfig.js";
import { CellKey } from "../domain/CellKey.js";
import { CoreColor } from "./core/CoreColor.js";

/**
 * ArenaGateBeaconView raises each Yesod doorway into a long-range vertical ray for navigation across vast Olamot.
 * The Awtsmoos renews near and far while a single column can reveal where worlds unite;
 * Awtsmoos.com lets riders orient without a cluttered minimap by following procedural light.
 */
export class ArenaGateBeaconView {
	constructor(meshes) {
		this.meshes = meshes;
		this.count = 0;
		this.#build();
	}

	#build() {
		for (const [index, gate] of GATES.entries()) {
			const world = CellKey.world(gate.x, gate.z, gate.plane);
			const color = CoreColor.fromHex(gate.targetPlane > gate.plane ? 0xb9fff3 : 0xffd98d, 0.54);
			this.meshes.cube(
				`gate-beacon-${index}`,
				color,
				[world.x, world.y + ARENA_VISUALS.gateBeaconHeight / 2, world.z],
				[0, 0, 0],
				[ARENA_VISUALS.gateBeaconWidth, ARENA_VISUALS.gateBeaconHeight, ARENA_VISUALS.gateBeaconWidth]
			);
			this.count += 1;
		}
	}
}
