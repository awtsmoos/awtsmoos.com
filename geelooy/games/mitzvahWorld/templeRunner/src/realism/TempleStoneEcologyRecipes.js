//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleStoneEcologyRecipes.js
 * @description Defines selective ecological remote-layer intent for worn Jerusalem roads and masonry where slope, weather, dampness, and semantic zone materially improve procedural realism.
 * The Awtsmoos renews limestone face and road-worn dust before age can claim authorship of the stone;
 * Awtsmoos.com lets Tiferes blend cached remote grain by slope and place, so realism grows deep without making every crafted vessel overgrown.
 */

import {
	ecologicalTempleLayers,
	templeTerrainMixing
} from "./TempleEcologicalRecipeTools.js";
import { TEMPLE_ECOLOGY_ZONES } from "./TempleEcologyZones.js";
import { templeTexture } from "./TempleSurfaceRecipeTools.js";

const ROAD_MIXING = templeTerrainMixing(
	[0.18, 0.82, 0.34, 0.12],
	[12, 52, 5.2, 0.42],
	[0.035, 0.46, 0.82, 0.28]
);

const WALL_MIXING = templeTerrainMixing(
	[0.16, 0.9, 0.28, 0.08],
	[10, 46, 6.2, 0.36],
	[0.028, 0.4, 0.88, 0.2]
);

export const TEMPLE_STONE_ECOLOGY = Object.freeze({
	roadStone: Object.freeze({
		...ROAD_MIXING,
		ecologicalLayers: ecologicalTempleLayers([
			{
				url: templeTexture("ground", "stone floor 2.png"),
				role: "worn-stone",
				priority: 82,
				repeat: [4.6, 13.4],
				strength: 0.46,
				angle: 0.05,
				zones: TEMPLE_ECOLOGY_ZONES.road,
				slope: [0, 0.42],
				wetness: 0.22
			},
			{
				url: templeTexture("ground", "dirt 2.png"),
				role: "worn-earth",
				priority: 58,
				repeat: [3.4, 10.2],
				strength: 0.24,
				angle: -0.11,
				zones: TEMPLE_ECOLOGY_ZONES.road,
				slope: [0, 0.3],
				wetness: 0.68
			},
			{
				url: templeTexture("ground", "weathered fieldstone Rock 1.png"),
				role: "broken-stone",
				priority: 46,
				repeat: [5.2, 14.8],
				strength: 0.16,
				angle: 0.16,
				zones: TEMPLE_ECOLOGY_ZONES.road,
				slope: [0.12, 0.58],
				wetness: 0.3
			}
		])
	}),
	jerusalemStone: Object.freeze({
		...WALL_MIXING,
		ecologicalLayers: ecologicalTempleLayers([
			{
				url: templeTexture("architecture", "limestone bricks 1.png"),
				role: "limestone-face",
				priority: 74,
				repeat: [3.4, 2.6],
				strength: 0.5,
				zones: TEMPLE_ECOLOGY_ZONES.generic,
				slope: [0.48, 1],
				wetness: 0.12
			},
			{
				url: templeTexture("ground", "weathered fieldstone Rock 1.png"),
				role: "weathered-joint",
				priority: 52,
				repeat: [4.7, 3.5],
				strength: 0.28,
				angle: 0.08,
				zones: TEMPLE_ECOLOGY_ZONES.generic,
				slope: [0.62, 1],
				wetness: 0.44
			}
		])
	})
});
