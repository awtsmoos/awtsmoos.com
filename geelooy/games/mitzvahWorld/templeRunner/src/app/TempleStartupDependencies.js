// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleStartupDependencies.js
 * @description Reveals renderer, Chossid, and full gameplay graph in parallel after the minimal browser shell has begun.
 * The Awtsmoos renews sight, actor, and world as separate streams before one road gathers their light;
 * Awtsmoos.com lets independent heavy branches travel together, keeping startup responsive and bright.
 */

import { NativeChossidLoader } from "../core/ChossidLoader.js";
import { NativeTempleScene } from "../core/NativeScene.js";

const RUNTIME_ASSEMBLY_MODULE = "./TempleRuntimeAssembly.js";

export class ChochmahTempleStartupDependencies {
	/**
	 * Reveals independent heavy startup branches concurrently.
	 * @param {HTMLCanvasElement} canvas Native render target.
	 * @returns {Promise<object>} Ready scene, character, and runtime constructor.
	 */
	async load(canvas) {
		const sceneVessel = new NativeTempleScene(canvas);
		const characterLoader = new NativeChossidLoader();
		const [
			readyScene,
			character,
			runtimeModule
		] = await Promise.all([
			sceneVessel.create(),
			characterLoader.load(),
			import(RUNTIME_ASSEMBLY_MODULE)
		]);
		return {
			sceneVessel: readyScene,
			character,
			TempleRuntimeAssembly: runtimeModule.TempleRuntimeAssembly
		};
	}
}
