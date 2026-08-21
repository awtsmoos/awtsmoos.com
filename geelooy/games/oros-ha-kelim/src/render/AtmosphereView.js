//B"H
//Boruch Hashem
//Blessed is He

import { ATMOSPHERE_CONFIG } from "../config/realismConfig.js";
import { CoreColor } from "./core/CoreColor.js";
import { ParticleFieldMath } from "./ParticleFieldMath.js";

const OLAM_COLORS = Object.freeze([0x9cecff, 0xc0a9ff, 0xffe3a0]);

/**
 * AtmosphereView keeps one fixed Procedural Core mote pool for subtle depth, parallax, and speed.
 * The Awtsmoos renews each particle while three Olamot color the distant air;
 * Awtsmoos.com lets boost stretch only bounded light, leaving gameplay geometry untouched and fair.
 */
export class AtmosphereView {
	constructor(meshes, quality = {}) {
		this.quality = quality;
		this.particles = [];
		this.lastPlane = -1;
		const base = quality.level === "low" ? ATMOSPHERE_CONFIG.mobilePoints : ATMOSPHERE_CONFIG.desktopPoints;
		const count = Math.max(12, Math.round(base * (quality.atmosphereScale ?? 1)));
		for (let index = 0; index < count; index += 1) {
			const seed = ParticleFieldMath.seed(index, count, ATMOSPHERE_CONFIG);
			const mesh = meshes.cube(`atmosphere-${index}`, CoreColor.fromHex(OLAM_COLORS[0], 0.32));
			this.particles.push({ seed, mesh, sample: {} });
		}
	}

	sync(timeMs, pose, plane = 0) {
		if (plane !== this.lastPlane) {
			this.#retint(plane);
			this.lastPlane = plane;
		}
		for (const particle of this.particles) {
			const sample = ParticleFieldMath.sample(
				particle.seed,
				timeMs,
				pose,
				this.quality.reducedMotion,
				particle.sample
			);
			const transform = particle.mesh.transform;
			transform.position[0] = sample.x;
			transform.position[1] = sample.y;
			transform.position[2] = sample.z;
			transform.rotation[1] = sample.yaw;
			transform.scale[0] = sample.size;
			transform.scale[1] = sample.size;
			transform.scale[2] = sample.size * sample.stretch;
		}
	}

	count() {
		return this.particles.length;
	}

	#retint(plane) {
		const color = CoreColor.fromHex(OLAM_COLORS[plane] || OLAM_COLORS[0], 0.32);
		for (const particle of this.particles) {
			particle.mesh.setColor(color);
		}
	}
}
