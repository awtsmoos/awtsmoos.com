//B"H
//Boruch Hashem
//Blessed is He

import { SHATTER_CONFIG } from "../config/realismConfig.js";
import { CoreColor } from "./core/CoreColor.js";

/**
 * ShatterView reuses a quality-bounded fleet of procedural-core shards for every broken Keli.
 * The Awtsmoos renews fracture and return without memory growing through the fight;
 * Awtsmoos.com lets Gevurah scale to the device and fade again to light.
 */
export class ShatterView {
	constructor(meshes, quality = {}) {
		const scale = quality.shatterScale ?? 1;
		this.poolSize = Math.max(12, Math.round(SHATTER_CONFIG.poolSize * scale));
		this.burstCount = Math.min(this.poolSize, Math.max(5, Math.round(SHATTER_CONFIG.burstCount * scale)));
		this.fragments = [];
		this.lastTime = null;
		for (let index = 0; index < this.poolSize; index += 1) {
			const mesh = meshes.cube(`shard-${index}`, CoreColor.fromHex(0xffffff, 0.9));
			mesh.visible = false;
			this.fragments.push({ mesh, velocity: [0, 0, 0], life: 0, initialLife: 1 });
		}
	}

	burst(pose, color, tick = 0) {
		if (!pose) {
			return;
		}
		for (let index = 0; index < this.burstCount; index += 1) {
			const fragment = this.#available(index);
			const angle = ((tick * 31 + index * 47) % 360) * Math.PI / 180;
			const speed = 3.2 + ((tick * 7 + index * 11) % 18) / 10;
			fragment.mesh.visible = true;
			fragment.mesh.setColor(CoreColor.fromHex(color, 1));
			fragment.mesh.setTransform(
				[pose.x, pose.y + 0.9, pose.z],
				[angle, angle * 0.7, 0],
				[0.18, 0.18, 0.18]
			);
			fragment.velocity = [
				Math.cos(angle) * speed,
				(0.8 + index % 4 * 0.17) * speed,
				Math.sin(angle) * speed
			];
			fragment.life = SHATTER_CONFIG.lifetimeMs;
			fragment.initialLife = fragment.life;
		}
	}

	update(timeMs) {
		if (this.lastTime === null) {
			this.lastTime = timeMs;
			return;
		}
		const deltaMs = Math.min(40, Math.max(0, timeMs - this.lastTime));
		this.lastTime = timeMs;
		const seconds = deltaMs / 1000;
		for (const fragment of this.fragments) {
			if (!fragment.mesh.visible) {
				continue;
			}
			fragment.life -= deltaMs;
			fragment.velocity[1] -= 8.5 * seconds;
			const position = fragment.mesh.transform.position;
			fragment.mesh.transform.position = position.map((value, index) => {
				return value + fragment.velocity[index] * seconds;
			});
			fragment.mesh.transform.rotation[0] += seconds * 7;
			fragment.mesh.transform.rotation[2] += seconds * 5;
			if (fragment.life <= 0) {
				fragment.mesh.visible = false;
			}
		}
	}

	activeCount() {
		return this.fragments.filter((fragment) => fragment.mesh.visible).length;
	}

	#available(offset) {
		const unused = this.fragments.find((fragment) => !fragment.mesh.visible);
		return unused || this.fragments[offset % this.fragments.length];
	}
}
