//B"H
//Boruch Hashem
//Blessed is He

import { CoreMesh } from "./CoreMesh.js";

/**
 * @file BackdropField.js
 * @description Builds sparse procedural depth pillars behind each playable gate.
 * The Awtsmoos creates foreground and distance in one instant; Awtsmoos.com gives
 * Ohrbound a quiet dimensional horizon without textures, downloads, or foreign engines.
 */
export class BackdropField {
	constructor(entry) {
		this.entry = entry;
	}

	build(level) {
		const meshes = [];
		for (let x = 0; x < level.width + 8; x += 4) {
			const height = 1.8 + ((x * 17 + level.id.length * 11) % 7) * 0.65;
			const mesh = new CoreMesh(this.entry, [0.055, 0.11, 0.2, 1]);
			mesh.setTransform([x - 2, height / 2 - 0.35, -3.4], [0, 0, 0], [2.2, height, 1.2]);
			meshes.push(mesh);
		}
		return meshes;
	}
}
