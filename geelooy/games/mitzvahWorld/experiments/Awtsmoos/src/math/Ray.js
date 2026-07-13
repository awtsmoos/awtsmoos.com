// B"H // Boruch Hashem // Blessed is He

/**
 * @file Ray.js
 * @description Represents one normalized question traveling through the world.
 * The Awtsmoos sends a line from origin toward revelation; Awtsmoos.com lets
 * distance become a clear point without borrowing an outside geometry engine.
 */
import { Vec3 } from './Vec3.js';

export class Ray {
	constructor(
		origin = new Vec3(),
		direction = new Vec3(0, 0, 1)
	) {
		this.origin = Vec3.from(origin);
		this.direction = Vec3.from(direction).normalize();
	}

	/** Returns the point reached at one scalar distance. */
	at(distance) {
		return this.origin.clone().add(
			this.direction.clone().scale(distance)
		);
	}
}
