// B"H

import { viewportOf } from './theme.js';

const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];

function prefersReducedMotion() {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class Particle {
	constructor(type, x, y, color) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.color = color;
		this.life = type === 'rain' ? 420 : 760;
		this.maxLife = this.life;
		this.vx = type === 'rain' ? -55 : (Math.random() - 0.5) * 150;
		this.vy = type === 'rain' ? 520 : (Math.random() - 0.5) * 150;
		this.size = type === 'letter' ? 14 : 2 + Math.random() * 3;
		this.character = LETTERS[Math.floor(Math.random() * LETTERS.length)];
	}

	update(deltaSeconds) {
		if (this.type !== 'rain') this.vy += 90 * deltaSeconds;
		this.x += this.vx * deltaSeconds;
		this.y += this.vy * deltaSeconds;
		this.life -= deltaSeconds * 1000;
	}
}

export class ParticleField {
	constructor() {
		this.items = [];
		this.reducedMotion = prefersReducedMotion();
	}

	add(type, x, y, color = '#ffffff', count = 1) {
		const safeCount = this.reducedMotion ? Math.min(count, 2) : count;
		for (let index = 0; index < safeCount; index += 1) {
			this.items.push(new Particle(type, x, y, color));
		}
		const limit = this.reducedMotion ? 50 : 150;
		if (this.items.length > limit) this.items.splice(0, this.items.length - limit);
	}

	spawnWeather(ctx, weather, isInsane) {
		if (this.reducedMotion || Math.random() > 0.36) return;
		const viewport = viewportOf(ctx);
		if (isInsane) this.add('letter', Math.random() * viewport.width, -20, '#8cf6a1');
		else if (weather === 'rain') this.add('rain', Math.random() * viewport.width, -20, '#a8d8ff');
	}

	update(deltaSeconds) {
		for (const particle of this.items) particle.update(deltaSeconds);
		this.items = this.items.filter(particle => particle.life > 0);
	}

	draw(ctx) {
		for (const particle of this.items) {
			ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
			ctx.fillStyle = particle.color;
			if (particle.type === 'letter') {
				ctx.font = `${particle.size}px ui-monospace, monospace`;
				ctx.fillText(particle.character, particle.x, particle.y);
			} else if (particle.type === 'rain') {
				ctx.strokeStyle = particle.color;
				ctx.beginPath();
				ctx.moveTo(particle.x, particle.y);
				ctx.lineTo(particle.x - 5, particle.y + 16);
				ctx.stroke();
			} else {
				ctx.beginPath();
				ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
				ctx.fill();
			}
		}
		ctx.globalAlpha = 1;
	}
}
