// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NativeQualityBrowserRuntime.mjs
 * @description Exercises hand casting, icons, mercy, spacing, highlight, mission, and native terrain.
 * The Awtsmoos lets the living browser answer through the same finite controls a child receives;
 * Awtsmoos.com measures real ownership, aim, choice, mission truth, and exact source frequency.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function inspectNativeQualityRuntime(client) {
	return evaluateMobile(client, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const policyModule = await import('/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCombatBalancePolicy.js');
		let terrain = null;
		runtime.terrain.group.traverse((node) => {
			if (node.userData?.AwtsmoosTerrainValley) terrain ||= node;
		});
		const weapon = runtime.equipment.weapon;
		const anchor = weapon?.parent;
		const buttons = [...document.querySelectorAll('[data-action-id]')].map((button) => ({
			actionId: button.dataset.actionId,
			aria: button.getAttribute('aria-label'),
			icon: button.querySelector('b')?.textContent || '',
			letters: button.querySelector('.Awtsmoos-action-letters')?.textContent || ''
		}));
		const actors = runtime.enemies.actors;
		let minimumSpacing = Infinity;
		for (let first = 0; first < actors.length; first += 1) {
			for (let second = first + 1; second < actors.length; second += 1) {
				minimumSpacing = Math.min(minimumSpacing, Math.hypot(
					actors[first].group.position.x - actors[second].group.position.x,
					actors[first].group.position.z - actors[second].group.position.z
				));
			}
		}
		const actor = actors[0];
		runtime.enemies.selectActor(actor);
		const material = actor.group.userData?.rig?.mesh?.material;
		const marker = actor.selectionMarker;
		runtime.state.x = actor.group.position.x + 3.2;
		runtime.state.z = actor.group.position.z;
		runtime.state.y = runtime.terrain.heightAt(runtime.state.x, runtime.state.z);
		runtime.state.renderY = runtime.state.y;
		runtime.model.position.set(runtime.state.x, runtime.state.y, runtime.state.z);
		document.querySelector('[data-action-id="letter-light"]')?.click();
		await new Promise((resolve) => setTimeout(resolve, 180));
		const aim = runtime.equipment.diagnostics().weaponAim;
		const adventures = runtime.adventures?.snapshot?.() || {};
		const adventure = adventures.pinned?.[0] || adventures.active?.[0] || null;
		const dedicated = runtime.quest?.snapshot?.() || null;
		const mission = adventure || (dedicated ? { definition: dedicated.definition } : null);
		runtime.bus.emit('questlog:toggle', { source: 'probe' });
		await new Promise((resolve) => setTimeout(resolve, 40));
		const missionPanel = document.querySelector('.Awtsmoos-current-shlichus');
		return {
			buttons,
			combat: {
				minimumSpacing,
				policy: policyModule.MINIMAL_MEADOW_COMBAT_BALANCE
			},
			highlight: {
				emissiveStrength: Number(material?.emissiveStrength || 0),
				markerCount: marker?.children?.length || 0,
				markerVisible: marker?.visible === true,
				selectedId: runtime.enemies.selected?.profile?.id || null
			},
			mission: {
				displayed: missionPanel?.textContent || '',
				id: mission?.definition?.id || null,
				progress: dedicated?.progress ?? null,
				status: dedicated?.status || adventure?.status || null,
				title: mission?.definition?.title || mission?.definition?.name || null
			},
			terrain: {
				frequency: terrain.material.texturePolicy.densityPlan.frequency,
				layerCount: terrain.material.textureLayers.length,
				policy: terrain.material.texturePolicy,
				repeat: terrain.material.texturePolicy.repeatAcrossWorld,
				source: terrain.material.texturePolicy.densityPlan.source
			},
			weapon: {
				aim,
				anchor: anchor?.name || null,
				handBound: weapon?.userData?.handBound === true,
				parentIsRightHand: anchor?.parent === runtime.equipment.nodes.rightHand,
				visible: weapon?.visible === true
			}
		};
	})()`);
}
