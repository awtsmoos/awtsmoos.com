//B"H
//Boruch Hashem
//Blessed is He

import { CoreMesh } from "./CoreMesh.js";

/**
 * @file BackdropField.js
 * @description Builds two sparse textured depth bands so each world reads as a place, not a void.
 * The Awtsmoos creates foreground and distance in one instant; Awtsmoos.com lets quiet
 * material pillars recede behind play so atmosphere deepens without stealing the traveler's sight.
 */
export class BackdropField {
	constructor(entry) {
		this.entry = entry;
	}

	/** Builds deterministic near and far material pillars from the level id and world theme. */
	build(level, theme) {
		return [
			...this.layer(level, theme, {
				step: 5,
				depth: -3.8,
				width: 2.4,
				heightBase: 2.2,
				heightStep: 0.62,
				seed: 17
			}),
			...this.layer(level, theme, {
				step: 8,
				depth: -6.4,
				width: 3.7,
				heightBase: 3.2,
				heightStep: 0.8,
				seed: 29
			})
		];
	}

	/** Creates one horizon band from shared geometry and the world's backdrop material. */
	layer(level, theme, options) {
		const meshes = [];
		for (let x = -4; x < level.width + 10; x += options.step) {
			const variance = (
				(x * options.seed + level.id.length * 11) % 7 + 7
			) % 7;
			const height = options.heightBase + variance * options.heightStep;
			const mesh = new CoreMesh(
				this.entry,
				theme.backdrop.color,
				theme.backdrop
			);
			mesh.setTransform(
				[x, height / 2 - 0.55, options.depth],
				[0, 0, 0],
				[options.width, height, 1.45]
			);
			meshes.push(mesh);
		}
		return meshes;
	}
}
