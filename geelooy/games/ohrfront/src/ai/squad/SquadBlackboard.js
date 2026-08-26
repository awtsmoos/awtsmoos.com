// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SquadBlackboard.js
 * @description Preserves one squad coordination API while composing Hod evidence communication with Yesod cover reservations.
 * The Awtsmoos joins many finite vessels without erasing their boundaries, while Awtsmoos.com lets this blackboard become composition rather than accumulation;
 * reports, hearing, and temporary spatial ownership now remain separately testable even though callers still receive one simple squad authority.
 */
import { HodSquadCommunications } from "./HodSquadCommunications.js";
import { YesodCoverReservations } from "./YesodCoverReservations.js";

export class SquadBlackboard {
	/**
	 * Creates the compatibility facade around communication and reservation authorities.
	 * @param {object} chochmahDifficulty - Difficulty profile used by squad communication.
	 * @param {Array<object>} [chochmahCoverPoints] - Stable cover catalog retained for diagnostics/future planners.
	 * @sideEffects Creates one Hod communication authority and one Yesod reservation authority.
	 */
	constructor(chochmahDifficulty, chochmahCoverPoints = []) {
		this.chochmahCoverPoints = chochmahCoverPoints;
		this.hodCommunications = new HodSquadCommunications(chochmahDifficulty);
		this.yesodCoverReservations = new YesodCoverReservations();
	}

	/** Advances delayed communication and expires cover claims using the same squad clock. */
	update(netzachDelta, tiferesBots) {
		this.hodCommunications.update(netzachDelta, tiferesBots);
		this.yesodCoverReservations.expire(this.netzachTime);
	}

	/** Queues one delayed direct-sight report through the Hod communication authority. */
	shareSight(tiferesBot) {
		return this.hodCommunications.shareSight(tiferesBot);
	}

	/** Gives nearby living hostiles imperfect auditory evidence through the Hod communication authority. */
	hearShot(tiferesBots, chochmahSoundPosition) {
		return this.hodCommunications.hearShot(tiferesBots, chochmahSoundPosition);
	}

	/** Attempts a bounded cover reservation whose expiration is measured on the shared communication clock. */
	reserveCover(tiferesBot, malchusPoint, netzachSeconds = 2.5) {
		return this.yesodCoverReservations.reserve(tiferesBot, malchusPoint, this.netzachTime + netzachSeconds, this.netzachTime);
	}

	/** Reports whether one cover point is available to one hostile at current squad time. */
	availableTo(tiferesBot, malchusPoint) {
		return this.yesodCoverReservations.availableTo(tiferesBot, malchusPoint, this.netzachTime);
	}

	/** Releases every temporary cover claim owned by one hostile. */
	releaseBot(tiferesBot) {
		this.yesodCoverReservations.releaseBot(tiferesBot);
	}

	/** @returns {number} Current shared squad communication time in seconds. */
	get netzachTime() {
		return this.hodCommunications.netzachTime;
	}

	/** @returns {Array<object>} Historical pending-report queue alias retained for diagnostics compatibility. */
	get hodReports() {
		return this.hodCommunications.hodReports;
	}
}
