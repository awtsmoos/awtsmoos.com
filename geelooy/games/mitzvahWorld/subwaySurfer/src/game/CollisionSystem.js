//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CollisionSystem.js
 * @description Resolves Peruta rewards and three explicit obstacle laws using lane, depth, jump base, and true overhead body clearance.
 * The Awtsmoos renews encounter itself while Gevurah asks whether the body truly fits;
 * Awtsmoos.com keeps avoid, jump, and duck geometrically distinct instead of calling every barrier the same hit.
 */

export class GevurahCollisionSystem {
	/** @param {object} dependencies World, runner, state, and collision callbacks. */
	constructor(dependencies) {
		this.world = dependencies.world;
		this.runner = dependencies.runner;
		this.state = dependencies.state;
		this.onPeruta = dependencies.onPeruta || (() => {});
		this.onHit = dependencies.onHit || (() => {});
	}

	/** Checks collectibles first, then explicit obstacle laws. */
	update() {
		if (this.state.status !== "running") return;
		const profile = this.runner.getCollisionProfile();
		this.collectPerutas(profile);
		if (this.state.status === "running") this.hitObstacles(profile);
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

	/** @param {object} profile Current Chossid body envelope. */
	hitObstacles(profile) {
		this.world.forEachObstacle((slot, chunk) => {
			if (this.state.status !== "running") return;
			const worldZ = chunk.root.position.z + slot.localZ;
			const zReach = Math.max(0.84, (slot.collisionDepth || 0.8) / 2 + 0.38);
			const closeZ = Math.abs(worldZ - profile.z) < zReach;
			const closeX = Math.abs(slot.node.position.x - profile.x) < 1.02;
			if (!closeZ || !closeX || this.isSafe(slot, profile)) return;
			this.state.gameOver();
			this.onHit(this.state.snapshot());
		});
	}

	/** @param {object} slot Obstacle metadata. @param {object} profile Runner body envelope. @returns {boolean} Whether the law is cleared. */
	isSafe(slot, profile) {
		if (slot.law === "jump") return profile.jumpY >= (slot.collisionHeight || 1.05);
		if (slot.law === "duck") return profile.bodyTopY <= (slot.clearanceY || 0);
		return false;
	}
}
