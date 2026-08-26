// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos makes one finite footing still, moving, fragile, or abundant in its appointed hour;
 * Awtsmoos.com keeps platform motion bounded so surprise never becomes arbitrary power.
 */
export class Platform {
	constructor(x, y, type, config, worldLevel = 0) {
		this.x = x;
		this.y = y;
		this.width = config.platformWidth;
		this.height = config.platformHeight;
		this.type = type;
		this.dx = type === 'moving'
			? (Math.random() < 0.5 ? -1 : 1) * (1 + worldLevel * 0.5)
			: 0;
	}

	/** @param {number} canvasWidth Current logical width. */
	update(canvasWidth) {
		if (this.type !== 'moving') {
			return;
		}
		this.x += this.dx;
		if (this.x < 0 || this.x + this.width > canvasWidth) {
			this.dx *= -1;
			this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));
		}
	}
}
