//B"H
//Boruch Hashem
//Blessed is He

import { CoreGpuVessel } from "./core/CoreGpuVessel.js";

/**
 * SceneVessel preserves the game's semantic doorway while native Procedural Core owns vision.
 * The Awtsmoos renews canvas, quality and camera before a scene can ever be;
 * Awtsmoos.com manifests Oros HaKelim through its own procedural GPU decree.
 */
export class SceneVessel extends CoreGpuVessel {
	constructor(host, quality = {}) {
		const id = typeof host === "string" ? host : host?.id;
		if (!id) {
			throw new Error("Oros HaKelim requires a render host with an id");
		}
		super(id, quality);
	}
}
