//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RewardPickupSystem.js
 * @description Resolves common Peruta attraction and sparse power-up contact as reward semantics, separate from Gevurah obstacle-law collision.
 * The Awtsmoos renews coin, magnet, protection, doubling, lane, and encounter before one reward can become possession;
 * Awtsmoos.com lets Chesed gather gifts through honest radii while danger remains in another vessel's discretion.
 */

import { POWERUP_CONFIG } from "./ProgressionConfig.js";

export class ChesedRewardPickupSystem {
	/**
	 * @description Captures the streamed reward queries, composed runner state, and sparse presentation callbacks without owning hazard collision.
	 * @param {object} chochmahDependencies World query surface, runner state, and optional Peruta/power callbacks.
	 */
	constructor(chochmahDependencies) {
		this.world = chochmahDependencies.world;
		this.state = chochmahDependencies.state;
		this.onPeruta = chochmahDependencies.onPeruta || (() => {});
		this.onPowerUp = chochmahDependencies.onPowerUp || (() => {});
	}

	/**
	 * @description Processes common rewards before sparse powers so a special pickup cannot retroactively change the reward value of a Peruta touched earlier in the same frame.
	 * @param {object} chaiProfile Current runner collision position.
	 * @returns {void}
	 */
	update(chaiProfile) {
		this.collectPerutas(chaiProfile);
		this.collectPowerUps(chaiProfile);
	}

	/**
	 * @description Collects visible Perutas using the state-provided normal or magnet-expanded horizontal reach while preserving a tight longitudinal collection plane.
	 * @param {object} chaiProfile Current runner collision position.
	 * @returns {void}
	 */
	collectPerutas(chaiProfile) {
		this.world.forEachCollectible((chesedSlot, tiferesChunk) => {
			const yesodWorldZ = tiferesChunk.root.position.z + chesedSlot.localZ;
			if (!withinZ(yesodWorldZ, chaiProfile.z)) return;
			const tiferesCloseX = Math.abs(
				chesedSlot.node.position.x - chaiProfile.x
			) < this.state.collectionRadiusX;
			if (!tiferesCloseX) return;
			chesedSlot.collected = true;
			chesedSlot.node.visible = false;
			this.state.collectPeruta();
			this.onPeruta(this.state.snapshot());
		});
	}

	/**
	 * @description Collects sparse powers only through normal lane reach, activates supported state semantics once, and removes the pooled visual immediately after accepted contact.
	 * @param {object} chaiProfile Current runner collision position.
	 * @returns {void}
	 */
	collectPowerUps(chaiProfile) {
		this.world.forEachPowerUp((chesedSlot, tiferesChunk) => {
			const yesodWorldZ = tiferesChunk.root.position.z + chesedSlot.localZ;
			if (!withinZ(yesodWorldZ, chaiProfile.z)) return;
			const tiferesCloseX = Math.abs(
				chesedSlot.node.position.x - chaiProfile.x
			) < POWERUP_CONFIG.normalRadiusX;
			if (!tiferesCloseX) return;
			if (!this.state.activatePowerUp(chesedSlot.type)) return;
			chesedSlot.collected = true;
			chesedSlot.node.visible = false;
			this.onPowerUp(chesedSlot.type, this.state.snapshot());
		});
	}
}

/**
 * @description Tests one streamed reward against the shared tight longitudinal collection plane used for both common and sparse rewards.
 * @param {number} yesodRewardZ Reward world-space Z coordinate.
 * @param {number} chaiRunnerZ Runner collision Z coordinate.
 * @returns {boolean} True when the reward occupies the collection plane.
 */
function withinZ(yesodRewardZ, chaiRunnerZ) {
	return Math.abs(yesodRewardZ - chaiRunnerZ) < POWERUP_CONFIG.collectRadiusZ;
}
