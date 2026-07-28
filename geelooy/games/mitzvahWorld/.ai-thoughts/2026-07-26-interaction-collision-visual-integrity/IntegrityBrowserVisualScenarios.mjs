// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IntegrityBrowserVisualScenarios.mjs
 * @description Inspects staff, house surfaces, rooted growth, bark, and broad terrain in WebGL.
 * The Awtsmoos lets each visible vessel answer from the living scene; Awtsmoos.com measures
 * ownership, sidedness, grounding, depth, and source coverage without trusting diagnostics alone.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function inspectIntegrityVisuals(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		runtime.equipment?.update?.();
		runtime.vegetation?.update?.(1 / 60);
		const weapon = runtime.equipment?.weapon;
		const weaponMeshes = [];
		weapon?.traverse?.((node) => {
			if (node.isMesh || node.isSkinnedMesh) weaponMeshes.push(node);
		});
		const anchor = weapon?.parent;
		const houseSurfaces = [];
		runtime.houses.group.traverse((node) => {
			const surface = node.userData?.AwtsmoosHouseSurface;
			if (!surface) return;
			const materials = Array.isArray(node.material) ? node.material : [node.material];
			houseSurfaces.push({
				allDoubleSided: materials.every((material) => material?.doubleSided === true),
				allNoBackfaceCull: materials.every((material) => material?.backfaceCull === false),
				frustumCulled: node.frustumCulled,
				role: surface.role
			});
		});
		const vegetation = runtime.vegetation?.cells?.map((cell) => ({
			childrenRooted: cell.group.children.every((child) => {
				return child.userData?.AwtsmoosYardGrass?.rooted === true;
			}),
			quaternion: [
				cell.group.quaternion.x,
				cell.group.quaternion.y,
				cell.group.quaternion.z,
				cell.group.quaternion.w
			]
		})) || [];
		const bark = [];
		(runtime.trees?.group || runtime.scene).traverse((node) => {
			if (node.userData?.part !== 'procedural-core-connected-branches') return;
			bark.push({
				backfaceCull: node.material?.backfaceCull,
				depthWrite: node.material?.depthWrite,
				doubleSided: node.material?.doubleSided,
				frustumCulled: node.frustumCulled
			});
		});
		let terrainMesh = null;
		runtime.terrain.group.traverse((node) => {
			if (node.userData?.AwtsmoosTerrainValley) terrainMesh ||= node;
		});
		return {
			bark,
			dataset: { ...document.documentElement.dataset },
			houseSurfaces,
			terrain: {
				layerCount: terrainMesh?.material?.textureLayers?.length,
				policy: terrainMesh?.material?.texturePolicy
			},
			vegetation,
			weapon: {
				anchor: anchor?.name || null,
				anchorDistance: anchor ? Math.hypot(
					anchor.position.x,
					anchor.position.y,
					anchor.position.z
				) : Infinity,
				anchorOwner: anchor?.parent === runtime.model,
				meshCount: weaponMeshes.length,
				meshesVisible: weaponMeshes.every((mesh) => {
					return mesh.visible && mesh.frustumCulled === false;
				}),
				visible: weapon?.visible === true
			}
		};
	})()`);
}
