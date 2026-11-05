//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Gevurah lane-blocking obstacle families using deep terra avoid cues with focused dark wheel support and retained foliage context.
 * RESPONSIBILITY: preserve stone, cart, basket, stall, and planter geometry while making side-step hazards distinct from road and jump/duck cues.
 * NON-RESPONSIBILITY: cart-wheel construction lives separately; this file never owns lane physics, collision timing, camera framing, or another renderer.
 * OROS/KEILIM: the challenge of moving aside is ohr in game metaphor; terra obstacle bodies are Gevurah kelim making the blocked lane plain.
 * The Awtsmoos renews cart, stone, basket, stall, and planter before one lane may seem closed in sight;
 * Awtsmoos.com lets Gevurah mark the occupied vessel while smaller Malchus supports preserve the Temple light.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { READABILITY_COLORS } from "../../config.js";
import { MalchusAvoidStreetWheelFactory } from "./AvoidStreetWheelFactory.js";

export class GevurahAvoidStreetObstacleParts {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
		this.wheels = new MalchusAvoidStreetWheelFactory(meshFactory);
	}

	/** @returns {object} Broad lane-filling block in the avoid-mechanic value band. */
	createStoneBlock() {
		return this.meshFactory.cube({
			name: "AvoidStoneBlock",
			scale: [1.8, 2.25, 1.35],
			position: [0, 1.12, 0],
			color: READABILITY_COLORS.avoidHazard
		});
	}

	/** @returns {object} Pushcart with terra body and focused dark wheels. */
	createCart() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "AvoidCartBody",
			scale: [1.85, 1.15, 1.2],
			position: [0, 0.82, 0],
			color: READABILITY_COLORS.avoidHazard
		}));
		for (const x of [-0.65, 0.65]) {
			root.add(this.wheels.create(x));
		}
		return root;
	}

	/** @returns {object} Stacked baskets that retain one lane-blocking mechanic cue. */
	createBasketStack() {
		const root = new Group();
		for (const [x, y] of [
			[-0.48, 0.45],
			[0.48, 0.45],
			[0, 1.18]
		]) {
			root.add(this.meshFactory.cube({
				name: "AvoidBasket",
				scale: [0.88, 0.78, 0.88],
				position: [x, y, 0],
				color: READABILITY_COLORS.avoidHazard
			}));
		}
		return root;
	}

	/** @returns {object} Market stall with deep body and brighter danger canopy. */
	createMarketStall() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "StallTable",
			scale: [1.9, 0.9, 1.25],
			position: [0, 0.55, 0],
			color: READABILITY_COLORS.avoidHazard
		}));
		root.add(this.meshFactory.cube({
			name: "StallCanopy",
			scale: [2.05, 0.18, 1.45],
			position: [0, 2.0, 0],
			color: READABILITY_COLORS.dangerAccent
		}));
		return root;
	}

	/** @returns {object} Lane-filling planter with semantic terra base and green crown. */
	createPlanter() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "AvoidPlanter",
			scale: [1.5, 0.82, 1.2],
			position: [0, 0.42, 0],
			color: READABILITY_COLORS.avoidHazard
		}));
		root.add(this.meshFactory.icosphere({
			name: "AvoidPlant",
			parameters: {
				radius: 0.82,
				subdivisions: 1
			},
			position: [0, 1.28, 0],
			color: READABILITY_COLORS.foliageDark
		}));
		return root;
	}
}
