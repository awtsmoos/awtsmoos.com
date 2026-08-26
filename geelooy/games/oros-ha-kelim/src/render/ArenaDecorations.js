//B"H
//Boruch Hashem
//Blessed is He

import { GATES, PLANES } from "../config/gameConfig.js";
import { CellKey } from "../domain/CellKey.js";
import { ArenaGateBeaconView } from "./ArenaGateBeaconView.js";
import { CoreColor } from "./core/CoreColor.js";
import { OROS_MATERIALS } from "./materials/OrosMaterialProfiles.js";

/**
 * ArenaDecorations gives Yesod arches photographed masonry/metal weight and Etz Chaim real remote bark grain.
 * The Awtsmoos renews center and doorway while distant beacons remain pure procedural light;
 * Awtsmoos.com lets material reality enrich landmarks without covering navigation in decorative night.
 */
export class ArenaDecorations {
	constructor(meshes) {
		this.meshes = meshes;
		this.beacons = new ArenaGateBeaconView(meshes);
		this.#gates();
		this.#tree();
	}

	#gates() {
		for (const [index, gate] of GATES.entries()) {
			const world = CellKey.world(gate.x, gate.z, gate.plane);
			const rising = gate.targetPlane > gate.plane;
			const color = CoreColor.fromHex(rising ? 0x8effd7 : 0xffd47b, 0.9);
			const material = rising ? OROS_MATERIALS.gateUp : OROS_MATERIALS.gateDown;
			this.#gatePart(`gate-${index}-left`, color, [world.x - 1.25, world.y + 1.35, world.z], [0.24, 2.7, 0.24], material);
			this.#gatePart(`gate-${index}-right`, color, [world.x + 1.25, world.y + 1.35, world.z], [0.24, 2.7, 0.24], material);
			this.#gatePart(`gate-${index}-crown`, color, [world.x, world.y + 2.62, world.z], [2.75, 0.24, 0.24], material);
		}
	}

	#gatePart(id, color, position, scale, material) {
		this.meshes.cube(id, color, position, [0, 0, 0], scale, material);
	}

	#tree() {
		const centerHeight = (PLANES[0].height + PLANES.at(-1).height) / 2;
		const trunk = CoreColor.fromHex(0xfff0ad, 0.48);
		this.meshes.cube("etz-chaim-trunk", trunk, [0, centerHeight + 2, 0], [0, 0, 0], [0.24, 32, 0.24], OROS_MATERIALS.tree);
		for (let index = 0; index < 10; index += 1) {
			const angle = index * Math.PI * 0.4;
			const radius = index % 3 === 0 ? 4.4 : 3.1;
			this.meshes.cube(
				`etz-sefirah-${index}`,
				CoreColor.fromHex(0xe7c7ff, 0.42),
				[Math.cos(angle) * radius, centerHeight - 7 + index * 1.9, Math.sin(angle) * radius],
				[0, 0, 0],
				[0.58, 0.58, 0.58],
				OROS_MATERIALS.canopy
			);
		}
	}
}
