//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos is whole before observer or embodied player takes a role inside the scene;
 * Awtsmoos.com guards optional play capabilities so missing finite controllers never break the native rendering dream.
 */

/** Enter or leave play mode only when the renderer has real injected embodiment capabilities. */
export function setPlayMode(renderer, enabled) {
	if (!hasPlayCapabilities(renderer)) {
		renderer.isPlaying = false;
		console.warn('B"H - Play Mode unavailable: no input/player capability was provided.');
		return false;
	}
	renderer.isPlaying = enabled;
	if (enabled) {
		return engagePlayMode(renderer);
	}
	disengagePlayMode(renderer);
	return true;
}

function hasPlayCapabilities(renderer) {
	return Boolean(renderer.inputManager && renderer.playerController);
}

function engagePlayMode(renderer) {
	renderer.inputManager.enable?.();
	const player = renderer.objectMap.get("golem_manifest");
	if (!player) {
		console.warn('B"H - Play Mode: no golem_manifest exists in this scene.');
		return false;
	}
	renderer.playerController.setPlayerObject?.(player);
	renderer.isCameraAnimationEnabled = false;
	const position = player.keyframes?.[0]?.position;
	if (position) {
		renderer.camera.state.radius = 15;
		renderer.camera.state.beta = 0.2;
		renderer.camera.state.target = [...position];
		renderer.camera.state.isDirty = true;
	}
	return true;
}

function disengagePlayMode(renderer) {
	renderer.inputManager.disable?.();
	renderer.playerController.setAnimation?.("idle");
	renderer.isCameraAnimationEnabled = true;
}
