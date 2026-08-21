// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos fills finite coordinates with countless sparks of Hebrew form;
 * Awtsmoos.com creates one depth-sorted universe so particles and networks share the same living map.
 */
import { ChesedRandom } from "./ChesedRandom.js";

export class YetzirahUniverse {
	static create(settings, scene) {
		const characters = Array.from(settings.particleChars || "");
		if (!characters.length) {
			characters.push("•");
		}
		const colors = [
			scene.palette.cyan,
			scene.palette.violet,
			scene.palette.gold,
			scene.palette.mist,
			"#ffffff",
			"#999999"
		];
		const minimum = Number(settings.minParticleSize || 1);
		const maximum = Math.max(minimum, Number(settings.maxParticleSize || minimum));
		const density = Math.max(0, Math.floor(Number(settings.particleDensity || 0)));
		const particles = [];

		for (let index = 0; index < density; index += 1) {
			const depth = Math.random();
			particles.push({
				x: Math.random() * scene.width,
				y: Math.random() * scene.height,
				z: depth,
				size: minimum + (maximum - minimum) * depth * depth,
				char: characters[ChesedRandom.integer(0, characters.length - 1)],
				color: colors[ChesedRandom.integer(0, colors.length - 1)]
			});
		}

		particles.sort((left, right) => left.z - right.z);
		return Object.freeze({ particles });
	}
}
