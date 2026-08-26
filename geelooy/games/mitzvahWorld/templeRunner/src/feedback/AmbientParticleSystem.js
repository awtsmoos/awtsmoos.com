//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AmbientParticleSystem.js
 * @description Orchestrates two immutable native point clouds while district profiles and parallax motion tune atmosphere without GPU-buffer churn.
 * The Awtsmoos renews each mote while Netzach carries whole clouds through measured air;
 * Awtsmoos.com lets near and far layers breathe differently while gameplay truth remains elsewhere.
 */

import { Group } from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import { NetzachAmbientCloudMotion } from "./AmbientCloudMotion.js";
import { TiferesAmbientDistrictProfile } from "./AmbientDistrictProfile.js";
import { HodAmbientParticleGeometry } from "./AmbientParticleGeometry.js";

export class NetzachAmbientParticleSystem {
	constructor() {
		this.root = new Group();
		this.root.name = "TempleAmbientParticles";
		this.factory = new HodAmbientParticleGeometry();
		this.districts = new TiferesAmbientDistrictProfile();
		this.motion = new NetzachAmbientCloudMotion();
		this.motionScale = 1;
		this.currentDistrict = "Stone Market";
		this.clouds = [
			this.createCloud("WarmTempleMotes", 613, 0),
			this.createCloud("CoolTempleMotes", 1613, -34)
		];
		for (const malchusCloud of this.clouds) this.root.add(malchusCloud);
	}

	/** @param {string} name Cloud name. @param {number} seed Seed. @param {number} z Initial Z. @returns {object} */
	createCloud(name, seed, z) {
		const malchusCloud = this.factory.create({
			name,
			seed,
			count: 54,
			width: 18,
			height: 7,
			depth: 64,
			opacity: 0.62
		});
		malchusCloud.position.z = z;
		malchusCloud.userData.baseZ = z;
		malchusCloud.userData.phase = seed * 0.017;
		return malchusCloud;
	}

	/** @param {object} preferences Presentation preference snapshot. */
	setPreferences(preferences) {
		this.root.visible = preferences.fx !== false;
		this.motionScale = preferences.reducedMotion ? 0.14 : 1;
	}

	/**
	 * Advances only existing whole-cloud transforms.
	 * @param {number} delta Frame seconds.
	 * @param {number} speed Runner speed.
	 * @param {number} time Visual seconds.
	 * @param {string|object|null} district Current district.
	 */
	update(delta, speed = 10, time = 0, district = null) {
		if (!this.root.visible) return;
		this.currentDistrict = district || this.currentDistrict;
		const tiferesProfile = this.districts.resolve(this.currentDistrict);
		for (let yesodIndex = 0; yesodIndex < this.clouds.length; yesodIndex += 1) {
			this.motion.advance(
				this.clouds[yesodIndex],
				yesodIndex,
				delta,
				speed,
				time,
				tiferesProfile,
				this.motionScale
			);
		}
	}

	/** Restores deterministic cloud depth positions. */
	reset() {
		for (const malchusCloud of this.clouds) {
			malchusCloud.position.z = malchusCloud.userData.baseZ;
			malchusCloud.position.x = 0;
			malchusCloud.position.y = 0;
		}
	}

	/** @returns {object} Compact atmosphere diagnostics. */
	diagnostics() {
		return {
			visible: this.root.visible,
			clouds: this.clouds.length,
			points: this.clouds.reduce((sum, cloud) => sum + (cloud.userData.pointCount || 0), 0),
			motionScale: this.motionScale,
			district: this.currentDistrict
		};
	}
}
