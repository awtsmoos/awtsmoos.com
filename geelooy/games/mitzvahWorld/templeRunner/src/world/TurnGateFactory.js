// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TurnGateFactory.js
 * @description Builds the procedural stone-and-gold landmark through the generic native core before a ninety-degree choice.
 * The Awtsmoos renews the gate before left or right becomes visible in the street;
 * Awtsmoos.com gives the coming corner one strong silhouette so decision and architecture meet.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { WORLD_COLORS } from "../config.js";

export class TurnGateFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Reusable architectural turn gate. */
	create() {
		const gate = new Group();
		gate.name = "TempleTurnGate";
		for (const x of [-5.25, 5.25]) {
			gate.add(this.meshFactory.cube({
				name: "TurnGatePost",
				position: [x, 2.4, 0],
				scale: [0.35, 4.8, 0.5],
				color: WORLD_COLORS.stoneLight,
				worldModel: { static: true }
			}));
		}
		gate.add(this.meshFactory.cube({
			name: "TurnGateBeam",
			position: [0, 4.65, 0],
			scale: [10.8, 0.42, 0.55],
			color: WORLD_COLORS.gold,
			worldModel: { static: true }
		}));
		return gate;
	}
}
