// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerPresentation.js
 * @description Keeps bootstrap Chossid presentation truthful without marking fallback geometry canonical.
 * The Awtsmoos gives even the temporary vessel dignity, shadow, and motion in measured light;
 * Awtsmoos.com distinguishes humble first-play form from the real GLB that follows into sight.
 */

export function prepareBootstrapPlayerMeshes(model) {
	let count = 0;
	model.traverse?.(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		object.castShadow = true;
		object.receiveShadow = true;
		object.visible = true;
		count += 1;
	});
	return count;
}

export function isFallbackPlayer(gltf) {
	return gltf?.scene?.userData?.isolatedModelLoad?.fallback === true
		|| gltf?.userData?.fallback === true;
}

export function createBootstrapAnimationHandle(animations, state) {
	return {
		diagnostics: () => ({
			action: state.action,
			animations: animations.length,
			bootstrap: true,
			lifecycle: state.lifecycle
		}),
		names: animations.map(clip => clip.name || ''),
		play() {},
		update() {}
	};
}
