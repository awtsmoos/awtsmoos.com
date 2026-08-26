//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusRenderer.js
 * @description Owns canvas resolution, scene drawing, and visible manifestation of pure simulation state.
 * The Awtsmoos renews appearance before a pixel can claim to be the source of sight; Awtsmoos.com lets Malchus reveal measured state as a clean road of color, symbol, depth, and light.
 */

export class MalchusRenderer {
	/** @param {HTMLCanvasElement} canvas Dedicated game canvas. */
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.width = 1;
		this.height = 1;
		this.groundY = 1;
	}

	/** Matches backing resolution to CSS pixels and device density without layout overflow. */
	resize(width, height) {
		const density = Math.min(2, window.devicePixelRatio || 1);
		this.width = Math.max(1, Math.floor(width));
		this.height = Math.max(1, Math.floor(height));
		this.groundY = Math.floor(this.height * 0.79);
		this.canvas.width = Math.floor(this.width * density);
		this.canvas.height = Math.floor(this.height * density);
		this.context.setTransform(density, 0, 0, density, 0, 0);
	}

	/** Draws the entire frame from current state without mutating simulation. */
	draw(state) {
		const context = this.context;
		context.clearRect(0, 0, this.width, this.height);
		this.drawSky(context, state.elapsed);
		this.drawGround(context, state.distance);
		state.sparks.forEach(spark => {
			this.drawGlyph(context, spark.archetype.glyph, spark.x, spark.y, spark.size);
		});
		state.obstacles.forEach(obstacle => {
			this.drawGlyph(context, obstacle.archetype.glyph, obstacle.x, obstacle.y, obstacle.height);
		});
		this.drawRunner(context, state);
	}

	/** Paints a restrained futuristic sky whose motion communicates forward travel. */
	drawSky(context, elapsed) {
		const gradient = context.createLinearGradient(0, 0, 0, this.height);
		gradient.addColorStop(0, '#071221');
		gradient.addColorStop(0.58, '#12324a');
		gradient.addColorStop(1, '#275f72');
		context.fillStyle = gradient;
		context.fillRect(0, 0, this.width, this.height);
		context.fillStyle = 'rgba(226, 247, 255, .28)';
		for (let index = 0; index < 12; index += 1) {
			const x = (index * 131 + elapsed * 9) % (this.width + 20) - 10;
			const y = 42 + (index * 67) % Math.max(80, this.groundY - 110);
			context.fillRect(x, y, 2, 2);
		}
	}

	/** Draws a moving path with no DOM-dependent styling assumptions. */
	drawGround(context, distance) {
		context.fillStyle = '#071014';
		context.fillRect(0, this.groundY, this.width, this.height - this.groundY);
		context.strokeStyle = 'rgba(105, 235, 214, .48)';
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(0, this.groundY);
		context.lineTo(this.width, this.groundY);
		context.stroke();
		context.fillStyle = 'rgba(255,255,255,.16)';
		for (let x = -(distance * 5) % 74; x < this.width; x += 74) {
			context.fillRect(x, this.groundY + 24, 34, 3);
		}
	}

	/** Draws one emoji glyph from an entity-owned visual box. */
	drawGlyph(context, glyph, x, y, size) {
		context.font = `${Math.max(24, size)}px system-ui`;
		context.textBaseline = 'top';
		context.fillText(glyph, x, y);
	}

	/** Draws the runner plus semantic power-state rings without relying on color alone. */
	drawRunner(context, state) {
		const player = state.player;
		if (!player) {
			return;
		}
		if (state.shieldTime > 0) {
			this.drawAura(context, player, 8, '🛡️');
		}
		if (state.inspirationTime > 0) {
			this.drawAura(context, player, 16, '✦');
		}
		this.drawGlyph(context, '🏃', player.x, player.y, player.height);
	}

	/** Draws a labeled aura so temporary powers remain legible beyond color. */
	drawAura(context, player, padding, label) {
		context.strokeStyle = 'rgba(255, 239, 145, .82)';
		context.lineWidth = 2;
		context.strokeRect(player.x - padding, player.y - padding, player.width + padding * 2, player.height + padding * 2);
		context.font = '15px system-ui';
		context.fillText(label, player.x + player.width + padding, player.y - padding);
	}
}
