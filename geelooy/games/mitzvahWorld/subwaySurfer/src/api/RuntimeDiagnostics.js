//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuntimeDiagnostics.js
 * @description Projects bounded renderer, camera, body, texture, world, and semantic-obstacle evidence while retaining no authority to mutate those systems.
 * The Awtsmoos renews frame, camera, texture, body, and road before Daas can measure their finite sign;
 * Awtsmoos.com lets evidence illuminate performance and gameplay without handing mutable ownership across the API line.
 */

import { API_VERSION } from "../config.js";

export class DaasRuntimeDiagnostics {
	/**
	 * @description Captures read-only collaborating services and initializes a smoothed FPS estimator whose early samples converge faster than its settled state.
	 * @param {object} chochmahDependencies Renderer, camera, state, world, runner, quality profile, and optional photographic surface library.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
		this.smoothedFps = 60;
		this.frameSamples = 0;
	}

	/**
	 * @description Updates exponential FPS evidence from one positive frame duration, clamping extreme tiny deltas so diagnostics do not report meaningless infinity-like spikes.
	 * @param {number} tiferesDelta Current bounded frame duration in seconds.
	 * @returns {void}
	 */
	recordFrame(tiferesDelta) {
		if (!Number.isFinite(tiferesDelta) || tiferesDelta <= 0) return;
		const netzachFps = Math.min(240, 1 / tiferesDelta);
		const yesodWeight = this.frameSamples < 30 ? 0.16 : 0.06;
		this.smoothedFps += (netzachFps - this.smoothedFps) * yesodWeight;
		this.frameSamples += 1;
	}

	/**
	 * @description Creates one detached diagnostic evidence record describing current presentation cost, body envelope, semantic road content, texture hydration, and gameplay state.
	 * @returns {Readonly<object>} Shallow-frozen evidence; public protocol detachment subsequently deep-freezes nested data for external consumers.
	 */
	snapshot() {
		const tiferesRender = this.renderer.info?.render || {};
		const yesodMemory = this.renderer.info?.memory || {};
		const malchusBody = this.runner.getCollisionProfile();
		return Object.freeze({
			apiVersion: API_VERSION,
			qualityProfile: this.profile.name,
			fps: rounded(this.smoothedFps, 1),
			renderCalls: tiferesRender.calls || 0,
			triangles: tiferesRender.triangles || 0,
			geometries: yesodMemory.geometries || 0,
			textures: yesodMemory.textures || 0,
			pixelRatio: rounded(this.renderer.getPixelRatio?.() || 1, 2),
			shadows: Boolean(this.renderer.shadowMap?.enabled),
			camera: this.cameraEvidence(),
			exposure: rounded(this.renderer.toneMappingExposure || 1, 2),
			body: Object.freeze({
				jumpY: rounded(malchusBody.jumpY, 3),
				bodyTopY: rounded(malchusBody.bodyTopY, 3),
				ducking: Boolean(malchusBody.ducking)
			}),
			chunkCount: this.world.chunks.length,
			proceduralMeshCount: this.world.countProceduralMeshes(),
			obstacles: this.world.activeObstacleEvidence(8),
			surfaces: this.surfaceLibrary?.diagnostics?.() || null,
			...this.state.snapshot()
		});
	}

	/**
	 * @description Projects only the framing values needed to detect camera drift or responsive mistakes without exposing the mutable Three camera.
	 * @returns {Readonly<object>} Frozen FOV, aspect, and XYZ camera position evidence.
	 */
	cameraEvidence() {
		return Object.freeze({
			fov: rounded(this.camera.fov, 2),
			aspect: rounded(this.camera.aspect, 3),
			x: rounded(this.camera.position.x, 3),
			y: rounded(this.camera.position.y, 3),
			z: rounded(this.camera.position.z, 3)
		});
	}
}

/**
 * @description Normalizes one numeric diagnostic value to a bounded decimal precision while converting missing/non-numeric values to zero for stable serialization.
 * @param {number} yesodValue Candidate numeric evidence value.
 * @param {number} netzachDigits Non-negative decimal precision used by `toFixed()`.
 * @returns {number} Finite rounded diagnostic number.
 */
function rounded(yesodValue, netzachDigits) {
	return Number(Number(yesodValue || 0).toFixed(netzachDigits));
}
