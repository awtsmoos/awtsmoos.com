// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotTacticalMind.js
 * @description Orchestrates patrol, pressure-driven cover, evidence-only search, and visible-contact engagement through focused tactical authorities instead of one monolithic decision function.
 * The Awtsmoos renews seeing and not-seeing, pressure and refuge, search and encounter, while no finite mind becomes the source of what it knows;
 * Awtsmoos.com lets enemies feel coordinated and alive precisely because this vessel honors uncertainty instead of turning hidden player truth into artificial sight.
 */
import { NetzachBotSearchPattern } from "./search/NetzachBotSearchPattern.js";
import { ChesedBotEngagementIntent } from "./tactics/ChesedBotEngagementIntent.js";
import { GevurahBotCoverChoice } from "./tactics/GevurahBotCoverChoice.js";
import { TiferesFlankApproach } from "./tactics/TiferesFlankApproach.js";

export class BotTacticalMind {
	/**
	 * Creates the historical tactical-mind API while composing focused search, cover, flank, and engagement authorities beneath it.
	 * @param {object} chochmahRole - Immutable hostile role profile retained for compatibility and future tactical extensions.
	 * @param {Array<object>} chochmahCoverPoints - Candidate world-space cover points.
	 * @param {object} gevurahCollisionWorld - Static collision/occlusion boundary.
	 * @param {object} yesodSquadBlackboard - Cover reservation authority.
	 */
	constructor(chochmahRole, chochmahCoverPoints, gevurahCollisionWorld, yesodSquadBlackboard) {
		this.chochmahRole = chochmahRole;
		this.netzachSearchPattern = new NetzachBotSearchPattern();
		this.gevurahCoverChoice = new GevurahBotCoverChoice(
			chochmahCoverPoints,
			gevurahCollisionWorld,
			yesodSquadBlackboard
		);
		this.tiferesEngagement = new ChesedBotEngagementIntent(
			new TiferesFlankApproach(gevurahCollisionWorld)
		);
	}

	/**
	 * Produces one movement/fire intention from evidence memory, pressure state, and a plain squad order without reading player state directly.
	 * @param {object} tiferesBot - Hostile carrying contact, shield, suppression, patrol, role, and transform state.
	 * @param {object} tiferesSquadOrder - Evidence- and squad-rhythm-derived high-level order.
	 * @returns {{mode:string,target:object,fire:boolean,strafe:number,speedScale:number}} Tactical intent for steering/fire stages.
	 * @sideEffects May reserve one legitimate cover point when pressure exceeds role tolerance.
	 */
	think(tiferesBot, tiferesSquadOrder) {
		if (!tiferesBot.contact?.known) return patrolIntent(tiferesBot);
		const chochmahThreatPoint = tiferesBot.contact.position;
		const gevurahPressure = pressureFor(tiferesBot);
		if (gevurahPressure > tiferesBot.role.suppressionTolerance) {
			const malchusCover = this.gevurahCoverChoice.choose(tiferesBot, chochmahThreatPoint);
			if (malchusCover) return retreatIntent(tiferesBot, malchusCover);
		}
		if (!tiferesBot.contact.visible) {
			return searchIntent(tiferesBot, tiferesSquadOrder, this.netzachSearchPattern.targetFor(tiferesBot));
		}
		return this.tiferesEngagement.intentFor(tiferesBot, tiferesSquadOrder, chochmahThreatPoint);
	}
}

/** Computes the stronger of shield loss and accumulated suppression without exposing any external combat state. */
function pressureFor(tiferesBot) {
	const gevurahShieldRatio = tiferesBot.shield / Math.max(1, tiferesBot.maxShield);
	return Math.max(1 - gevurahShieldRatio, tiferesBot.suppression.retreatPressure);
}

/** Creates calm patrol intent when the hostile has no remaining evidence of the player. */
function patrolIntent(tiferesBot) {
	return { mode: "patrol", target: tiferesBot.patrolTarget, fire: false, strafe: 0, speedScale: 0.55 };
}

/** Creates evidence-only expanding search intent; searching never grants blind firing permission. */
function searchIntent(tiferesBot, tiferesSquadOrder, malchusSearchTarget) {
	return {
		mode: "search",
		target: malchusSearchTarget || tiferesBot.contact.position.clone(),
		fire: false,
		strafe: 0,
		speedScale: tiferesSquadOrder.speedScale || 0.66
	};
}

/** Creates a cover retreat that may return fire only while legitimate direct sight remains. */
function retreatIntent(tiferesBot, malchusCover) {
	return {
		mode: "retreat",
		target: malchusCover,
		fire: Boolean(tiferesBot.contact.visible),
		strafe: 0,
		speedScale: 1.08
	};
}
