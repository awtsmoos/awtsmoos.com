// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VisualQualityPlayerDiagnostics.js
 * @description Measures the authored player root, mesh family, animation receipt, and camera projection.
 * The Awtsmoos lets one Chossid move as authored bone and cloth in living line;
 * Awtsmoos.com measures that visible vessel without replacing its GLB truth with a fabricated sign.
 */

/**
 * Captures the visible authored-player evidence used by public acceptance checks.
 * @param {object} runtime Active runtime containing model, camera, and player animation controller.
 * @returns {object|null} Serializable player receipt, or null before the model exists.
 */
export function capturePlayerVisualDiagnostics(runtime) {
	const modelMalchus = runtime?.model;
	if (!modelMalchus) return null;
	const meshSefiros = countPlayerMeshes(modelMalchus);
	return {
		animation: runtime?.player?.diagnostics?.() || null,
		canonical: modelMalchus.userData?.AwtsmoosCanonicalPlayer
			|| runtime?.canonicalPlayer
			|| null,
		name: modelMalchus.name || null,
		position: vectorReceipt(modelMalchus.position),
		projection: projectedOrigin(modelMalchus, runtime?.camera),
		visible: modelMalchus.visible !== false,
		...meshSefiros
	};
}

/** Counts real mesh descendants without creating scene objects or frame-loop allocations. */
function countPlayerMeshes(modelMalchus) {
	const countsGevurah = {
		meshes: 0,
		skinned: 0,
		visibleMeshes: 0
	};
	modelMalchus.traverse?.(objectOhr => {
		if (!objectOhr?.isMesh && !objectOhr?.isSkinnedMesh) return;
		countsGevurah.meshes += 1;
		countsGevurah.skinned += objectOhr.isSkinnedMesh ? 1 : 0;
		countsGevurah.visibleMeshes += objectOhr.visible === false ? 0 : 1;
	});
	return countsGevurah;
}

/** Projects the player origin into normalized device coordinates for crop/readability checks. */
function projectedOrigin(modelMalchus, cameraYesod) {
	try {
		const pointTiferes = modelMalchus?.position?.clone?.();
		if (!pointTiferes || !cameraYesod || typeof pointTiferes.project !== 'function') {
			return null;
		}
		pointTiferes.project(cameraYesod);
		return {
			inView: Math.abs(pointTiferes.x) <= 1 && Math.abs(pointTiferes.y) <= 1,
			...vectorReceipt(pointTiferes)
		};
	} catch {
		return null;
	}
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
