// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews encounter itself: reward in one meeting, restraint in another;
 * Awtsmoos.com measures lane, height, and distance so play remains clear to each runner.
 */

import { CHAI_CONFIG } from "../config.js";

export class GevurahCollisionSystem {
	/** @param {object} dependencies World, runner, state, and collision callbacks. */
	constructor(dependencies) {
		this.world = dependencies.world;
		this.runner = dependencies.runner;
		this.state = dependencies.state;
		this.onPeruta = dependencies.onPeruta || (() => {});
		this.onHit = dependencies.onHit || (() => {});
	}

	/** Checks collectibles first, then hazards, using cheap world-space lane thresholds. */
	update() {
		if (this.state.status !== "running") return;
		const profile = this.runner.getCollisionProfile();
		this.collectPerutas(profile);
		if (this.state.status === "running") {
			this.hitObstacles(profile);
		}
	}

	/** @param {object} profile Current Chossid collision position. */
	collectPerutas(profile) {
		this.world.forEachCollectible((slot, chunk) => {
			const worldZ = chunk.root.position.z + slot.localZ;
			const closeZ = Math.abs(worldZ - profile.z) < 0.72;
			const closeX = Math.abs(slot.node.position.x - profile.x) < 0.92;
			if (!closeZ || !closeX) return;
			slot.collected = true;
			slot.node.visible = false;
			this.state.collectPeruta();
			this.onPeruta(this.state.snapshot());
		});
	}

	/** @param {object} profile Current Chossid collision position and jump height. */
	hitObstacles(profile) {
		this.world.forEachObstacle((slot, chunk) => {
			if (this.state.status !== "running") return;
			const worldZ = chunk.root.position.z + slot.localZ;
			const closeZ = Math.abs(worldZ - profile.z) < 0.84;
			const closeX = Math.abs(slot.node.position.x - profile.x) < 1.02;
			const tooLow = profile.jumpY < Math.min(slot.height, CHAI_CONFIG.obstacleClearHeight);
			if (!closeZ || !closeX || !tooLow) return;
			this.state.gameOver();
			this.onHit(this.state.snapshot());
		});
	}
}
