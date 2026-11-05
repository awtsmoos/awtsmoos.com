// B"H
import {
	REPEAT_HOOKS,
	terrainRepeat,
	textureSize
} from '../assets/TextureRepeat.js';
import { PROCEDURAL_SOURCE } from './ProceduralBridge.js';

export function createTerrainStats({ terrain, road, roadColliders, obstacleColliders, obstacles, grassImage, sampler }) {
	const repeat = terrainRepeat(terrain.size, grassImage);
	const pixels = textureSize(grassImage);
	return {
		terrainTriangles: terrain.colliders.length,
		terrainSize: terrain.size,
		terrainSteps: terrain.steps,
		roadTriangles: roadColliders.length,
		obstacleTriangles: obstacleColliders.length,
		obstacles: obstacles.length,
		proceduralSource: `${PROCEDURAL_SOURCE} + shared static collision geometry`,
		grassUrl: grassImage?.src || null,
		grassRepeat: repeat,
		dirtRepeat: null,
		repeatMode: 'mirror-pingpong',
		groundSampler: sampler?.stats?.().mode || 'terrain-height-phase-one',
		mixShader: 'disabled-grass-only',
		grassPixels: pixels,
		texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld,
		textureWorldSize: [
			pixels.w / REPEAT_HOOKS.terrainTexelsPerWorld,
			pixels.h / REPEAT_HOOKS.terrainTexelsPerWorld
		],
		road: {
			id: road.visual.id,
			colliders: roadColliders.length,
			segments: road.stats.visualSegments,
			anchors: road.anchors,
			walkable: true,
			...road.stats
		},
		houseStats: { houses: obstacles.userData?.houses || [] },
		stairStats: obstacles.userData?.stairs || [],
		stairLayouts: obstacles.userData?.stairLayouts || [],
		mezuzaStats: { items: obstacles.userData?.mezuzahs || [] },
		roomStats: obstacles.userData?.rooms || []
	};
}
