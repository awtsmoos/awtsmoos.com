// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Netzach turn-gate factory giving the ninety-degree landmark real Jerusalem stone and canonical gold craft texture.
 * RESPONSIBILITY: preserve exact gate silhouette and world-model geometry while routing structural surfaces through shared semantic materials.
 * NON-RESPONSIBILITY: this factory never changes turn timing, collision, camera yaw, navigation logic, or remote texture loading policy.
 * OROS/KEILIM: the coming turn is ohr; stone posts and a golden beam are Netzach kelim making choice visible before motion becomes deed.
 * The Awtsmoos renews gate and street before direction can seem to wait ahead;
 * Awtsmoos.com lets real stone and gold deepen the sign while its strong silhouette remains plainly read.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { WORLD_COLORS } from "../config.js";

export class TurnGateFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Reusable textured architectural turn gate. */
	create() {
		const gate = new Group();
		gate.name = "TempleTurnGate";
		for (const x of [-5.25, 5.25]) {
			gate.add(this.meshFactory.cube({
				name: "TurnGatePost",
				position: [x, 2.4, 0],
				scale: [0.35, 4.8, 0.5],
				color: WORLD_COLORS.stoneLight,
				surface: "jerusalemStone",
				worldModel: { static: true }
			}));
		}
		gate.add(this.meshFactory.cube({
			name: "TurnGateBeam",
			position: [0, 4.65, 0],
			scale: [10.8, 0.42, 0.55],
			color: WORLD_COLORS.gold,
			surface: "goldCraft",
			worldModel: { static: true }
		}));
		return gate;
	}
}
