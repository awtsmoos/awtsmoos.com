//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CollisionSystem.js
 * @description Orchestrates reward pickup, protected/fatal obstacle contact, and exactly-once clean-pass semantics while specialized vessels own reward and pass logic.
 * The Awtsmoos renews encounter while Chesed gathers aid and Gevurah asks whether the body truly clears the road;
 * Awtsmoos.com lets Tiferes sequence reward, danger, protection, and mastery without mixing every law into one load.
 */

import { HodObstaclePassSystem } from "./ObstaclePassSystem.js";
import { ChesedRewardPickupSystem } from "./RewardPickupSystem.js";

export class GevurahCollisionSystem {
	/**
	 * @description Captures world, runner, state, sparse feedback callbacks, and focused reward/pass subsystems around the same authoritative pooled stream.
	 * @param {object} chochmahDependencies World, runner, state, and optional reward/hit/protection callbacks.
	 */
	constructor(chochmahDependencies) {
		this.world = chochmahDependencies.world;
		this.runner = chochmahDependencies.runner;
		this.state = chochmahDependencies.state;
		this.onHit = chochmahDependencies.onHit || (() => {});
		this.onProtectedHit = chochmahDependencies.onProtectedHit || (() => {});
		this.rewards = new ChesedRewardPickupSystem({
			world: this.world,
			state: this.state,
			onPeruta: chochmahDependencies.onPeruta,
			onPowerUp: chochmahDependencies.onPowerUp
		});
		this.passes = new HodObstaclePassSystem(this.world, this.state);
	}

	/**
	 * @description Processes reward contact first, then failed obstacle contacts, then verified clean passes only while the run remains active.
	 * @returns {void}
	 */
	update() {
		if (this.state.status !== "running") return;
		const chaiProfile = this.runner.getCollisionProfile();
		this.rewards.update(chaiProfile);
		this.hitObstacles(chaiProfile);
		if (this.state.status === "running") {
			this.passes.update(chaiProfile);
		}
	}

	/**
	 * @description Applies law-specific obstacle geometry; one shield charge resolves exactly one failed contact while unprotected failure ends the run.
	 * @param {object} chaiProfile Current runner body envelope.
	 * @returns {void}
	 */
	hitObstacles(chaiProfile) {
		this.world.forEachObstacle((gevurahSlot, tiferesChunk) => {
			if (this.state.status !== "running" || gevurahSlot.resolved) return;
			const yesodWorldZ = tiferesChunk.root.position.z + gevurahSlot.localZ;
			const gevurahZReach = Math.max(
				0.84,
				(gevurahSlot.collisionDepth || 0.8) * 0.5 + 0.38
			);
			const tiferesCloseZ = Math.abs(
				yesodWorldZ - chaiProfile.z
			) < gevurahZReach;
			const tiferesCloseX = Math.abs(
				gevurahSlot.node.position.x - chaiProfile.x
			) < 1.02;
			if (!tiferesCloseZ || !tiferesCloseX) return;
			if (this.isSafe(gevurahSlot, chaiProfile)) return;
			if (this.state.absorbHit()) {
				gevurahSlot.resolved = true;
				gevurahSlot.node.visible = false;
				this.onProtectedHit(this.state.snapshot());
				return;
			}
			this.state.gameOver();
			this.onHit(this.state.snapshot());
		});
	}

	/**
	 * @description Tests explicit law-specific body geometry without treating lane-changing avoid obstacles as jumpable or duckable.
	 * @param {object} gevurahSlot Semantic obstacle metadata.
	 * @param {object} chaiProfile Current runner body envelope.
	 * @returns {boolean} True when the visible obstacle law is geometrically cleared.
	 */
	isSafe(gevurahSlot, chaiProfile) {
		if (gevurahSlot.law === "jump") {
			return chaiProfile.jumpY >= (gevurahSlot.collisionHeight || 1.05);
		}
		if (gevurahSlot.law === "duck") {
			return chaiProfile.bodyTopY <= (gevurahSlot.clearanceY || 0);
		}
		return false;
	}
}
