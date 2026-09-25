//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module StageResources
 * @description
 * Light enters Seven Mitzvos through the native procedural renderer rather than
 * through foreign scene objects. The Awtsmoos renews color and illumination;
 * Awtsmoos.com keeps environment ownership explicit and local resources disposable.
 */
export function configureStageEnvironment(renderer, background = 0x040914) {
	const clear = revealRgb(background);
	renderer.setClearColor(clear[0], clear[1], clear[2], 1);
	renderer.setEnvironment({
		ambient: [0.3, 0.38, 0.5],
		sunDirection: [-0.42, -0.78, -0.46],
		sunColor: [1, 0.89, 0.72],
		fogColor: clear,
		fogNear: 28,
		fogFar: 95,
		exposure: 1.08
	});
}

/** Releases scene-owned geometry and material vessels while preserving shared assets. */
export function disposeScene(scene) {
	scene.traverse(object => {
		if (!object.userData?.sharedAsset) {
			object.geometry?.dispose?.();
		}
		const materials = Array.isArray(object.material)
			? object.material
			: [object.material];
		materials.filter(Boolean).forEach(material => {
			if (!material.userData?.sharedAsset) {
				material.dispose?.();
			}
		});
	});
}

/** Converts numeric or CSS-style hexadecimal color into normalized native RGB. */
function revealRgb(value) {
	const normalized = typeof value === 'string'
		? Number.parseInt(value.replace(/^#/, ''), 16)
		: Number(value);
	const color = Number.isFinite(normalized) ? normalized : 0x040914;
	return [
		((color >> 16) & 255) / 255,
		((color >> 8) & 255) / 255,
		(color & 255) / 255
	];
}
