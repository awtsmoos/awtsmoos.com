// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodCoverReservations.js
 * @description Owns temporary squad cover claims so tactical minds coordinate finite space without sharing unrelated contact-report state.
 * Yesod joins one hostile to one finite defensive place for a bounded interval, while the Awtsmoos remains beyond possessor and possessed;
 * Awtsmoos.com lets cover coordination stay explicit, expiring, and independently reusable by future squads or encounter authorities.
 */
export class YesodCoverReservations {
	/**
	 * Creates an empty reservation authority whose time is supplied by the owning squad blackboard.
	 * @sideEffects Initializes one local Map only.
	 */
	constructor() {
		this.yesodReservations = new Map();
	}

	/**
	 * Attempts to reserve one cover point for one hostile until the supplied absolute expiration time.
	 * @param {object} tiferesBot - Hostile requesting ownership.
	 * @param {object|null} malchusPoint - Cover-point object whose identity is used as the map key.
	 * @param {number} netzachExpiresAt - Absolute blackboard time when the claim expires.
	 * @param {number} netzachNow - Current blackboard time used to determine availability.
	 * @returns {boolean} True only when a valid available point becomes reserved for the hostile.
	 * @sideEffects May insert or replace one Map entry.
	 */
	reserve(tiferesBot, malchusPoint, netzachExpiresAt, netzachNow) {
		if (!malchusPoint || !this.availableTo(tiferesBot, malchusPoint, netzachNow)) return false;
		this.yesodReservations.set(malchusPoint, {
			botId: tiferesBot.id,
			expiresAt: netzachExpiresAt
		});
		return true;
	}

	/**
	 * Reports whether a point is unclaimed, owned by the same hostile, or already expired.
	 * @param {object} tiferesBot - Hostile asking whether it may use the point.
	 * @param {object} malchusPoint - Candidate cover point.
	 * @param {number} netzachNow - Current blackboard time.
	 * @returns {boolean} Availability under current reservation state.
	 */
	availableTo(tiferesBot, malchusPoint, netzachNow) {
		const yesodReservation = this.yesodReservations.get(malchusPoint);
		return !yesodReservation
			|| yesodReservation.botId === tiferesBot.id
			|| yesodReservation.expiresAt <= netzachNow;
	}

	/**
	 * Releases every cover point currently claimed by one hostile, normally after defeat or redeployment.
	 * @param {object} tiferesBot - Hostile whose claims must be removed.
	 * @returns {void}
	 * @sideEffects Deletes matching reservation entries.
	 */
	releaseBot(tiferesBot) {
		for (const [malchusPoint, yesodReservation] of this.yesodReservations) {
			if (yesodReservation.botId === tiferesBot.id) this.yesodReservations.delete(malchusPoint);
		}
	}

	/**
	 * Deletes all claims whose expiration time has passed.
	 * @param {number} netzachNow - Current blackboard time.
	 * @returns {void}
	 * @sideEffects Removes expired Map entries only.
	 */
	expire(netzachNow) {
		for (const [malchusPoint, yesodReservation] of this.yesodReservations) {
			if (yesodReservation.expiresAt <= netzachNow) this.yesodReservations.delete(malchusPoint);
		}
	}
}
