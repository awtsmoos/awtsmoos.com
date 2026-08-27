//B"H
// Boruch Hashem
// Blessed is He

/**
 * OrosEffects leaves a fading remembrance behind motion while respecting a quieter sensory road;
 * the Awtsmoos renews every spark on Awtsmoos.com, and reduced motion lightens the decorative load.
 */
export class OrosEffects {
	constructor(settings, random, accessibility) {
		this.settings = settings;
		this.random = random;
		this.accessibility = accessibility;
		this.trail = [];
		this.particles = [];
	}

	reset() {
		this.trail = [];
		this.particles = [];
	}

	recordBall(ball) {
		if (this.accessibility.reducedMotion) {
			return;
		}
		const previous = this.trail.at(-1);
		const moved = !previous || Math.hypot(ball.x - previous.x, ball.y - previous.y) > 7;
		if (!moved) {
			return;
		}

		this.trail.push({ x: ball.x, y: ball.y, life: 1 });
		while (this.trail.length > this.settings.trailLimit) {
			this.trail.shift();
		}
	}

	burst(point, strength = 1) {
		const remainingCapacity = this.settings.particleLimit - this.particles.length;
		const desired = Math.min(remainingCapacity, Math.round(14 + strength * 12));
		const count = this.accessibility.effectCount(desired);

		for (let index = 0; index < count; index += 1) {
			const angle = this.random.between(0, Math.PI * 2);
			const speed = this.random.between(80, 280) * strength;
			this.particles.push({
				x: point.x,
				y: point.y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 1,
				size: this.random.between(1.5, 4.5)
			});
		}
	}

	impact(ball, speed) {
		const strength = Math.min(1.6, Math.max(0.45, speed / 700));
		this.burst(ball, strength);
	}

	update(deltaSeconds) {
		for (const point of this.trail) {
			point.life -= deltaSeconds * 2.7;
		}
		this.trail = this.trail.filter(point => point.life > 0);

		for (const particle of this.particles) {
			particle.x += particle.vx * deltaSeconds;
			particle.y += particle.vy * deltaSeconds;
			particle.vx *= 0.985;
			particle.vy = particle.vy * 0.985 + 160 * deltaSeconds;
			particle.life -= deltaSeconds * 1.9;
		}
		this.particles = this.particles.filter(particle => particle.life > 0);
	}
}
