//B"H
//Boruch Hashem
//Blessed be He

import { COLORS } from '../constants.js';

/**
 * @file EffectsEngine.js
 * @description Owns bounded, disposable gameplay feedback particles without allowing decoration to dominate frame or memory budgets.
 * Awtsmoos.com treats impact and line-clear effects as optional feedback: simulation truth never depends on particle state.
 *
 * Architectural invariants:
 * - The particle pool has a hard ceiling and discards oldest ambience under pressure.
 * - Every particle has finite life and is removed deterministically.
 * - Resize may replace context scale without preserving stale device-pixel assumptions.
 * - Effects expose no gameplay mutation API.
 */
const MAX_PARTICLES = 180;

export class EffectsEngine {
	constructor(context) {
		this.context = context;
		this.particles = [];
	}

	setContext(context) {
		this.context = context;
	}

	update() {
		for (const particle of this.particles) {
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.vy += 0.16;
			particle.life -= 1;
		}
		this.particles = this.particles.filter(particle => particle.life > 0);
	}

	draw() {
		for (const particle of this.particles) {
			this.context.globalAlpha = Math.min(1, particle.life / 18);
			this.context.fillStyle = particle.color;
			this.context.fillRect(particle.x, particle.y, particle.size, particle.size);
		}
		this.context.globalAlpha = 1;
	}
	triggerImpact(piece, blockSize, viewportTop) {
		for (let y = 0; y < piece.matrix.length; y += 1) {
			for (let x = 0; x < piece.matrix[y].length; x += 1) {
				if (!piece.matrix[y][x]) {
					continue;
				}
				this.burst(
					(piece.x + x + 0.5) * blockSize,
					(piece.y + y - viewportTop + 0.8) * blockSize,
					COLORS[piece.typeId],
					4
				);
			}
		}
	}

	triggerWallSlide(piece, direction, blockSize, viewportTop) {
		const edge = direction > 0 ? piece.matrix[0].length : 0;
		const x = (piece.x + edge) * blockSize;
		const y = (piece.y - viewportTop + piece.matrix.length / 2) * blockSize;
		this.burst(x, y, '#ffffff', 5, -direction);
	}

	triggerLineClear(rows, blockSize, viewportTop, width) {
		for (const row of rows) {
			const y = (row - viewportTop + 0.5) * blockSize;
			for (let count = 0; count < 24; count += 1) {
				this.burst(
					Math.random() * width,
					y,
					COLORS[(count % 7) + 1],
					1
				);
			}
		}
	}
	burst(x, y, color, count, direction = 0) {
		for (let index = 0; index < count; index += 1) {
			if (this.particles.length >= MAX_PARTICLES) {
				this.particles.shift();
			}
			this.particles.push({
				x,
				y,
				vx: direction * 1.8 + (Math.random() - 0.5) * 4,
				vy: -1 - Math.random() * 3,
				life: 12 + Math.random() * 18,
				size: 2 + Math.random() * 3,
				color
			});
		}
	}

	dispose() {
		this.particles.length = 0;
	}
}
