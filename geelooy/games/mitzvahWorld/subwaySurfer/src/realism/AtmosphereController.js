// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews sky and mist before the eye can name their hue;
 * Awtsmoos.com lets atmosphere breathe slowly while gameplay stays exact and true.
 */

import { ATMOSPHERE_CONFIG, CHAI_CONFIG, WORLD_COLORS } from "../config.js";

export class OhrAtmosphereController {
	/** @param {object} THREE Three.js namespace. @param {object} dependencies Scene, renderer, lighting, profile. */
	constructor(THREE, dependencies) {
		this.THREE = THREE;
		this.scene = dependencies.scene;
		this.renderer = dependencies.renderer;
		this.lighting = dependencies.lighting;
		this.profile = dependencies.profile;
		this.skyDay = new THREE.Color(WORLD_COLORS.skyDay);
		this.skyDusk = new THREE.Color(WORLD_COLORS.skyDusk);
		this.fogDay = new THREE.Color(WORLD_COLORS.fogDay);
		this.fogDusk = new THREE.Color(WORLD_COLORS.fogDusk);
	}

	/**
	 * Evolves a restrained late-afternoon atmosphere from simulation time and speed.
	 * @param {number} time Running visual time in seconds.
	 * @param {number} speed Current forward speed.
	 */
	update(time, speed) {
		const cycle = Math.max(1, ATMOSPHERE_CONFIG.cycleSeconds);
		const phase = (time % cycle) / cycle;
		const dusk = 0.12 + (0.5 + 0.5 * Math.sin(phase * Math.PI * 2)) * 0.18;
		this.scene.background.copy(this.skyDay).lerp(this.skyDusk, dusk);
		if (this.scene.fog) {
			this.scene.fog.color.copy(this.fogDay).lerp(this.fogDusk, dusk * 0.9);
		}
		const speedRatio = Math.max(0, Math.min(1, (speed - CHAI_CONFIG.startSpeed) / (CHAI_CONFIG.maxSpeed - CHAI_CONFIG.startSpeed)));
		const daylight = Math.max(ATMOSPHERE_CONFIG.minimumDaylight, 1 - dusk * 0.16);
		this.renderer.toneMappingExposure = this.profile.exposure * daylight * (1 + speedRatio * 0.025);
		this.lighting.update(dusk);
	}
}
