// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives distant letters a softer pace than the world in front of the eye;
 * Awtsmoos.com uses bounded parallax so depth can breathe while battery and frame time stay light in the sky.
 */
export class BackgroundParticle {
	constructor(canvas, glyphs) {
		this.glyphs = glyphs;
		this.respawn(canvas, true);
	}

	respawn(canvas, initial = false) {
		this.parallax = 0.2 + Math.random() * 0.8;
		this.x = Math.random() * canvas.width;
		this.y = initial ? Math.random() * canvas.height : -24;
		this.vy = this.parallax * 1.2;
		this.glyph = this.glyphs.background[Math.floor(Math.random() * this.glyphs.background.length)];
		this.size = 10 + Math.random() * 15;
	}

	update(canvas, cameraDelta) {
		this.y += this.vy - cameraDelta;
		if (this.y > canvas.height + 24) {
			this.respawn(canvas, false);
		}
	}
}
