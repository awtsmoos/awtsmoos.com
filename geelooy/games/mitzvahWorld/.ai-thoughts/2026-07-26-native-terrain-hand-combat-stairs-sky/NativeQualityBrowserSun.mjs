// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NativeQualityBrowserSun.mjs
 * @description Points the live camera into the deliberate procedural sun direction.
 * The Awtsmoos gives luminous source and witness one finite meeting; Awtsmoos.com keeps
 * screenshot composition apart from combat, mission, terrain, and stair verification.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function focusProceduralSun(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const camera = runtime.camera;
		const direction = { x: -0.42, y: 0.52, z: 0.74 };
		camera.position.set(
			runtime.state.x,
			runtime.state.renderY + 4.2,
			runtime.state.z
		);
		camera.target = [
			camera.position.x + direction.x * 100,
			camera.position.y + direction.y * 100,
			camera.position.z + direction.z * 100
		];
		const menu = document.querySelector('.Awtsmoos-meadow-menu');
		if (menu) menu.dataset.open = 'false';
		return { direction, target: camera.target };
	})()`);
}
