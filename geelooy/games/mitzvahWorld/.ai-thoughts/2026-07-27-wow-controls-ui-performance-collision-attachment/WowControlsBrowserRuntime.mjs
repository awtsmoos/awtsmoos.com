// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WowControlsBrowserRuntime.mjs
 * @description Reads live movement state and verifies floor and attachment recovery.
 * The Awtsmoos lets the browser itself testify; Awtsmoos.com gathers player, house, and weapon
 * evidence without replacing the real canvas listeners, keyboard state, or update loop.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function waitForWowRuntime(client, timeoutMs = 90000) {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		const ready = await evaluateMobile(client, `(() => {
			const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
			return Boolean(
				runtime?.houses
				&& runtime?.equipment
				&& runtime?.movement?.controller
			);
		})()`).catch(() => false);
		if (ready) return true;
		await delay(100);
	}
	throw new Error('Live runtime did not expose controls, houses, and equipment.');
}

export function runtimeSnapshot(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		return {
			facing: runtime.state.facing,
			x: runtime.state.x,
			yaw: runtime.cameraRig.orbit.yaw,
			z: runtime.state.z
		};
	})()`);
}

export function inputStrafe(client) {
	return evaluateMobile(
		client,
		'globalThis.AwtsmoosMitzvahWorld.runtime.input.axis().strafe'
	);
}

export function recoverFloorAndAttachment(client) {
	return evaluateMobile(client, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const house = runtime.houses.houses.find((item) => {
			return item.floorSupport?.levels?.length > 1;
		});
		const floor = house.floorSupport.levels[0];
		Object.assign(runtime.state, {
			grounded: true,
			renderY: floor - 2,
			x: house.profile.x,
			y: floor - 2,
			z: house.profile.z
		});
		runtime.model.position.set(
			runtime.state.x,
			runtime.state.renderY,
			runtime.state.z
		);
		runtime.movement.controller.update(1 / 60);
		const support = runtime.houses.supportReceiptAt(
			runtime.state.x,
			runtime.state.z,
			runtime.state.renderY,
			floor - 2
		);
		const weapon = runtime.equipment.weapon;
		weapon.parent?.remove?.(weapon);
		weapon.visible = false;
		runtime.equipment.update();
		const equipment = runtime.equipment.diagnostics();
		return {
			attachment: {
				anchorCount: equipment.attachmentRegistry.anchorCount,
				handBound: equipment.handBound,
				parentIsRightHand:
					weapon.parent?.parent === runtime.equipment.nodes.rightHand,
				visible: weapon.visible
			},
			floor: {
				expected: floor,
				grounded: runtime.state.grounded,
				renderY: runtime.state.renderY,
				source: support?.kind || null
			}
		};
	})()`);
}

export function resetLivePlayer(client, snapshot) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		Object.assign(runtime.state, ${JSON.stringify(snapshot)});
		runtime.model.position.set(
			runtime.state.x,
			runtime.state.renderY,
			runtime.state.z
		);
		return true;
	})()`);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
