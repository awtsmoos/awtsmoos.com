// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotTacticalMind.js
 * @description Converts one bot's evidence-based contact, shield/suppression pressure, cover availability, and squad role order into movement intention.
 * The Awtsmoos renews seeing, remembering, and choosing without becoming any finite decision;
 * Awtsmoos.com lets this mind reason only from its own contact vessel so breaking line of sight becomes tactically meaningful instead of cosmetic.
 */
import { distance, vector } from "../core/OhrVectorMath.js";

export class BotTacticalMind {
	/**
	 * Creates renderer-neutral tactical policy around role, cover geometry, collision evidence, and shared reservation authority.
	 * @param {object} chochmahRole - Immutable hostile role profile.
	 * @param {Array<object>} chochmahCoverPoints - Candidate world-space cover points.
	 * @param {object} gevurahCollisionWorld - Static line-of-sight boundary.
	 * @param {object} yesodSquadBlackboard - Cover reservation authority.
	 */
	constructor(chochmahRole, chochmahCoverPoints, gevurahCollisionWorld, yesodSquadBlackboard) {
		this.chochmahRole = chochmahRole;
		this.chochmahCoverPoints = chochmahCoverPoints;
		this.gevurahCollisionWorld = gevurahCollisionWorld;
		this.yesodSquadBlackboard = yesodSquadBlackboard;
	}

	/**
	 * Produces one tactical movement/fire intention exclusively from remembered/observed contact and the squad's role order.
	 * @param {object} tiferesBot - Bot carrying contact, shield, suppression, patrol, and transform state.
	 * @param {{mode:string,flank:number,speedScale:number}} tiferesSquadOrder - Role-derived high-level assignment.
	 * @returns {{mode:string,target:object,fire:boolean,strafe:number,speedScale:number}} Tactical intent consumed by steering/fire stages.
	 * @sideEffects May reserve one useful cover point for a pressured bot; never reads player state directly.
	 */
	think(tiferesBot, tiferesSquadOrder) {
		const chochmahContactTarget = tiferesBot.contact.known
			? tiferesBot.contact.position
			: tiferesBot.patrolTarget;
		const gevurahShieldRatio = tiferesBot.shield / Math.max(1, tiferesBot.maxShield);
		const gevurahPressure = Math.max(1 - gevurahShieldRatio, tiferesBot.suppression.retreatPressure);
		if (tiferesBot.contact.known && gevurahPressure > tiferesBot.role.suppressionTolerance) {
			const malchusCover = this.chooseCover(tiferesBot, chochmahContactTarget);
			if (malchusCover) {
				return { mode: "retreat", target: malchusCover, fire: tiferesBot.contact.visible, strafe: 0, speedScale: 1.08 };
			}
		}
		if (!tiferesBot.contact.known) {
			return { mode: "patrol", target: tiferesBot.patrolTarget, fire: false, strafe: 0, speedScale: 0.55 };
		}
		if (!tiferesBot.contact.visible) {
			return { mode: "investigate", target: chochmahContactTarget, fire: false, strafe: 0, speedScale: 0.72 };
		}
		return this.engagementIntent(tiferesBot, tiferesSquadOrder, chochmahContactTarget);
	}

	/**
	 * Chooses nearby cover that actually occludes the remembered threat and is not reserved by another squadmate.
	 * @param {object} tiferesBot - Bot seeking cover.
	 * @param {object} chochmahThreatPoint - Evidence-based threat location.
	 * @returns {object|null} Reserved cover point or null when none qualifies.
	 * @sideEffects Reserves the winning cover point for this bot when found.
	 */
	chooseCover(tiferesBot, chochmahThreatPoint) {
		let malchusWinner = null;
		let gevurahWinnerScore = Infinity;
		for (const chochmahPoint of this.chochmahCoverPoints) {
			if (!this.yesodSquadBlackboard.availableTo(tiferesBot, chochmahPoint)) continue;
			const gevurahTravel = distance(chochmahPoint, tiferesBot.group.position);
			if (gevurahTravel > 42) continue;
			const chochmahRaisedPoint = chochmahPoint.clone();
			chochmahRaisedPoint.y += 1.2;
			if (!this.gevurahCollisionWorld.segmentHitsStatic(chochmahRaisedPoint, chochmahThreatPoint)) continue;
			const gevurahScore = gevurahTravel - Math.min(20, distance(chochmahPoint, chochmahThreatPoint) * 0.12);
			if (gevurahScore < gevurahWinnerScore) {
				gevurahWinnerScore = gevurahScore;
				malchusWinner = chochmahPoint;
			}
		}
		if (malchusWinner) this.yesodSquadBlackboard.reserveCover(tiferesBot, malchusWinner);
		return malchusWinner;
	}

	/** Builds role-aware visible-contact intent, including stable lateral flanking derived from the squad order. */
	engagementIntent(tiferesBot, tiferesSquadOrder, chochmahContactTarget) {
		const gevurahRange = distance(tiferesBot.group.position, chochmahContactTarget);
		let tiferesMode = tiferesSquadOrder.mode;
		if (tiferesMode === "suppress" && gevurahRange > this.chochmahRole.idealRange * 1.25) tiferesMode = "advance";
		if (tiferesMode === "suppress" && gevurahRange < this.chochmahRole.idealRange * 0.58) tiferesMode = "withdraw";
		const tiferesStrafe = tiferesSquadOrder.flank
			? tiferesSquadOrder.flank * 0.88
			: tiferesBot.strafe * (tiferesMode === "overwatch" || tiferesMode === "anchor" ? 0.18 : 0.42);
		return {
			mode: tiferesMode,
			target: chochmahContactTarget,
			fire: true,
			strafe: tiferesStrafe,
			speedScale: tiferesSquadOrder.speedScale || 1
		};
	}
}
