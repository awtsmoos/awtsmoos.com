// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IntegrityBrowserInteractionScenarios.mjs
 * @description Exercises real pointer selection, combat activation, and stair collision in Chrome.
 * The Awtsmoos joins touch, target, action, and ascent through the same finite paths used by a child;
 * Awtsmoos.com refuses internal shortcuts when the reported failure lives in pointer and collision flow.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function selectAndCastLiveEnemy(client) {
	return evaluateMobile(client, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const actor = runtime.enemies.actors[0];
		const originals = runtime.enemies.actors.map((enemy) => enemy.hitPointer);
		runtime.enemies.actors.forEach((enemy, index) => {
			enemy.hitPointer = () => index === 0;
		});
		const canvas = runtime.hosts.canvas;
		const bounds = canvas.getBoundingClientRect();
		const eventOptions = {
			bubbles: true,
			button: 0,
			buttons: 1,
			clientX: bounds.left + bounds.width / 2,
			clientY: bounds.top + bounds.height / 2,
			isPrimary: true,
			pointerId: 77,
			pointerType: 'touch'
		};
		canvas.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
		canvas.dispatchEvent(new PointerEvent('pointerup', { ...eventOptions, buttons: 0 }));
		await new Promise((resolve) => setTimeout(resolve, 80));
		runtime.enemies.actors.forEach((enemy, index) => {
			enemy.hitPointer = originals[index];
		});
		const selected = runtime.enemies.selected;
		runtime.state.x = actor.group.position.x + 3.5;
		runtime.state.z = actor.group.position.z;
		runtime.state.y = runtime.terrain.heightAt(runtime.state.x, runtime.state.z);
		runtime.state.renderY = runtime.state.y;
		runtime.model.position.set(runtime.state.x, runtime.state.y, runtime.state.z);
		const button = document.querySelector('[data-action-id="letter-light"]')
			|| document.querySelector('[data-action-id]');
		button?.click();
		await new Promise((resolve) => setTimeout(resolve, 120));
		return {
			buttonAction: button?.dataset?.actionId || null,
			buttonClicked: Boolean(button),
			cast: runtime.combat?.diagnostics?.() || null,
			methods: {
				clear: typeof selected?.clear,
				payload: typeof selected?.payload,
				target: typeof selected?.target
			},
			selectedId: selected?.profile?.id || null,
			selectedIsActor: selected === actor,
			runtimeError: document.documentElement.dataset.awtsmoosRuntimeError || ''
		};
	})()`);
}

export async function inspectLiveStairCollision(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		let ramp = null;
		runtime.houses.group.traverse((node) => {
			const definition = node.userData?.AwtsmoosWorldModel?.definition;
			const role = definition?.userData?.role || node.userData?.role;
			if (role === 'continuous-walkable-stair-ramp') ramp ||= node;
		});
		if (!ramp) return { found: false };
		const definition = ramp.userData.AwtsmoosWorldModel?.definition;
		const center = definition.position;
		const hit = runtime.mainOctree.raycast({
			direction: { x: 0, y: -1, z: 0 },
			origin: {
				x: center.x,
				y: center.y + definition.size.y + 4,
				z: center.z
			}
		}, definition.size.y + 12, (item) => item.solid !== false);
		const items = runtime.mainOctree.all();
		return {
			definition: {
				size: definition.size,
				solid: definition.solid,
				visible: definition.visible,
				walkable: definition.walkable
			},
			found: true,
			hit: hit ? { distance: hit.distance, normal: hit.normal, point: hit.point } : null,
			meshVisible: ramp.visible,
			octreeItems: items.length
		};
	})()`);
}
