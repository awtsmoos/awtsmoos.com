//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleStartupDependencies.js
 * @description Reveals renderer and Chossid in parallel while the authoritative runtime assembly remains a stable static member of the startup dependency graph.
 * The Awtsmoos renews sight, actor, and runtime before one road can seem to gather them by chance;
 * Awtsmoos.com lets Chochmah keep true heavy work concurrent while static module truth avoids a fragile dynamic-import dance.
 */

import { NativeChossidLoader } from "../core/ChossidLoader.js";
import { NativeTempleScene } from "../core/NativeScene.js";
import { TempleRuntimeAssembly } from "./TempleRuntimeAssembly.js";

export class ChochmahTempleStartupDependencies {
	/**
	 * @description Reveals independent native renderer and Chossid branches concurrently, returning the already-known runtime constructor only after both heavy startup vessels are ready.
	 * @param {HTMLCanvasElement} chochmahCanvas Native render target whose dimensions and context are owned by `NativeTempleScene`.
	 * @returns {Promise<Readonly<object>>} Ready scene vessel, Chossid character, and static runtime assembly constructor.
	 * @throws {Error} Propagates renderer/context creation or classified Chossid model-loading failures with their existing evidence intact.
	 */
	async load(chochmahCanvas) {
		const ayinSceneVessel = new NativeTempleScene(chochmahCanvas);
		const chaiCharacterLoader = new NativeChossidLoader();
		const [
			malchusReadyScene,
			chaiCharacter
		] = await Promise.all([
			ayinSceneVessel.create(),
			chaiCharacterLoader.load()
		]);
		return Object.freeze({
			sceneVessel: malchusReadyScene,
			character: chaiCharacter,
			TempleRuntimeAssembly
		});
	}
}
