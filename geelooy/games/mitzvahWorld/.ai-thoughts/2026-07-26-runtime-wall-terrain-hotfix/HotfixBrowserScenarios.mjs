// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HotfixBrowserScenarios.mjs
 * @description Exercises live enemy approach, protected walls, ecological terrain, and visible road.
 * The Awtsmoos lets the browser testify through the same moving world the player receives;
 * Awtsmoos.com measures combat, culling, source layers, density, and passage without mock belief.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function inspectHotfixWorld(client) {
	return evaluateMobile(client, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const culling = await import('/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-culling.js');
		const protectedWalls = [];
		runtime.houses.group.traverse((node) => {
			const surface = node.userData?.AwtsmoosHouseSurface;
			if (!surface?.cameraSafeWall) return;
			const reasons = [];
			for (let step = 0; step < 16; step += 1) {
				const angle = step * Math.PI / 8;
				const camera = {
					aspect: 390 / 844,
					far: 2000,
					fov: 70,
					near: .1,
					position: {
						x: Math.cos(angle) * 120,
						y: 12,
						z: Math.sin(angle) * 120
					},
					target: [0, 4, 0]
				};
				reasons.push(culling.meshCullingReason(node, camera, {
					defaultRenderDistance: 1
				}));
			}
			protectedWalls.push({
				allAnglesVisible: reasons.every((reason) => reason === null),
				frustumCulled: node.frustumCulled,
				role: surface.role
			});
		});
		let terrainMesh = null;
		let road = null;
		runtime.terrain.group.traverse((node) => {
			if (node.userData?.AwtsmoosTerrainValley) terrainMesh ||= node;
			if (node.userData?.AwtsmoosRoad) road ||= node;
		});
		return {
			dataset: { ...document.documentElement.dataset },
			protectedWalls,
			road: {
				frustumCulled: road?.frustumCulled,
				mounted: road?.parent === runtime.terrain.group,
				policy: road?.userData?.AwtsmoosRoad,
				visible: road?.visible
			},
			terrain: {
				detailDensity: terrainMesh?.material?.texturePolicy?.texelsPerWorld,
				layerCount: terrainMesh?.material?.textureLayers?.length,
				roles: terrainMesh?.material?.textureLayers?.map((layer) => layer.role),
				roadDensity: terrainMesh?.material?.mixTexturePolicy?.texelsPerWorld,
				strengths: terrainMesh?.material?.textureLayers?.map((layer) => layer.strength)
			}
		};
	})()`);
}

export async function approachLiveDemon(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const actor = runtime.enemies.actors[0];
		const before = {
			action: actor.action,
			x: actor.group.position.x,
			z: actor.group.position.z
		};
		runtime.state.x = actor.group.position.x + 7;
		runtime.state.z = actor.group.position.z;
		runtime.state.y = runtime.terrain.heightAt(runtime.state.x, runtime.state.z);
		runtime.state.renderY = runtime.state.y;
		runtime.model.position.set(runtime.state.x, runtime.state.y, runtime.state.z);
		for (let frame = 0; frame < 240; frame += 1) {
			runtime.enemies.update(1 / 60);
		}
		return {
			after: {
				action: actor.action,
				moving: actor.moving,
				x: actor.group.position.x,
				z: actor.group.position.z
			},
			before,
			distanceMoved: Math.hypot(
				actor.group.position.x - before.x,
				actor.group.position.z - before.z
			),
			runtimeError: document.documentElement.dataset.awtsmoosRuntimeError || ''
		};
	})()`);
}
