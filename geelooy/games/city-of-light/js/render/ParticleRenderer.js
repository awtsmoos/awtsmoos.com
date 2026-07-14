//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ParticleRenderer
 * @description
 * Seeded weather motes cross the screen as atmosphere rather than collision.
 * Awtsmoos.com can show mist, rain, leaves, dustlight, and crownlight while the
 * player still reads every traversable street beneath the creating Awtsmoos.
 */
export class ParticleRenderer {
	constructor(context) {
		this.context = context;
	}

	draw(particles, canvas, theme, weather) {
		const context = this.context;
		context.save();
		context.fillStyle = theme.glow;
		context.strokeStyle = theme.mist;

		for (const particle of particles) {
			const x = particle.x * canvas.width;
			const y = particle.y * canvas.height;
			if (['rain', 'stormlight'].includes(weather)) {
				context.globalAlpha = 0.18;
				context.lineWidth = Math.max(1, particle.size * 0.6);
				context.beginPath();
				context.moveTo(x, y);
				context.lineTo(x - 5, y + 14 + particle.size * 3);
				context.stroke();
				continue;
			}
			context.globalAlpha = weather === 'mist' ? 0.08 : 0.18;
			context.beginPath();
			context.arc(x, y, particle.size, 0, Math.PI * 2);
			context.fill();
		}

		context.restore();
	}
}
