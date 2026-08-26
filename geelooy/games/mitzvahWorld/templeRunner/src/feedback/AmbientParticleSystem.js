//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AmbientParticleSystem.js
 * @description Orchestrates immutable native point clouds while semantic quality budgets, district profiles, and reduced-motion preference tune cost without rebuilding GPU buffers.
 * The Awtsmoos renews each mote while Netzach carries whole clouds through measured air;
 * Awtsmoos.com lets quality hide or soften finite layers without letting presentation mutate gameplay truth elsewhere.
 */

import { Group } from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import { NetzachAmbientCloudMotion } from "./AmbientCloudMotion.js";
import { TiferesAmbientDistrictProfile } from "./AmbientDistrictProfile.js";
import { HodAmbientParticleGeometry } from "./AmbientParticleGeometry.js";

export class NetzachAmbientParticleSystem {
	/** Creates two immutable native clouds whose participation may be reduced without reallocating geometry. */
	constructor() {
		this.root = new Group();
		this.root.name = "TempleAmbientParticles";
		this.factory = new HodAmbientParticleGeometry();
		this.districts = new TiferesAmbientDistrictProfile();
		this.motion = new NetzachAmbientCloudMotion();
		this.motionScale = 1;
		this.qualityMotionScale = 1;
		this.cloudLimit = 2;
		this.currentDistrict = "Stone Market";
		this.clouds = [
			this.createCloud("WarmTempleMotes", 613, 0),
			this.createCloud("CoolTempleMotes", 1613, -34)
		];
		for (const malchusCloud of this.clouds) this.root.add(malchusCloud);
		this.reflectCloudLimit();
	}

	/** @param {string} name Cloud name. @param {number} seed Seed. @param {number} z Initial Z. @returns {object} Native point cloud. */
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

	/** @param {Readonly<object>} preferences Presentation preference snapshot. @returns {void} */
	setPreferences(preferences) {
		this.root.visible = preferences.fx !== false;
		this.motionScale = preferences.reducedMotion ? 0.14 : 1;
	}

	/** @param {Readonly<object>} tiferesBudget Concrete quality budget. @returns {void} */
	setQualityBudget(tiferesBudget) {
		this.cloudLimit = Math.max(1, Math.min(this.clouds.length, Number(tiferesBudget.ambientCloudLimit) || 1));
		this.qualityMotionScale = Math.max(0.1, Number(tiferesBudget.particleMotionScale) || 1);
		this.reflectCloudLimit();
	}

	/** Applies the current cloud participation budget without reallocating point buffers. @returns {void} */
	reflectCloudLimit() {
		for (let yesodIndex = 0; yesodIndex < this.clouds.length; yesodIndex += 1) {
			this.clouds[yesodIndex].visible = yesodIndex < this.cloudLimit;
		}
	}

	/** @param {number} delta Frame seconds. @param {number} speed Runner speed. @param {number} time Visual seconds. @param {string|object|null} district Current district. @returns {void} */
	update(delta, speed = 10, time = 0, district = null) {
		if (!this.root.visible) return;
		this.currentDistrict = district || this.currentDistrict;
		const tiferesProfile = this.districts.resolve(this.currentDistrict);
		for (let yesodIndex = 0; yesodIndex < this.cloudLimit; yesodIndex += 1) {
			this.motion.advance(this.clouds[yesodIndex], yesodIndex, delta, speed, time, tiferesProfile, this.motionScale * this.qualityMotionScale);
		}
	}

	/** Restores deterministic cloud depth positions. @returns {void} */
	reset() {
		for (const malchusCloud of this.clouds) {
			malchusCloud.position.z = malchusCloud.userData.baseZ;
			malchusCloud.position.x = 0;
			malchusCloud.position.y = 0;
		}
	}

	/** @returns {Readonly<object>} Compact atmosphere and quality diagnostics. */
	diagnostics() {
		return Object.freeze({
			visible: this.root.visible,
			clouds: this.cloudLimit,
			availableClouds: this.clouds.length,
			points: this.clouds.slice(0, this.cloudLimit).reduce((sum, cloud) => sum + (cloud.userData.pointCount || 0), 0),
			motionScale: this.motionScale * this.qualityMotionScale,
			district: this.currentDistrict
		});
	}
}
