// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveMobileRepairInspection.mjs
 * @description Exercises real portrait UI, mission, impact, terrain, water, and tree runtime vessels.
 * The Awtsmoos lets the living page testify through action rather than assumption; Awtsmoos.com
 * measures actual rectangles, meshes, materials, reward chapter, and damage numerals in the world.
 */

import { evaluateMobile } from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export function inspectLiveMobileRepair(client) {
	return evaluateMobile(client, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const rect = node => {
			if (!node) return { inside: false, visible: false };
			const value = node.getBoundingClientRect();
			return {
				bottom: value.bottom,
				height: value.height,
				inside: value.left >= -1 && value.top >= -1
					&& value.right <= innerWidth + 1 && value.bottom <= innerHeight + 1,
				left: value.left,
				right: value.right,
				top: value.top,
				visible: value.width > 0 && value.height > 0,
				width: value.width
			};
		};
		const living = runtime.enemies.actors.find(actor => actor.alive);
		if (living) runtime.enemies.selectActor(living);
		await wait(80);
		runtime.bus.emit('combat:cast-start', {
			duration: 2,
			label: 'Flame of Aleph with a deliberately long mobile title',
			letters: 'אש',
			progress: 0.42,
			remaining: 1.16
		});
		await wait(80);
		const cast = rect(document.querySelector('.Awtsmoos-cast-meter'));
		const status = rect(document.querySelector('.Awtsmoos-status-dock'));
		const target = rect(document.querySelector('.Awtsmoos-target-frame'));
		runtime.bus.emit('combat:cast-launch', { label: 'Flame of Aleph', letters: 'אש' });
		runtime.bus.emit('combat:impact', {
			damage: 23,
			defeated: false,
			health: 17,
			label: 'Flame of Aleph',
			letters: 'אש',
			position: runtime.camera.target
		});
		await wait(80);
		const damage = document.querySelector('.Awtsmoos-damage-feedback');
		const damageReceipt = damage ? {
			inside: rect(damage).inside,
			label: damage.querySelector('small')?.textContent || '',
			number: damage.querySelector('strong')?.textContent || ''
		} : null;
		const quest = runtime.quest;
		if (quest.status === 'available') quest.accept();
		if (quest.status === 'active') {
			for (let index = 0; index < 5; index += 1) {
				runtime.bus.emit('enemy:defeated', { id: 'browser-shadow-' + index });
			}
		}
		if (quest.status === 'ready') quest.complete();
		runtime.bus.emit('quest:offer', quest.snapshot());
		await wait(80);
		const parchment = document.querySelector('.Awtsmoos-quest-parchment');
		const questReceipt = {
			completion: parchment?.dataset.completionChapter === 'true',
			containsReward: /Reward received/.test(parchment?.textContent || ''),
			status: quest.status
		};
		document.querySelector('.Awtsmoos-quest-parchment [data-continue]')?.click();
		const scene = [];
		runtime.scene.traverse(object => { if (object?.isMesh) scene.push(object); });
		const road = scene.find(mesh => mesh.userData?.AwtsmoosRoad);
		const waterMeshes = scene.filter(mesh => mesh.userData?.waterVariant);
		const treeMaterials = scene.flatMap(mesh => Array.isArray(mesh.material)
			? mesh.material : [mesh.material]).filter(material => material?.texturePolicy?.authoredAlphaPreserved);
		return {
			damage: damageReceipt,
			layout: { cast, status, target },
			quest: questReceipt,
			road: road ? {
				layers: road.material.textureLayers?.map(layer => layer.role) || [],
				surfaceLift: road.userData.AwtsmoosRoad.surfaceLift,
				visible: road.visible
			} : null,
			trees: {
				authoredMaterials: treeMaterials.length,
				preserved: treeMaterials.every(material => material.texturePolicy.authoredAlphaPreserved)
			},
			water: {
				diagnostics: runtime.water?.diagnostics?.() || null,
				meshes: waterMeshes.length,
				sources: waterMeshes.map(mesh => ({
					detail: Boolean(mesh.material.normalDetailImage),
					map: Boolean(mesh.material.mapImage),
					mix: Boolean(mesh.material.mixImage),
					normal: Boolean(mesh.material.normalImage)
				}))
			}
		};
		function wait(milliseconds) {
			return new Promise(resolve => setTimeout(resolve, milliseconds));
		}
	})()`);
}
