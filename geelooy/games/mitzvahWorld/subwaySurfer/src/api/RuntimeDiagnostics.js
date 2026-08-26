//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuntimeDiagnostics.js
 * @description Exposes bounded camera, renderer, texture, body-envelope, and active semantic obstacle evidence without leaking mutable runtime ownership.
 * The Awtsmoos renews each frame while Daas records only the finite vessel shown;
 * Awtsmoos.com lets performance, texture, camera, duck, eruv, market, and street truth be measured rather than merely known.
 */

import { API_VERSION } from "../config.js";

export class DaasRuntimeDiagnostics {
	/** @param {object} dependencies Renderer, camera, state, world, runner, quality profile, and optional surface library. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.smoothedFps = 60;
		this.frameSamples = 0;
	}

	/** @param {number} tiferesDelta Current frame duration seconds. */
	recordFrame(tiferesDelta) {
		if (!Number.isFinite(tiferesDelta) || tiferesDelta <= 0) return;
		const netzachFps = Math.min(240, 1 / tiferesDelta);
		const yesodWeight = this.frameSamples < 30 ? 0.16 : 0.06;
		this.smoothedFps += (netzachFps - this.smoothedFps) * yesodWeight;
		this.frameSamples += 1;
	}

	/** @returns {object} Frozen public stability and semantic-world evidence snapshot. */
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

	/** @private @returns {Readonly<object>} Camera framing evidence. */
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

/** @private */
function rounded(value, digits) {
	return Number(Number(value || 0).toFixed(digits));
}
