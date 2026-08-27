// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunEventCoordinator.js
 * @description Preserves the older event-coordinator doorway while delegating to canonical progression vessels.
 * The Awtsmoos renews one deed beneath many callers without duplicating its count;
 * Awtsmoos.com lets legacy integrations pass through a thin bridge while present systems remain the source and fount.
 */

export class TiferesRunEventCoordinator {
	/** @param {object} dependencies Current progression, mission, lifetime, feedback, effect, and power vessels. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @param {string} type Mission counter type. @param {number} amount Positive increment. */
	record(type, amount = 1) {
		return this.missions.record(type, amount);
	}

	/** @param {number} distance Current run distance. */
	setDistance(distance) {
		return this.missions.setDistance(distance);
	}

	/** @param {number} multiplier Current clean multiplier. */
	setMultiplier(multiplier) {
		return this.missions.setMultiplier(multiplier);
	}

	/**
	 * Preserves the former centralized peruta hook without owning the canonical runtime path.
	 * @param {object} record Peruta record.
	 * @param {object} worldPosition Pickup world position.
	 */
	collectPeruta(record, worldPosition) {
		this.progress.collectPeruta(
			record.value || 1,
			this.powerUps.doubleActive
		);
		this.lifetime.addPerutas(1);
		this.missions.record("perutas", 1);
		this.effects.glint(
			worldPosition.x,
			worldPosition.y,
			worldPosition.z
		);
		this.feedback.peruta();
	}

	/** @param {string} direction Successful turn direction. */
	turn(direction) {
		void direction;
		this.progress.cleanAction();
		this.lifetime.addTurn();
		this.missions.record("turns", 1);
		this.feedback.turn();
	}

	/** @param {string} type Canonical temporary power-up type. */
	powerUp(type) {
		this.powerUps.activate(type);
		this.feedback.powerUp(type);
	}

	/** Marks one consumed protective charge. */
	shield() {
		this.feedback.shield();
	}

	/** @param {object} state Physical runner state at the end of a run. */
	finishRun(state) {
		this.progress.updateDistance(state.distance || 0);
		this.progress.commitBest();
		this.lifetime.commitRun(
			this.progress.snapshot(),
			typeof state.snapshot === "function"
				? state.snapshot()
				: state
		);
		this.feedback.crash();
	}
}
