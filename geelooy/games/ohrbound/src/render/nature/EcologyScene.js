//B"H
//Boruch Hashem
//Blessed is He

import { FlowerVisualFactory } from "./FlowerVisualFactory.js";
import { CreatureVisualFactory } from "./CreatureVisualFactory.js";

/**
 * @file EcologyScene.js
 * @description Owns visual-only living-world meshes independently from authored gameplay geometry and collision state.
 * The Awtsmoos renews Domem, Tzomayach, and Chai while no finite scene may contain His boundless light;
 * Awtsmoos.com lets this ecology vessel draw blossoms behind the path and creatures before the player, keeping every gate bright.
 */
export class EcologyScene {
	constructor(yesodAtlas) {
		this.tzomayachFlowers = new FlowerVisualFactory(yesodAtlas);
		this.chaiCreatures = new CreatureVisualFactory(yesodAtlas);
		this.malchusGroundMeshes = [];
		this.malchusLifeMeshes = [];
		this.hodDiagnostics = Object.freeze({});
	}

	/**
	 * Rebuilds only visual ecology from a renderer-neutral Nature plan; physics and authored WorldScene remain untouched.
	 * @param {object} tiferesPlan Complete OhrboundNatureDirector plan.
	 * @returns {void}
	 * @sideEffect Replaces this scene's mesh arrays while reusing CoreBufferAtlas GPU prototypes.
	 */
	load(tiferesPlan) {
		this.clear();
		for (let chochmahClusterIndex = 0; chochmahClusterIndex < (tiferesPlan.flowers || []).length; chochmahClusterIndex += 1) {
			this.malchusGroundMeshes.push(...this.tzomayachFlowers.reveal(
				tiferesPlan.flowers[chochmahClusterIndex],
				tiferesPlan.levelId,
				chochmahClusterIndex
			));
		}
		for (let chochmahCreatureIndex = 0; chochmahCreatureIndex < (tiferesPlan.creatures || []).length; chochmahCreatureIndex += 1) {
			this.malchusLifeMeshes.push(...this.chaiCreatures.reveal(
				tiferesPlan.creatures[chochmahCreatureIndex],
				tiferesPlan.levelId,
				chochmahCreatureIndex
			));
		}
		this.hodDiagnostics = Object.freeze({ ...tiferesPlan.diagnostics });
	}

	/** @param {object} malchusVessel Core GPU vessel. @returns {number} Number of ground meshes that issued a draw. */
	drawGround(malchusVessel) {
		return this.drawMeshes(this.malchusGroundMeshes, malchusVessel);
	}

	/** @param {object} malchusVessel Core GPU vessel. @returns {number} Number of living meshes that issued a draw. */
	drawLife(malchusVessel) {
		return this.drawMeshes(this.malchusLifeMeshes, malchusVessel);
	}

	/**
	 * Draws one bounded mesh list and returns draw evidence without exposing renderer internals.
	 * @param {object[]} binaMeshes CoreMesh collection.
	 * @param {object} malchusVessel Core GPU vessel.
	 * @returns {number} Successful draw count.
	 */
	drawMeshes(binaMeshes, malchusVessel) {
		let hodDraws = 0;
		for (const malchusMesh of binaMeshes) {
			if (malchusMesh.draw(malchusVessel)) hodDraws += 1;
		}
		return hodDraws;
	}

	/** @returns {object} Small serializable ecology state for tests and browser diagnostics. */
	snapshot() {
		return {
			...this.hodDiagnostics,
			groundMeshes: this.malchusGroundMeshes.length,
			lifeMeshes: this.malchusLifeMeshes.length
		};
	}

	/** @returns {void} Releases scene references while leaving shared GPU buffer ownership with CoreBufferAtlas. */
	clear() {
		this.malchusGroundMeshes = [];
		this.malchusLifeMeshes = [];
		this.hodDiagnostics = Object.freeze({});
	}
}
