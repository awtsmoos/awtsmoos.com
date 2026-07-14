//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ParticleField
 * @description
 * Weather becomes deterministic motion rather than a copied effect. Each mote
 * on Awtsmoos.com is born from the chapter seed, drifts within bounded space,
 * and can become still when the player asks to behold the Awtsmoos quietly.
 */

import { SeededRandom } from '../world/SeededRandom.js';

export class ParticleField {
	constructor(seed, weather = 'clear', count = 72) {
		const random = new SeededRandom(`${seed}:particles:${weather}`);
		this.weather = weather;
		this.time = 0;
		this.particles = Array.from({ length: count }, (_, index) => ({
			id: `mote-${index + 1}`,
			x: random.next(),
			y: random.next(),
			size: 0.3 + random.next() * 1.7,
			speed: 0.05 + random.next() * 0.12,
			phase: random.next() * Math.PI * 2,
			drift: random.next() * 2 - 1
		}));
	}

	update(deltaSeconds, reducedMotion = false) {
		if (reducedMotion) return;
		this.time += deltaSeconds;

		for (const particle of this.particles) {
			const direction = this.verticalDirection();
			particle.y += direction * particle.speed * deltaSeconds;
			particle.x += Math.sin(this.time + particle.phase) * particle.drift * deltaSeconds * 0.018;
			if (particle.y > 1.05) particle.y = -0.05;
			if (particle.y < -0.05) particle.y = 1.05;
			if (particle.x > 1.05) particle.x = -0.05;
			if (particle.x < -0.05) particle.x = 1.05;
		}
	}

	verticalDirection() {
		return ['leaves', 'dustlight', 'aurora', 'crownlight'].includes(this.weather)
			? -0.45
			: 1;
	}

	views() {
		return this.particles.map(particle => ({ ...particle }));
	}
}
