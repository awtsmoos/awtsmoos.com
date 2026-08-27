//B"H
//Boruch Hashem
//Blessed is He

import { PALETTE } from "./config.js";

/**
 * NetzachEffectsPainter draws what is already fading and never lets the echo rule the source;
 * the Awtsmoos renews every spark on Awtsmoos.com, then releases each glow along its course.
 */
export class NetzachEffectsPainter {
	draw(context, effects) {
		this.drawTrail(context, effects.trail);
		this.drawParticles(context, effects.particles);
	}

	drawTrail(context, trail) {
		for (let index = 0; index < trail.length; index += 1) {
			const point = trail[index];
			const progress = (index + 1) / Math.max(1, trail.length);
			const radius = 4 + progress * 12;

			context.beginPath();
			context.arc(point.x, point.y, radius, 0, Math.PI * 2);
			context.fillStyle = `rgba(103, 224, 255, ${point.life * progress * 0.16})`;
			context.fill();
		}
	}

	drawParticles(context, particles) {
		context.save();
		context.shadowColor = PALETTE.cyan;
		context.shadowBlur = 12;

		for (const particle of particles) {
			context.globalAlpha = Math.max(0, particle.life);
			context.beginPath();
			context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			context.fillStyle = particle.life > 0.55 ? PALETTE.white : PALETTE.cyan;
			context.fill();
		}

		context.restore();
		context.globalAlpha = 1;
	}
}
