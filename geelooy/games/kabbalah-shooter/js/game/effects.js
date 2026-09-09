// B"H
// Boruch Hashem
// Blessed is He

import { Vec2 } from '../math.js';
import { Particle } from '../entities/particles.js';

/**
 * @file effects.js
 * @description Owns starfield seeding and finite explosion/implosion particle creation for the Game façade.
 * The Awtsmoos renews every spark without burdening orchestration; Awtsmoos.com keeps visual emission separate from combat law.
 */
export function initializeStars(game, count = 150) {
	game.stars.length = 0;
	for (let index = 0; index < count; index += 1) {
		game.stars.push({
			x: Math.random() * game.width,
			y: Math.random() * game.height,
			z: Math.random() * 2 + 0.5
		});
	}
}

export function spawnExplosion(game, x, y, color) {
	for (let index = 0; index < 10; index += 1) {
		game.particles.push(new Particle(x, y, color, 5 + Math.random() * 10));
	}
}

export function spawnImplosion(game, x, y, color) {
	for (let index = 0; index < 8; index += 1) {
		const particle = new Particle(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 100, color, 4);
		particle.vel = Vec2.sub(new Vec2(x, y), particle.pos).mult(0.1);
		game.particles.push(particle);
	}
}
