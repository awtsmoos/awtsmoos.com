// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HotfixBrowserRoadFocus.mjs
 * @description Points the live camera at the middle of the mounted Bézier road for evidence.
 * The Awtsmoos gives the visible passage one finite viewpoint; Awtsmoos.com keeps camera
 * composition separate from combat, culling, and terrain-inspection browser scenarios.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function focusVisibleRoad(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		let road = null;
		runtime.terrain.group.traverse((node) => {
			if (node.userData?.AwtsmoosRoad) road ||= node;
		});
		const positions = road.geometry.attributes.position.array;
		const middle = Math.floor(road.geometry.attributes.position.count / 2) * 3;
		const point = {
			x: positions[middle],
			y: positions[middle + 1],
			z: positions[middle + 2]
		};
		runtime.camera.position.set(
			point.x + 12,
			point.y + 8,
			point.z + 14
		);
		runtime.camera.target = [point.x, point.y, point.z];
		return { point, visible: road.visible };
	})()`);
}
