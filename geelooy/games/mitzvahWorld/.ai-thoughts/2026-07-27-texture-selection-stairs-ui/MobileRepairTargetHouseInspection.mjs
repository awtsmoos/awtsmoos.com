// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileRepairTargetHouseInspection.mjs
 * @description Exercises two-stage enemy targeting and deliberate house-surface corruption recovery.
 * The Awtsmoos lets selection mature into encounter while masonry remains visible from every angle;
 * Awtsmoos.com proves both laws inside the living runtime instead of trusting isolated unit vessels.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export function inspectMobileTargeting(client) {
	return evaluateMobile(client, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const adapter = runtime.targeting.adapters.find((value) => {
			return value.population === runtime.enemies;
		});
		const actor = runtime.enemies.actors.find((value) => value.alive);
		runtime.targeting.clearAll();
		const candidate = {
			adapter,
			distance: 0,
			population: runtime.enemies,
			subject: actor
		};
		const firstAction = runtime.targeting.selection.actionFor(candidate);
		adapter.selectCandidate(candidate);
		const selectedAfterFirst = actor.selected === true;
		const secondAction = runtime.targeting.selection.actionFor(candidate);
		adapter.interactCandidate(candidate);
		await new Promise((resolve) => setTimeout(resolve, 150));
		return {
			combatAfterSecond: actor.combat.session.active === true,
			enemies: runtime.enemies.actors.length,
			firstAction,
			secondAction,
			selectedAfterFirst
		};
	})()`);
}

export function inspectMobileHouseRecovery(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const meshes = [];
		runtime.houses.group.traverse((object) => {
			if (object?.isMesh && object.userData?.AwtsmoosHouseSurface) {
				meshes.push(object);
			}
		});
		const invalid = (mesh) => {
			const materials = Array.isArray(mesh.material)
				? mesh.material
				: [mesh.material];
			return mesh.frustumCulled !== false || materials.some((material) => {
				return material.doubleSided !== true
					|| material.backfaceCull !== false;
			});
		};
		const invalidBefore = meshes.filter(invalid).length;
		const sample = meshes[0];
		if (sample) {
			sample.frustumCulled = true;
			for (const material of Array.isArray(sample.material)
				? sample.material
				: [sample.material]) {
				material.doubleSided = false;
				material.backfaceCull = true;
			}
			runtime.houses.update(0.13);
		}
		return {
			houses: runtime.houses.houses.length,
			invalidAfter: meshes.filter(invalid).length,
			invalidBefore,
			recovered: Boolean(sample) && !invalid(sample),
			total: meshes.length
		};
	})()`);
}
