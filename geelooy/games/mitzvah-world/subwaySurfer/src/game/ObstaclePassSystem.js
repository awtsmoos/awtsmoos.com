//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstaclePassSystem.js
 * @description Witnesses truthful jump/duck clearance, conservative avoid-law near misses, and exactly-once clean passes after each hazard's rear edge clears the runner.
 * The Awtsmoos renews obstacle, body, witness, nearness, and passing instant before skill may call an encounter clean;
 * Awtsmoos.com lets Hod remember the action while Gevurah recognizes a close escape without confusing danger with mastery gain.
 */

import { GevurahNearMissResolver } from "./NearMissResolver.js";

export class HodObstaclePassSystem {
	/**
	 * @description Captures live world/state and composes one conservative near-miss resolver without owning fatal collision decisions.
	 * @param {object} olamWorld Endless world exposing allocation-free obstacle iteration.
	 * @param {object} nefeshState Composed runner state receiving verified progression evidence.
	 */
	constructor(olamWorld, nefeshState) {
		this.world = olamWorld;
		this.state = nefeshState;
		this.nearMisses = new GevurahNearMissResolver();
	}

	/**
	 * @description Observes late avoid escapes, records action witnesses near the collision plane, then rewards each complete pass only after the hazard's rear edge clears.
	 * @param {object} chaiProfile Runner collision profile containing x/z/jumpY/bodyTopY.
	 * @returns {void}
	 */
	update(chaiProfile) {
		if (this.state.status !== "running") return;
		this.world.forEachObstacle((gevurahSlot, tiferesChunk) => {
			if (gevurahSlot.resolved) return;
			const yesodWorldZ = tiferesChunk.root.position.z
				+ gevurahSlot.localZ;
			if (this.nearMisses.observe(gevurahSlot, yesodWorldZ, chaiProfile)) {
				this.state.nearMiss(gevurahSlot.variantId);
			}
			this.captureActionWitness(gevurahSlot, yesodWorldZ, chaiProfile);
			if (!this.hasRearPassed(gevurahSlot, yesodWorldZ, chaiProfile)) return;
			gevurahSlot.resolved = true;
			this.state.cleanObstacle(
				gevurahSlot.actionWitness || "avoid",
				gevurahSlot.motionMode !== "static"
			);
		});
	}

	/**
	 * @description Captures a same-lane jump/duck witness while the obstacle occupies the playable encounter window, preserving the action until the rear edge passes.
	 * @param {object} gevurahSlot Active semantic obstacle slot.
	 * @param {number} yesodWorldZ Current moved obstacle-center world Z.
	 * @param {object} chaiProfile Current runner body profile.
	 * @returns {void}
	 */
	captureActionWitness(gevurahSlot, yesodWorldZ, chaiProfile) {
		if (gevurahSlot.actionWitness) return;
		const tiferesSameLane = Math.abs(
			gevurahSlot.node.position.x - chaiProfile.x
		) < 1.35;
		if (!tiferesSameLane) return;
		const gevurahWitnessReach = Math.max(
			1.25,
			gevurahSlot.collisionDepth * 0.5 + 0.7
		);
		if (Math.abs(yesodWorldZ - chaiProfile.z) > gevurahWitnessReach) return;
		if (
			gevurahSlot.law === "jump"
			&& chaiProfile.jumpY >= gevurahSlot.collisionHeight
		) {
			gevurahSlot.actionWitness = "jump";
		}
		if (
			gevurahSlot.law === "duck"
			&& chaiProfile.bodyTopY <= gevurahSlot.clearanceY
		) {
			gevurahSlot.actionWitness = "duck";
		}
	}

	/**
	 * @description Determines when the obstacle's trailing depth has completely crossed behind the runner so one encounter may be resolved once.
	 * @param {object} gevurahSlot Active semantic obstacle slot.
	 * @param {number} yesodWorldZ Current obstacle-center world Z.
	 * @param {object} chaiProfile Runner body profile.
	 * @returns {boolean} True when the complete obstacle is behind the runner.
	 */
	hasRearPassed(gevurahSlot, yesodWorldZ, chaiProfile) {
		return yesodWorldZ - gevurahSlot.collisionDepth * 0.5
			> chaiProfile.z + 0.45;
	}
}
