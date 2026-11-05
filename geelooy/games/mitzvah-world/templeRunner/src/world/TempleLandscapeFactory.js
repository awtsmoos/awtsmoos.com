// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleLandscapeFactory.js
 * @description Builds textured Jerusalem stone, bronze lamps, bridge rails, and delegated living scenery through the generic native core.
 * The Awtsmoos renews stone, lamp, column, and railing before a district may stand;
 * Awtsmoos.com lets limestone mingle with fieldstone and bronze weather softly, while every gameplay lane stays clear across the land.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import {
	OLAM_CONFIG,
	WORLD_COLORS
} from "../config.js";
import { TzomayachTempleNatureFactory } from "./TempleNatureFactory.js";

const STATIC_MODEL = Object.freeze({ static: true });

export class TempleLandscapeFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
		this.nature = new TzomayachTempleNatureFactory(meshFactory);
	}

	/** @param {number} x World X. @param {number} z Local Z. @param {Array<number>} color Column color. */
	createColumn(x, z, color = WORLD_COLORS.stone) {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "JerusalemColumn",
			position: [x, 2.1, z],
			scale: [0.55, 4.2, 0.55],
			color,
			surface: "jerusalemStone",
			worldModel: STATIC_MODEL
		}));
		root.add(this.meshFactory.cube({
			name: "ColumnCapital",
			position: [x, 4.3, z],
			scale: [0.9, 0.28, 0.9],
			color: WORLD_COLORS.gold,
			worldModel: STATIC_MODEL
		}));
		return root;
	}

	/**
	 * Creates one warm procedural street lamp with restrained remote bronze weathering.
	 * @param {number} x World X.
	 * @param {number} z Local Z.
	 * @param {boolean} evening Whether evening glow is enlarged.
	 * @returns {object} Lamp group.
	 */
	createLamp(x, z, evening = false) {
		const root = new Group();
		root.add(this.meshFactory.cylinder({
			name: "JerusalemLampStem",
			parameters: {
				radiusTop: 0.05,
				radiusBottom: 0.08,
				height: 2.5,
				radialSegments: 8
			},
			position: [x, 1.25, z],
			color: WORLD_COLORS.bronze,
			surface: "bronze",
			worldModel: STATIC_MODEL
		}));
		root.add(this.meshFactory.icosphere({
			name: "JerusalemLampGlow",
			parameters: {
				radius: evening ? 0.4 : 0.3,
				subdivisions: 1
			},
			position: [x, 2.7, z],
			color: evening
				? [1, 0.78, 0.28, 1]
				: [1, 0.9, 0.5, 1]
		}));
		return root;
	}

	/** Delegates living scenery to its dedicated Tzomayach factory. */
	createTree(x, z, seed = 0) {
		return this.nature.createTree(x, z, seed);
	}

	/** @param {number} side Signed road side. @param {Array<number>} color Wall color. */
	createWall(side, color = WORLD_COLORS.stoneLight) {
		return this.meshFactory.cube({
			name: "JerusalemSideWall",
			position: [side * (OLAM_CONFIG.sideX + 2.1), 1.15, 0],
			scale: [0.35, 2.3, OLAM_CONFIG.chunkLength],
			color,
			surface: "jerusalemStone",
			worldModel: STATIC_MODEL
		});
	}

	/** @param {number} side Signed road side. @returns {object} Bridge railing. */
	createRail(side) {
		return this.meshFactory.cube({
			name: "BridgeRail",
			position: [side * 5.72, 1.0, 0],
			scale: [0.18, 1.6, OLAM_CONFIG.chunkLength],
			color: WORLD_COLORS.stoneDark,
			surface: "jerusalemStoneDark",
			worldModel: STATIC_MODEL
		});
	}
}
