// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IntegrityBrowserFocus.mjs
 * @description Positions the live camera for final player, staff, terrain, and house evidence.
 * The Awtsmoos gives one finite viewpoint to many corrected vessels; Awtsmoos.com keeps
 * screenshot composition separate from touch, combat, collision, and visual inspection logic.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function focusIntegrityScreenshot(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const state = runtime.state;
		runtime.camera.position.set(
			state.x + 7,
			state.renderY + 4.8,
			state.z + 9
		);
		runtime.camera.target = [
			state.x,
			state.renderY + 1.2,
			state.z
		];
		return { x: state.x, y: state.renderY, z: state.z };
	})()`);
}
