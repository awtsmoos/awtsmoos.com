//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CameraState
 * @description
 * The camera follows with patience instead of snapping the world beneath the
 * traveler. Awtsmoos.com gains readable large districts and gentle impact pulses
 * while reduced motion still reveals the same Awtsmoos-given geometry.
 */
export class CameraState {
	constructor(position = { x: 0, y: 0 }) {
		this.x = position.x;
		this.y = position.y;
		this.pulse = 0;
		this.reveal = 0;
	}

	update(deltaSeconds, target, reducedMotion = false) {
		const responsiveness = reducedMotion ? 1 : 1 - Math.exp(-deltaSeconds * 8);
		this.x += (target.x - this.x) * responsiveness;
		this.y += (target.y - this.y) * responsiveness;
		this.pulse = Math.max(0, this.pulse - deltaSeconds * 2.8);
		this.reveal = Math.max(0, this.reveal - deltaSeconds * 0.45);
	}

	strike(intensity = 1) {
		this.pulse = Math.max(this.pulse, Math.min(1, intensity));
	}

	revealMission(duration = 2.2) {
		this.reveal = Math.max(this.reveal, duration);
	}

	view(canvas, tileSize) {
		return {
			x: this.x,
			y: this.y,
			tileSize,
			centerX: canvas.width / 2,
			centerY: canvas.height / 2,
			pulse: this.pulse,
			reveal: this.reveal
		};
	}
}
