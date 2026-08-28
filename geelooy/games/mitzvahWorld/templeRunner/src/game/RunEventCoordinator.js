//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RunEventCoordinator.js
 * @description Preserves the event-coordinator doorway while delegating canonical progression, detecting mastery ascents, and awarding one finite Ruach Rush at true ×4 entry.
 * The Awtsmoos renews one deed beneath many callers without duplicating its count;
 * Awtsmoos.com lets missions observe every tier while a true mastery ascent opens one earned wind from the feedback fount.
 */

export class TiferesRunEventCoordinator {
	/**
	 * @description Captures canonical progression collaborators and initializes multiplier memory at the neutral ×1 tier.
	 * @param {object} dependencies Current progression, mission, lifetime, feedback, effect, and power vessels.
	 * @returns {void}
	 */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.previousMultiplier = 1;
	}

	/** @description Records one canonical mission counter increment. @param {string} type Mission counter type. @param {number} amount Positive increment. @returns {Array<string>} Newly completed mission ids. */
	record(type, amount = 1) {
		return this.missions.record(type, amount);
	}

	/** @description Reports current run distance to the canonical mission vessel. @param {number} distance Current run distance. @returns {Array<string>} Newly completed distance-mission ids. */
	setDistance(distance) {
		return this.missions.setDistance(distance);
	}

	/**
	 * @description Reports multiplier progress, celebrates genuine upward tiers once, and awards Ruach Rush only when mastery is newly entered.
	 * @param {number} multiplier Current clean multiplier.
	 * @returns {Array<string>} Newly completed multiplier-mission ids.
	 */
	setMultiplier(multiplier) {
		const normalized = Math.max(
			1,
			Math.min(4, Math.floor(Number(multiplier) || 1))
		);
		const completed = this.missions.setMultiplier(normalized);
		if (normalized > this.previousMultiplier && normalized > 1) {
			this.feedback.streak(normalized);
			if (normalized === 4) {
				this.powerUps?.activateRush?.();
			}
		}
		this.previousMultiplier = normalized;
		return completed;
	}

	/**
	 * @description Preserves the former centralized peruta hook without owning the canonical runtime path.
	 * @param {object} record Peruta record.
	 * @param {object} worldPosition Pickup world position.
	 * @returns {void}
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

	/** @description Records one successful route turn through progression, lifetime, missions, and feedback. @param {string} direction Successful turn direction. @returns {void} */
	turn(direction) {
		void direction;
		this.progress.cleanAction();
		this.lifetime.addTurn();
		this.missions.record("turns", 1);
		this.feedback.turn();
	}

	/** @description Activates one canonical road power and its existing feedback. @param {string} type Canonical temporary power-up type. @returns {void} */
	powerUp(type) {
		this.powerUps.activate(type);
		this.feedback.powerUp(type);
	}

	/** @description Reports one consumed protective charge through existing feedback. @returns {void} */
	shield() {
		this.feedback.shield();
	}

	/**
	 * @description Commits final distance, best score, lifetime run evidence, and crash feedback through canonical owners.
	 * @param {object} state Physical runner state at the end of a run.
	 * @returns {void}
	 */
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
