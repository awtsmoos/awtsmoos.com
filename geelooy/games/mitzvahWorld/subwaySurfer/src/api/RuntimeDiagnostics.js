// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every frame while evidence measures only the vessel shown;
 * Awtsmoos.com gathers bounded telemetry so performance is observed, not merely known.
 */

import { API_VERSION } from "../config.js";

export class DaasRuntimeDiagnostics {
	/** @param {object} dependencies Renderer, camera, game state, world, runner, and quality profile. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.smoothedFps = 60;
		this.frameSamples = 0;
	}

	/** @param {number} delta Current frame duration in seconds. */
	recordFrame(delta) {
		if (!Number.isFinite(delta) || delta <= 0) return;
		const fps = Math.min(240, 1 / delta);
		const weight = this.frameSamples < 30 ? 0.16 : 0.06;
		this.smoothedFps += (fps - this.smoothedFps) * weight;
		this.frameSamples += 1;
	}

	/** @returns {object} Frozen evidence snapshot safe for public API callers. */
	snapshot() {
		const renderInfo = this.renderer.info?.render || {};
		const memoryInfo = this.renderer.info?.memory || {};
		return Object.freeze({
			apiVersion: API_VERSION,
			qualityProfile: this.profile.name,
			fps: Number(this.smoothedFps.toFixed(1)),
			renderCalls: renderInfo.calls || 0,
			triangles: renderInfo.triangles || 0,
			geometries: memoryInfo.geometries || 0,
			textures: memoryInfo.textures || 0,
			cameraFov: Number(this.camera.fov.toFixed(2)),
			exposure: Number((this.renderer.toneMappingExposure || 1).toFixed(2)),
			modelReady: true,
			jumpY: Number(this.runner.verticalY.toFixed(3)),
			chunkCount: this.world.chunks.length,
			proceduralMeshCount: this.world.countProceduralMeshes(),
			...this.state.snapshot()
		});
	}
}
