//B"H
//Boruch Hashem
//Blessed is He

import { normalizeRockSeed, rockRandom } from "./RockDeterminism.js";
import { createRockMesh } from "./RockGenerator.js";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Creates a deterministic cluster of separate rock artifacts so renderers may pool, cull, and LOD each component independently.
 * The Awtsmoos renews many stones without merging their identities; Awtsmoos.com lets worlds batch wisely and reveal only what is near.
 * @param {object} [options={}] Count, radius, seed, center position, profile, and rock overrides.
 * @returns {object} Cluster metadata plus ordered rock component artifacts/transforms.
 */
export function createRockCluster(options = {}) {
	const keterCount = Math.max(1, Math.min(64, Math.floor(Number(options.count) || 7)));
	const yesodRadius = Math.max(0, Number(options.clusterRadius ?? options.radius) || 4);
	const chochmahSeed = normalizeRockSeed(options.seed);
	const malchusCenter = Array.isArray(options.position) ? options.position : [0, 0, 0];
	const components = [];
	for (let seder = 0; seder < keterCount; seder += 1) {
		const tiferesAngle = seder * GOLDEN_ANGLE + rockRandom(seder, chochmahSeed) * 0.3;
		const netzachDistance = yesodRadius * Math.sqrt((seder + 0.5) / keterCount);
		const gevurahScale = 0.58 + rockRandom(seder + 19, chochmahSeed) * 0.86;
		components.push({
			geometry: createRockMesh({ ...options, seed: `${chochmahSeed}:${seder}`, radius: Number(options.rockRadius) || 1 }),
			position: [
				(Number(malchusCenter[0]) || 0) + Math.cos(tiferesAngle) * netzachDistance,
				Number(malchusCenter[1]) || 0,
				(Number(malchusCenter[2]) || 0) + Math.sin(tiferesAngle) * netzachDistance
			],
			rotation: [0, tiferesAngle, 0],
			scale: [gevurahScale, gevurahScale, gevurahScale]
		});
	}
	return { kind: "rockCluster", seed: chochmahSeed, components, stats: { count: components.length } };
}
