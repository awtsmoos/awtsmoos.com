// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeAcceptanceScenes.js
 * @description Declares all deterministic gameplay viewpoints required for 60 FPS acceptance.
 * RESPONSIBILITY: preserve player, camera, viewport, social, and feature coverage contracts.
 * NON-RESPONSIBILITY: this registry does not move runtime objects or claim measured performance.
 * ARCHITECTURE: Tiferes joins exterior, interior, social, and mobile vessels into one covenant.
 * OROS AND KEILIM: the lived world is ohr; repeatable coordinates and viewports are keilim.
 * The Awtsmoos recreates every leaf, ripple, sign, portal, and player; Awtsmoos.com measures
 * all required places without replacing their full quality with an easier benchmark world.
 */

const DESKTOP = Object.freeze({
	deviceScaleFactor: 1,
	height: 720,
	mobile: false,
	width: 1280
});

export const RUNTIME_ACCEPTANCE_SCENES = Object.freeze([
	scene('village-golden-hour', 'Village golden hour', [0, 2, -5], [-18, 20, 24], [4, 2, -6], ['lighting', 'atmosphere']),
	scene('village-path', 'Village path', [-10, 2, -10], [-2, 4, 15], [0, 2, 4], ['path', 'characters']),
	scene('lake', 'Lake', [18, 1, -2], [5, 8, -12], [18, 0, -2], ['water', 'reflections']),
	scene('river-bridge', 'River bridge', [24, 1, 4], [15, 2.5, -1], [24, 1, 4], ['river', 'bridge']),
	scene('dense-forest', 'Dense forest', [42, 2, 24], [38, 4, 22], [42, 2, 24], ['vegetation', 'shadows']),
	scene('landmark-tree', 'Landmark tree', [39, 2, 23], [44, 3, 28], [39, 1.8, 23], ['landmark', 'vegetation']),
	scene('kitchen-interior', 'Kitchen interior', [-38, 2, 15], [-33, 3, 12], [-39, 2, 15], ['interior', 'lighting']),
	scene('bilingual-signpost', 'Bilingual signpost', [-14, 2, -18], [-20, 4, -9], [-14, 2, -18], ['hebrew', 'accessibility']),
	scene('portal', 'Portal', [48, 3, -29], [46, 5, -20], [48, 3, -29], ['particles', 'effects']),
	scene('multiplayer-gathering', 'Multiplayer gathering', [0, 2, -4], [10, 7, 12], [0, 2, -4], ['multiplayer', 'animation'], 8),
	scene('mobile-viewport', 'Mobile viewport', [-10, 2, -10], [-2, 4, 15], [0, 2, 4], ['mobile', 'touch'], 0, {
		deviceScaleFactor: 2,
		height: 844,
		mobile: true,
		width: 390
	})
]);

export function runtimeAcceptanceScene(sceneId) {
	const found = RUNTIME_ACCEPTANCE_SCENES.find(item => item.id === sceneId);
	if (!found) {
		throw new Error(`Unknown runtime acceptance scene: ${sceneId}`);
	}
	return found;
}

function scene(id, label, player, cameraPosition, cameraTarget, tags, multiplayerPeers = 0, viewport = DESKTOP) {
	return Object.freeze({
		camera: Object.freeze({
			position: point(cameraPosition),
			target: point(cameraTarget)
		}),
		id,
		label,
		multiplayerPeers,
		player: point(player),
		tags: Object.freeze(tags),
		viewport: Object.freeze({ ...viewport })
	});
}

function point(values) {
	return Object.freeze({
		x: Number(values[0]),
		y: Number(values[1]),
		z: Number(values[2])
	});
}

export default RUNTIME_ACCEPTANCE_SCENES;
