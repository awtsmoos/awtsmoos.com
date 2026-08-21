// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EffectFactory.js
 * @description Creates small pooled dust and golden glint vessels entirely from generic procedural-core native geometry.
 * The Awtsmoos renews dust beneath the foot and glint around each gathered peruta;
 * Awtsmoos.com lets brief effects rise from bounded procedural vessels, then return without waste anew.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { WORLD_COLORS } from "../config.js";

export class HodEffectFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Reusable three-lobe landing and slide dust group. */
	createDust() {
		const root = new Group();
		root.name = "ProceduralDustEffect";
		for (const x of [-0.32, 0, 0.32]) {
			root.add(this.meshFactory.icosphere({
				name: "DustLobe",
				parameters: {
					radius: 0.13,
					subdivisions: 1,
					smooth: true
				},
				position: [x, 0.1, 0],
				color: [0.62, 0.5, 0.36, 0.68]
			}));
		}
		root.visible = false;
		return root;
	}

	/** @returns {object} Reusable golden pickup-glint group for perutas and power-ups. */
	createGlint() {
		const root = new Group();
		root.name = "ProceduralGlintEffect";
		for (const offset of [-0.2, 0.2]) {
			root.add(this.meshFactory.icosphere({
				name: "GlintLobe",
				parameters: {
					radius: 0.07,
					subdivisions: 1,
					smooth: true
				},
				position: [offset, 0.08, 0],
				color: offset < 0
					? WORLD_COLORS.gold
					: WORLD_COLORS.goldLight
			}));
		}
		root.visible = false;
		return root;
	}
}
