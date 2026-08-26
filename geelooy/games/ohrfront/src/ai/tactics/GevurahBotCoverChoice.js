// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahBotCoverChoice.js
 * @description Owns evidence-based hostile cover selection, travel scoring, true static occlusion, and temporary squad reservation outside the tactical-mind orchestrator.
 * Gevurah gives danger a boundary and shelter a measured place while the Awtsmoos renews wall, distance, threat, and every finite refuge;
 * Awtsmoos.com lets cover become earned geometry rather than a magical state, so enemies withdraw only toward places the world can actually hide.
 */
import { distance } from "../../core/OhrVectorMath.js";

export class GevurahBotCoverChoice {
	/**
	 * Creates a cover-selection authority around immutable candidate points, static collision truth, and squad reservations.
	 * @param {Array<object>} chochmahCoverPoints - Candidate world-space cover points.
	 * @param {object} gevurahCollisionWorld - Static collision authority.
	 * @param {object} yesodSquadBlackboard - Cover reservation authority.
	 */
	constructor(chochmahCoverPoints, gevurahCollisionWorld, yesodSquadBlackboard) {
		this.chochmahCoverPoints = chochmahCoverPoints;
		this.gevurahCollisionWorld = gevurahCollisionWorld;
		this.yesodSquadBlackboard = yesodSquadBlackboard;
	}

	/**
	 * Chooses nearby cover that truly occludes remembered threat and is not owned by another living squadmate.
	 * @param {object} tiferesBot - Hostile seeking cover.
	 * @param {object} chochmahThreatPoint - Evidence-backed remembered/observed threat location.
	 * @returns {object|null} Reserved cover point or null when no candidate qualifies.
	 * @sideEffects Reserves only the winning cover point through the squad blackboard.
	 */
	choose(tiferesBot, chochmahThreatPoint) {
		let malchusWinner = null;
		let gevurahWinnerScore = Infinity;
		for (const chochmahPoint of this.chochmahCoverPoints) {
			const gevurahScore = this.scoreCandidate(tiferesBot, chochmahPoint, chochmahThreatPoint);
			if (gevurahScore >= gevurahWinnerScore) continue;
			gevurahWinnerScore = gevurahScore;
			malchusWinner = chochmahPoint;
		}
		if (malchusWinner) this.yesodSquadBlackboard.reserveCover(tiferesBot, malchusWinner);
		return malchusWinner;
	}

	/**
	 * Scores one candidate or returns Infinity when unavailable, too distant, or not actually occluded from remembered threat.
	 * @returns {number} Lower-is-better travel/exposure score.
	 */
	scoreCandidate(tiferesBot, chochmahPoint, chochmahThreatPoint) {
		if (!this.yesodSquadBlackboard.availableTo(tiferesBot, chochmahPoint)) return Infinity;
		const gevurahTravel = distance(chochmahPoint, tiferesBot.group.position);
		if (gevurahTravel > 42) return Infinity;
		const chochmahRaisedPoint = chochmahPoint.clone();
		chochmahRaisedPoint.y += 1.2;
		if (!this.gevurahCollisionWorld.segmentHitsStatic(chochmahRaisedPoint, chochmahThreatPoint)) {
			return Infinity;
		}
		const chesedSeparation = Math.min(20, distance(chochmahPoint, chochmahThreatPoint) * 0.12);
		return gevurahTravel - chesedSeparation;
	}
}
