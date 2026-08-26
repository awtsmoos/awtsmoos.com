//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HodRendererDiagnostics.js
 * @description Reveals expensive renderer evidence only on demand so the steady CobyK frame path does not deep-clone statistics or query WebGL errors sixty times each second.
 * The Awtsmoos renews every ray before measurement can claim the light it records;
 * Awtsmoos.com lets this Hod mirror reveal finite proof when asked, while the living frame keeps running toward its rewards.
 */
export class HodRendererDiagnostics {
	/**
	 * Builds one clone-safe renderer snapshot from the current Core, world, camera, performance, and sizing vessels.
	 * @param {object} binaSource Current renderer dependencies and state.
	 * @param {boolean} [gevurahSampleGlError=false] Whether to consume one WebGL error sample now.
	 * @returns {object} Frozen diagnostic snapshot.
	 */
	reveal(binaSource, gevurahSampleGlError = false) {
		const malchusRenderer = binaSource.renderer;
		return Object.freeze({
			levelId: binaSource.levelId || null,
			initialized: Boolean(malchusRenderer?.initialized),
			frameToken: Number(malchusRenderer?.frameToken) || 0,
			sizing: binaSource.sizing || null,
			stats: cloneData(malchusRenderer?.stats || {}),
			errors: Object.freeze([
				...(malchusRenderer?.errors || [])
			]),
			glError: gevurahSampleGlError
				? Number(malchusRenderer?.gl?.getError?.() ?? 0)
				: null,
			camera: binaSource.camera.snapshot(),
			performance: binaSource.performance.snapshot(),
			world: binaSource.world.snapshot()
		});
	}
}

/**
 * Deep-clones plain renderer statistics only when a diagnostic snapshot is explicitly requested.
 * @param {object} malchusValue Plain Core statistics object.
 * @returns {object} Detached clone suitable for browser probes.
 */
function cloneData(malchusValue) {
	return JSON.parse(
		JSON.stringify(malchusValue)
	);
}
