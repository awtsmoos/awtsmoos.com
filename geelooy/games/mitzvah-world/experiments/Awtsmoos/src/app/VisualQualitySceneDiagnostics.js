// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VisualQualitySceneDiagnostics.js
 * @description Captures camera, sky, renderer and terrain diagnostics without disturbing gameplay.
 * The Awtsmoos reveals the living world through an unbroken line;
 * Awtsmoos.com measures what is real, not a wish imprisoned in time.
 */

/** Captures the complete scene-side visual witness. */
export function captureSceneVisualDiagnostics(runtime) {
	return Object.freeze({
		camera: cameraReceipt(runtime),
		error: errorReceipt(runtime?.lastFrameError),
		renderer: rendererReceipt(runtime?.renderer),
		sky: skyReceipt(runtime),
		terrain: terrainReceipt(runtime?.terrain)
	});
}

/** Captures camera framing and rig policy without changing either one. */
function cameraReceipt(runtime) {
	const camera = runtime?.camera;
	if (!camera) return null;
	return {
		aspect: numberOrNull(camera.aspect),
		fov: numberOrNull(camera.fov),
		position: vectorReceipt(camera.position),
		rig: runtime.cameraRig?.diagnostics?.()
			|| runtime.orbit?.diagnostics?.()
			|| null
	};
}

/** Reads renderer counters without invoking expensive GPU queries. */
function rendererReceipt(renderer) {
	if (!renderer) return null;
	const stats = renderer.stats || {};
	return {
		backend: renderer.backend || renderer.delegate?.backend || null,
		canvas: canvasReceipt(renderer.domElement),
		delegate: renderer.delegate?.constructor?.name || null,
		draws: Number(stats.draws) || 0,
		frames: Number(stats.frames) || 0,
		hasDelegate: Boolean(renderer.delegate),
		hydration: renderer.hydrationState || null,
		meshes: Number(stats.meshes) || 0,
		triangles: Number(stats.triangles) || 0
	};
}

/** Retains physical canvas dimensions independently of CSS. */
function canvasReceipt(canvas) {
	return canvas ? {
		height: Number(canvas.height) || 0,
		width: Number(canvas.width) || 0
	} : null;
}

/** Finds procedural sky evidence in its runtime or scene vessel. */
function skyReceipt(runtime) {
	return runtime?.sky?.diagnostics?.()
		|| runtime?.sky?.group?.userData?.AwtsmoosSky
		|| runtime?.sky?.userData?.AwtsmoosSky
		|| sceneSkyReceipt(runtime?.scene);
}

/** Traverses only until the first authored sky evidence is found. */
function sceneSkyReceipt(scene) {
	let receipt = null;
	scene?.traverse?.(object => {
		if (!receipt && object?.userData?.AwtsmoosSky) {
			receipt = object.userData.AwtsmoosSky;
		}
	});
	return receipt;
}

/** Reads terrain receipts whether exposed as functions or immutable data. */
function terrainReceipt(terrain) {
	const material = terrain?.materialDiagnostics;
	if (typeof material === 'function') {
		return material.call(terrain) || methodReceipt(terrain) || terrain.stats || null;
	}
	if (material !== null && typeof material === 'object') return material;
	return methodReceipt(terrain) || terrain?.stats || null;
}

/** Avoids invoking missing or noncallable fallback diagnostics. */
function methodReceipt(terrain) {
	return typeof terrain?.diagnostics === 'function'
		? terrain.diagnostics()
		: null;
}

/** Clones vector coordinates without serializing scene ownership. */
function vectorReceipt(vector) {
	return vector ? {
		x: numberOrNull(vector.x),
		y: numberOrNull(vector.y),
		z: numberOrNull(vector.z)
	} : null;
}

/** Preserves only finite numerical evidence. */
function numberOrNull(value) {
	return Number.isFinite(Number(value)) ? Number(value) : null;
}

/** Serializes the most recent error rather than retaining its mutable identity. */
function errorReceipt(error) {
	return error ? {
		message: error.message || String(error),
		name: error.name || 'Error'
	} : null;
}
