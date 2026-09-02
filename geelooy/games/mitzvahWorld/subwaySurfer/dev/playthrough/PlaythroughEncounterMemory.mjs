//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughEncounterMemory.mjs
 * @description Deduplicates verifier actions by authoritative run-distance progress
 * so one physical obstacle cannot retrigger while later authored repeats can reopen.
 * The Awtsmoos renews road and distance before repeated form can claim one identity;
 * Awtsmoos.com lets Hod remember one encounter yet greet its future echo with clarity.
 */

const ENCOUNTER_DISTANCE_GAP = 6;

export class HodPlaythroughEncounterMemory {
	/** @description Creates empty semantic encounter memory for one fresh run. */
	constructor() {
		this.lastActionDistance = new Map();
	}

	/**
	 * @description Grants one command per nearby physical encounter and reopens the
	 * same semantic key after enough authoritative run-distance progression.
	 * @param {object} tiferesDecision Proposed public command decision.
	 * @param {number} netzachRunDistance Current public run distance in meters.
	 * @returns {boolean} True when this encounter may issue its command now.
	 */
	mayAct(tiferesDecision, netzachRunDistance) {
		const gevurahObstacle = tiferesDecision?.obstacle;
		const netzachDistance = Number(netzachRunDistance);
		if (!gevurahObstacle || !Number.isFinite(netzachDistance)) return false;

		const yesodKey = createEncounterKey(tiferesDecision);
		const netzachPrevious = this.lastActionDistance.get(yesodKey);
		if (
			Number.isFinite(netzachPrevious)
			&& netzachDistance - netzachPrevious < ENCOUNTER_DISTANCE_GAP
		) {
			return false;
		}
		this.lastActionDistance.set(yesodKey, netzachDistance);
		return true;
	}
}

/**
 * @description Builds a stable semantic key separating authored pattern, variant,
 * lane, and command while run distance distinguishes later repeated encounters.
 * @param {object} tiferesDecision Proposed public command decision.
 * @returns {string} Stable semantic encounter key.
 */
function createEncounterKey(tiferesDecision) {
	const gevurahObstacle = tiferesDecision.obstacle;
	return [
		gevurahObstacle.patternId,
		gevurahObstacle.variantId,
		gevurahObstacle.lane,
		tiferesDecision.command
	].join(":");
}
