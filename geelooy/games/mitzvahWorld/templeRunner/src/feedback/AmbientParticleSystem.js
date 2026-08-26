// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AmbientParticleSystem.js
 * @description Moves two immutable native point clouds through bounded depth while preferences and district air tune motion only.
 * The Awtsmoos renews each mote while Netzach carries whole clouds forward without rewriting hidden GPU arrays;
 * Awtsmoos.com lets market, olive, bridge, alley, courtyard, and evening whisper while Chossid remains the greater star.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import { TiferesAmbientDistrictProfile } from "./AmbientDistrictProfile.js";
import { HodAmbientParticleGeometry } from "./AmbientParticleGeometry.js";

export class NetzachAmbientParticleSystem {
	constructor() {
		this.root = new Group();
		this.root.name = "TempleAmbientParticles";
		this.factory = new HodAmbientParticleGeometry();
		this.districts = new TiferesAmbientDistrictProfile();
		this.motionScale = 1;
		this.currentDistrict = "Stone Market";
		this.clouds = [
			this.createCloud("WarmTempleMotes", 613, 0),
			this.createCloud("CoolTempleMotes", 1613, -34)
		];
		for (const cloud of this.clouds) {
			this.root.add(cloud);
		}
	}

	/** @param {string} name Cloud name. @param {number} seed Seed. @param {number} z Initial Z. @returns {object} */
	createCloud(name, seed, z) {
		const cloud = this.factory.create({
			name,
			seed,
			count: 54,
			width: 18,
			height: 7,
			depth: 64,
			opacity: 0.62
		});
		cloud.position.z = z;
		cloud.userData.baseZ = z;
		cloud.userData.phase = seed * 0.017;
		return cloud;
	}

	/** @param {object} preferences Presentation preference snapshot. */
	setPreferences(preferences) {
		this.root.visible = preferences.fx !== false;
		this.motionScale = preferences.reducedMotion
			? 0.14
			: 1;
	}

	/**
	 * Advances only whole-cloud transforms, leaving immutable GPU buffers untouched.
	 * @param {number} delta Frame seconds.
	 * @param {number} speed Runner speed.
	 * @param {number} time Visual seconds.
	 * @param {string|object|null} district Current district label/definition.
	 */
	update(delta, speed = 10, time = 0, district = null) {
		if (!this.root.visible) return;
		this.currentDistrict = district || this.currentDistrict;
		const profile = this.districts.resolve(this.currentDistrict);
		const travel = delta
			* (0.72 + Math.min(22, speed) * 0.035)
			* this.motionScale
			* profile.travel;
		for (let index = 0; index < this.clouds.length; index += 1) {
			const cloud = this.clouds[index];
			cloud.position.z += travel * (index ? 0.72 : 1);
			if (cloud.position.z > 28) {
				cloud.position.z -= 70;
			}
			const phase = time * 0.08 * this.motionScale + cloud.userData.phase;
			cloud.position.x = Math.sin(phase)
				* (index ? 0.42 : 0.26)
				* profile.sway;
			cloud.position.y = Math.cos(phase * 0.7)
				* profile.vertical
				* this.motionScale;
		}
	}

	/** Restores deterministic cloud depth positions. */
	reset() {
		for (const cloud of this.clouds) {
			cloud.position.z = cloud.userData.baseZ;
			cloud.position.x = 0;
			cloud.position.y = 0;
		}
	}

	/** @returns {object} Compact atmosphere diagnostics. */
	diagnostics() {
		return {
			visible: this.root.visible,
			clouds: this.clouds.length,
			points: this.clouds.reduce((sum, cloud) => {
				return sum + (cloud.userData.pointCount || 0);
			}, 0),
			motionScale: this.motionScale,
			district: this.currentDistrict
		};
	}
}
