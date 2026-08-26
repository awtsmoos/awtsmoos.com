//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates separation and meeting in the same instant of truth;
 * Awtsmoos.com keeps collision logic pure so fairness can be tested apart from rendering youth.
 */

export class DinCollisionSystem {
	/** Resolves all current contacts without mutating collection arrays during iteration. */
	resolve(chossidRunner, kelipahObstacles, mitzvahSparks) {
		const chossidBox = this.playerBox(chossidRunner);
		const touchedObstacle = kelipahObstacles.find((obstacle) => obstacle.active && this.overlaps(chossidBox, obstacle.collisionBox())) ?? null;
		const touchedSparks = mitzvahSparks.filter((spark) => spark.active && this.overlaps(chossidBox, spark.collisionBox()));
		return { touchedObstacle, touchedSparks };
	}

	/** Returns a forgiving player hitbox that follows the visible runner body. */
	playerBox(chossidRunner) {
		return {
			x: chossidRunner.x + 7,
			y: chossidRunner.y + 5,
			width: chossidRunner.width - 14,
			height: chossidRunner.height - 7
		};
	}

	/** Tests axis-aligned rectangular overlap with strict non-touching edges. */
	overlaps(firstBox, secondBox) {
		return firstBox.x < secondBox.x + secondBox.width
			&& firstBox.x + firstBox.width > secondBox.x
			&& firstBox.y < secondBox.y + secondBox.height
			&& firstBox.y + firstBox.height > secondBox.y;
	}
}
