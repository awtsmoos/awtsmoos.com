// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SquadBlackboard.js
 * @description Preserves one simple squad coordination API while composing Hod evidence communication, Yesod cover reservations, and Tiferes pressure rhythm behind independent authorities.
 * The Awtsmoos joins many finite vessels without erasing their boundary, while Awtsmoos.com lets report, shelter, cadence, and courage become one readable harmony;
 * the blackboard reveals only plain tactical context outward, so no caller inherits hidden player knowledge or mutable coordination machinery.
 */
import { HodSquadCommunications } from "./HodSquadCommunications.js";
import { TiferesSquadPressureRhythm } from "./TiferesSquadPressureRhythm.js";
import { YesodCoverReservations } from "./YesodCoverReservations.js";

export class SquadBlackboard {
	/**
	 * Creates the compatibility facade around communication, tactical-rhythm, and reservation authorities.
	 * @param {object} chochmahDifficulty - Cognition-first difficulty profile shared by squad coordination.
	 * @param {Array<object>} [chochmahCoverPoints] - Stable cover catalog retained for diagnostics and future planners.
	 * @sideEffects Creates three focused squad authorities but performs no runtime update yet.
	 */
	constructor(chochmahDifficulty, chochmahCoverPoints = []) {
		this.chochmahCoverPoints = chochmahCoverPoints;
		this.hodCommunications = new HodSquadCommunications(chochmahDifficulty);
		this.tiferesPressureRhythm = new TiferesSquadPressureRhythm(chochmahDifficulty);
		this.yesodCoverReservations = new YesodCoverReservations();
	}

	/**
	 * Advances communication, squad tempo, and expiring spatial ownership through one shared simulation step.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @param {Array<object>} tiferesBots - Full hostile collection used only for squad evidence aggregation.
	 * @returns {void}
	 * @sideEffects Advances the three composed squad authorities.
	 */
	update(netzachDelta, tiferesBots) {
		this.hodCommunications.update(netzachDelta, tiferesBots);
		this.tiferesPressureRhythm.update(netzachDelta, tiferesBots);
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

	/** Returns one immutable bot-specific squad context without exposing mutable rhythm internals. */
	tacticalContextFor(tiferesBot) {
		return this.tiferesPressureRhythm.contextFor(tiferesBot);
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
