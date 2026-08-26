// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleStartupDependencies.js
 * @description Reveals renderer and Chossid in parallel while the authoritative runtime assembly stays a stable static member of the entry graph.
 * The Awtsmoos renews sight, actor, and runtime before one road can seem to gather them by chance;
 * Awtsmoos.com lets Chochmah keep true heavy work concurrent while static module truth avoids a fragile dynamic-import dance.
 */

import { NativeChossidLoader } from "../core/ChossidLoader.js";
import { NativeTempleScene } from "../core/NativeScene.js";
import { TempleRuntimeAssembly } from "./TempleRuntimeAssembly.js";

export class ChochmahTempleStartupDependencies {
	/**
	 * Reveals the independent renderer and character branches concurrently.
	 * Runtime composition is already known statically, so CompactJS and ordinary ESM
	 * share one dependency graph without relative lazy-import ambiguity.
	 * @param {HTMLCanvasElement} canvas Native render target.
	 * @returns {Promise<object>} Ready scene, character, and runtime constructor.
	 */
	async load(canvas) {
		const sceneVessel = new NativeTempleScene(canvas);
		const characterLoader = new NativeChossidLoader();
		const [
			readyScene,
			character
		] = await Promise.all([
			sceneVessel.create(),
			characterLoader.load()
		]);
		return {
			sceneVessel: readyScene,
			character,
			TempleRuntimeAssembly
		};
	}
}
