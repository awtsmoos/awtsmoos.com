//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AtmosphereController.js
 * @description Evolves sky, fog depth, exposure, and light direction from bounded time-of-day and speed cues without changing world geometry.
 * The Awtsmoos renews sky and mist before the eye can name their hue;
 * Awtsmoos.com lets atmosphere breathe with speed and daylight while gameplay stays exact and true.
 */

import { ATMOSPHERE_CONFIG, CHAI_CONFIG, WORLD_COLORS } from "../config.js";

export class OhrAtmosphereController {
	/** @param {object} THREE Three.js namespace. @param {object} dependencies Scene, renderer, lighting, profile. */
	constructor(THREE, dependencies) {
		this.scene = dependencies.scene;
		this.renderer = dependencies.renderer;
		this.lighting = dependencies.lighting;
		this.profile = dependencies.profile;
		this.skyDay = new THREE.Color(WORLD_COLORS.skyDay);
		this.skyDusk = new THREE.Color(WORLD_COLORS.skyDusk);
		this.fogDay = new THREE.Color(WORLD_COLORS.fogDay);
		this.fogDusk = new THREE.Color(WORLD_COLORS.fogDusk);
	}

	/** @param {number} time Visual seconds. @param {number} speed Current forward speed. */
	update(time, speed) {
		const cycle = Math.max(1, ATMOSPHERE_CONFIG.cycleSeconds);
		const phase = (time % cycle) / cycle;
		const dusk = 0.12 + (0.5 + 0.5 * Math.sin(phase * Math.PI * 2)) * 0.18;
		const speedRatio = this.speedRatio(speed);
		this.scene.background.copy(this.skyDay).lerp(this.skyDusk, dusk);
		this.updateFog(dusk, speedRatio);
		const daylight = Math.max(ATMOSPHERE_CONFIG.minimumDaylight, 1 - dusk * 0.16);
		this.renderer.toneMappingExposure = this.profile.exposure
			* daylight
			* (1 + speedRatio * ATMOSPHERE_CONFIG.speedExposureGain);
		this.lighting.update(dusk, phase);
	}

	/** @param {number} dusk Dusk factor. @param {number} speedRatio Speed factor. */
	updateFog(dusk, speedRatio) {
		if (!this.scene.fog) return;
		this.scene.fog.color.copy(this.fogDay).lerp(this.fogDusk, dusk * 0.9);
		if (Number.isFinite(this.scene.fog.near)) {
			this.scene.fog.near = ATMOSPHERE_CONFIG.fogNear + dusk * 2.2;
		}
		if (Number.isFinite(this.scene.fog.far)) {
			this.scene.fog.far = ATMOSPHERE_CONFIG.fogFar
				+ speedRatio * ATMOSPHERE_CONFIG.speedFogFarGain
				- dusk * ATMOSPHERE_CONFIG.duskFogCompression;
		}
	}

	/** @param {number} speed Current speed. @returns {number} Zero-to-one speed ratio. */
	speedRatio(speed) {
		const span = CHAI_CONFIG.maxSpeed - CHAI_CONFIG.startSpeed;
		return Math.max(0, Math.min(1, (speed - CHAI_CONFIG.startSpeed) / span));
	}
}
