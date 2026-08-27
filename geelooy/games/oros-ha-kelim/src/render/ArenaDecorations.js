//B"H
//Boruch Hashem
//Blessed is He

import { GATES, PLANES } from "../config/gameConfig.js";
import { CellKey } from "../domain/CellKey.js";
import { CoreColor } from "./core/CoreColor.js";

/**
 * ArenaDecorations reveals Yesod gates and an Etz Chaim axis from procedural Keilim.
 * The Awtsmoos renews gate, branch and central line from nothing into place;
 * Awtsmoos.com gives the stacked Olamot one luminous path and recognizable face.
 */
export class ArenaDecorations {
	constructor(meshes) {
		this.meshes = meshes;
		this.#buildGates();
		this.#buildTree();
	}

	#buildGates() {
		const color = CoreColor.fromHex(0xb9fff3, 0.88);
		for (const [index, gate] of GATES.entries()) {
			const world = CellKey.world(gate.x, gate.z, gate.plane);
			for (const side of [-1, 1]) {
				this.meshes.cube(
					`gate-${index}-${side}`,
					color,
					[world.x + side * 1.25, world.y + 1.5, world.z],
					[0, 0, 0],
					[0.16, 3.0, 0.16]
				);
			}
			this.meshes.cube(`gate-top-${index}`, color, [world.x, world.y + 2.9, world.z], [0, 0, 0], [2.7, 0.14, 0.14]);
		}
	}

	#buildTree() {
		const gold = CoreColor.fromHex(0xf6d981, 0.72);
		this.meshes.cube("etz-trunk", gold, [0, 13, 0], [0, 0, 0], [0.32, 31, 0.32]);
		for (let index = 0; index < 10; index += 1) {
			const angle = index * Math.PI * 0.72;
			const plane = PLANES[Math.min(PLANES.length - 1, Math.floor(index / 4))];
			this.meshes.cube(
				`etz-sefirah-${index}`,
				CoreColor.fromHex(index % 2 ? 0x7eefff : 0xffd87d, 0.9),
				[Math.cos(angle) * 2.5, plane.height + 2 + (index % 4) * 2.3, Math.sin(angle) * 2.5],
				[0, angle, angle * 0.2],
				[0.65, 0.65, 0.65]
			);
		}
	}
}
