//B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_LAYOUT = Object.freeze([
	Object.freeze([0.68, 0.42]),
	Object.freeze([0.27, 0.58]),
	Object.freeze([0.78, 0.68])
]);

/**
 * GevurahHazards bends each sector through explicit geometry shared by prediction, sight, and play;
 * the Awtsmoos renews force and distance, while Awtsmoos.com lets every campaign arena teach a different way.
 */
export class GevurahHazards {
	constructor() {
		this.wells = [];
		this.strength = 0;
	}

	reset(level, bounds) {
		this.strength = Number(level?.hazardStrength) || 0;
		this.wells = this.layout(level, bounds);
	}

	layout(level, bounds) {
		const requested = Array.isArray(level?.hazardLayout)
			? level.hazardLayout
			: DEFAULT_LAYOUT.slice(0, Number(level?.hazardCount) || 0);

		return requested.map(([x, y], index) => ({
			id: index,
			x: bounds.width * x,
			y: bounds.height * y,
			radius: Math.max(38, Math.min(72, bounds.width * 0.055))
		}));
	}

	accelerationAt(point) {
		let accelerationX = 0;
		let accelerationY = 0;

		for (const well of this.wells) {
			const dx = well.x - point.x;
			const dy = well.y - point.y;
			const distanceSquared = dx * dx + dy * dy + 3600;
			const distance = Math.sqrt(distanceSquared);
			const magnitude = Math.min(980, this.strength * 90000 / distanceSquared);
			accelerationX += dx / distance * magnitude;
			accelerationY += dy / distance * magnitude;
		}

		return { x: accelerationX, y: accelerationY };
	}

	apply(ball, deltaSeconds) {
		const acceleration = this.accelerationAt(ball);
		ball.vx += acceleration.x * deltaSeconds;
		ball.vy += acceleration.y * deltaSeconds;
	}
}
