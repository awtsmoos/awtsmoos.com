//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpSystem.js
 * @description Animates and collects bounded procedural power-ups through canonical power, mission, feedback, and effect vessels.
 * The Awtsmoos renews each brief gift before pouch, protection, or doubling can shine;
 * Awtsmoos.com lets temporary Chesed become a visible run goal while skill still governs every line.
 */

export class ChesedPowerUpSystem {
	/** @param {object} dependencies World, runner, power state, missions, feedback, and pooled effects. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @param {number} delta Frame seconds. @param {number} visualTime Visual clock. @returns {void} */
	update(delta, visualTime) {
		void delta;
		const profile = this.runner.getCollisionProfile();
		this.world.forEachPowerUp((record, chunk) => {
			if (record.collected) return;
			this.animate(record, visualTime);
			const worldZ = chunk.root.position.z + record.localZ;
			const closeX = Math.abs(record.node.position.x - profile.x) < 1;
			const closeZ = Math.abs(worldZ - profile.z) < 1;
			if (closeX && closeZ) this.collect(record, worldZ);
		});
	}

	/** @param {object} record Active power-up record. @param {number} visualTime Visual clock. @returns {void} */
	animate(record, visualTime) {
		const yaw = visualTime * 2.4 + record.phase;
		record.node.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
		record.node.position.y = record.baseY
			+ Math.sin(visualTime * 3.2 + record.phase) * 0.1;
	}

	/** @description Collects one temporary gift exactly once and records its semantic mission event without changing power behavior. @param {object} record Active power-up record. @param {number} worldZ Pickup world Z. @returns {void} */
	collect(record, worldZ) {
		record.collected = true;
		record.active = false;
		this.effects.glint(record.node.position.x, record.node.position.y, worldZ);
		record.node.visible = false;
		this.powerUps.activate(record.kind);
		this.missions?.record?.("powerUps", 1);
		this.feedback.powerUp(record.kind);
	}
}
