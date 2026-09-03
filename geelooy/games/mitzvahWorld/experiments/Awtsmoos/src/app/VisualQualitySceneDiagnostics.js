// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VisualQualitySceneDiagnostics.js
 * @description Measures camera, WebGL renderer, procedural sky, terrain, and last-frame health on demand.
 * The Awtsmoos reveals sky above and earth below while the camera binds them in one line;
 * Awtsmoos.com keeps these receipts observational, so the world is measured without disturbing time.
 */

/**
 * Captures scene-side visual evidence without mutating renderer, camera, sky, or terrain state.
 * @param {object} runtime Active Mitzvah World runtime.
 * @returns {Readonly<object>} Scene visual-quality receipt.
 */
export function captureSceneVisualDiagnostics(runtime) {
	return Object.freeze({
		camera: cameraReceipt(runtime),
		error: errorReceipt(runtime?.lastFrameError),
		renderer: rendererReceipt(runtime?.renderer),
		sky: skyReceipt(runtime),
		terrain: terrainReceipt(runtime?.terrain)
	});
}

/** Captures the current camera framing and orbit/rig policy receipt. */
function cameraReceipt(runtime) {
	const cameraYesod = runtime?.camera;
	if (!cameraYesod) return null;
	return {
		aspect: numberOrNull(cameraYesod.aspect),
		fov: numberOrNull(cameraYesod.fov),
		position: vectorReceipt(cameraYesod.position),
		rig: runtime.cameraRig?.diagnostics?.()
			|| runtime.orbit?.diagnostics?.()
			|| null
	};
}

/** Captures stable renderer capability and accumulated draw evidence. */
function rendererReceipt(rendererMalchus) {
	if (!rendererMalchus) return null;
	const statsHod = rendererMalchus.stats || {};
	return {
		backend: rendererMalchus.backend
			|| rendererMalchus.delegate?.backend
			|| null,
		canvas: canvasReceipt(rendererMalchus.domElement),
		delegate: rendererMalchus.delegate?.constructor?.name || null,
		draws: Number(statsHod.draws) || 0,
		frames: Number(statsHod.frames) || 0,
		hasDelegate: Boolean(rendererMalchus.delegate),
		hydration: rendererMalchus.hydrationState || null,
		meshes: Number(statsHod.meshes) || 0,
		triangles: Number(statsHod.triangles) || 0
	};
}

/** Captures physical canvas dimensions without depending on CSS layout. */
function canvasReceipt(canvasKli) {
	return canvasKli ? {
		height: Number(canvasKli.height) || 0,
		width: Number(canvasKli.width) || 0
	} : null;
}

/** Resolves the procedural-sky evidence from runtime or scene ownership. */
function skyReceipt(runtime) {
	return runtime?.sky?.diagnostics?.()
		|| runtime?.sky?.group?.userData?.AwtsmoosSky
		|| runtime?.sky?.userData?.AwtsmoosSky
		|| sceneSkyReceipt(runtime?.scene);
}

/** Finds the first scene-owned sky diagnostics object without allocating scene children. */
function sceneSkyReceipt(sceneMalchus) {
	let receiptHod = null;
	sceneMalchus?.traverse?.(objectOhr => {
		if (!receiptHod && objectOhr?.userData?.AwtsmoosSky) {
			receiptHod = objectOhr.userData.AwtsmoosSky;
		}
	});
	return receiptHod;
}

/** Captures whichever mature terrain diagnostics surface the current world exposes. */
function terrainReceipt(terrainMalchus) {
	return terrainMalchus?.materialDiagnostics?.()
		|| terrainMalchus?.diagnostics?.()
		|| terrainMalchus?.stats
		|| null;
}

/** Converts a vector-like object into finite serializable coordinates. */
function vectorReceipt(vectorOhr) {
	return vectorOhr ? {
		x: numberOrNull(vectorOhr.x),
		y: numberOrNull(vectorOhr.y),
		z: numberOrNull(vectorOhr.z)
	} : null;
}

/** Preserves a numeric value only when it is finite. */
function numberOrNull(valueOhr) {
	return Number.isFinite(Number(valueOhr))
		? Number(valueOhr)
		: null;
}

/** Captures the last frame error as durable text rather than a mutable Error object. */
function errorReceipt(errorGevurah) {
	return errorGevurah ? {
		message: errorGevurah.message || String(errorGevurah),
		name: errorGevurah.name || 'Error'
	} : null;
}
