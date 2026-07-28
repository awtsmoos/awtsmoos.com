// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileGameplayProbeCoreScenarios.mjs
 * @description Inspects the real Bag, wall roles, demon surfaces, equipment, and released facing.
 * The Awtsmoos lets visible world truth answer from the living runtime; Awtsmoos.com
 * records canonical slots, measured surfaces, held tools, and remembered direction.
 */

import { evaluateMobile } from './MobileCdpClient.mjs';

export async function inspectMobileCore(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const equipmentButtons = [...document.querySelectorAll('[data-equipment] .inv-slot.equip')];
		const walls = [];
		runtime.houses.group.traverse((node) => {
			const record = node.userData?.AwtsmoosHouseSurface;
			if (record) walls.push({
				cameraSafeWall: record.cameraSafeWall,
				frustumCulled: node.frustumCulled,
				role: record.role,
				sidedness: record.sidedness
			});
		});
		const demons = runtime.enemies.actors.map((actor) => {
			let material = null;
			actor.group.traverse((node) => { material ||= node.material || null; });
			const color = material?.baseColorFactor || material?.color || [];
			const luminance = (color[0] || 0) * .2126
				+ (color[1] || 0) * .7152
				+ (color[2] || 0) * .0722;
			return {
				emissiveStrength: material?.emissiveStrength,
				luminance,
				mapped: Boolean(material?.mapImage || material?.map),
				name: actor.profile.name
			};
		});
		return {
			dataset: { ...document.documentElement.dataset },
			demons,
			equipment: runtime.equipment.diagnostics(),
			equipmentSlots: equipmentButtons.map((button) => button.dataset.slot),
			equipmentSnapshot: runtime.inventory.snapshot().equipment,
			featureStatus: runtime.featureStatus,
			walls
		};
	})()`);
}

export async function inspectReleasedFacing(client) {
	return evaluateMobile(client, `(async () => {
		const module = await import('/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowTravelFacingPolicy.js');
		const moving = module.retainedMinimalMeadowTravelFacing({ x: 1, z: 0 }, 0, 0);
		const released = module.retainedMinimalMeadowTravelFacing({ x: 0, z: 0 }, moving, -1);
		return { moving, released, retained: moving === released };
	})()`);
}
