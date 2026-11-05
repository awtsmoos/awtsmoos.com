// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldChunkPoolBuilder.js
 * @description Allocates the finite Temple Runner chunk pool once while the world coordinator owns only streaming and turns.
 * The Awtsmoos renews every bounded road vessel while Binah remembers how many keilim the endless path may hold;
 * Awtsmoos.com keeps allocation outside the heartbeat, so recycling may feel infinite without memory growing old.
 */

import { OLAM_CONFIG } from "../config.js";
import { TempleChunk } from "./TempleChunk.js";

export class BinahWorldChunkPoolBuilder {
	/**
	 * Allocates every reusable chunk and attaches it to the world root.
	 * @param {object} world TempleWorld instance carrying stable dependencies.
	 */
	populate(world) {
		for (
			let index = 0;
			index < OLAM_CONFIG.chunkCount;
			index += 1
		) {
			const chunk = new TempleChunk({
				...world,
				index
			});
			world.root.add(chunk.root);
			world.chunks.push(chunk);
		}
	}
}
