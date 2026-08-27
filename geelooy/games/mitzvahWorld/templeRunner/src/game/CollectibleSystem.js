// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CollectibleSystem.js
 * @description Animates action-aware perutas and feeds reward, missions, lifetime memory, glints, and sound directly.
 * The Awtsmoos renews each humble peruta as both reward and golden teaching sign;
 * Awtsmoos.com lets magnet respect the lesson, so jump and slide trails remain honest in every line.
 */

import { COLLISION_CONFIG } from "../config.js";

export class MamonCollectibleSystem {
	/** @param {object} dependencies World, runner, progress, powers, feedback, effects, missions, and lifetime stats. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @param {number} delta Frame seconds. @param {number} visualTime Visual clock. */
	update(delta, visualTime) {
		void delta;
		const profile = this.runner.getCollisionProfile();
		this.world.forEachCollectible((record, chunk) => {
			if (record.collected) return;
			this.animate(record, visualTime);
			const worldZ = chunk.root.position.z + record.localZ;
			if (this.isCollected(record, worldZ, profile)) {
				this.collect(record, worldZ);
				return;
			}
			if (!record.missed && worldZ > profile.z + 1.35) {
				record.missed = true;
				this.progress.breakStreak();
			}
		});
	}

	/** @param {object} record Peruta record. @param {number} visualTime Visual clock. */
	animate(record, visualTime) {
		const yaw = visualTime * 3.4 + record.phase;
		record.node.quaternion.set(
			0,
			Math.sin(yaw / 2),
			0,
			Math.cos(yaw / 2)
		);
		record.node.position.y = record.baseY
			+ Math.sin(visualTime * 4.1 + record.phase) * 0.08;
	}

	/**
	 * Tests ordinary or magnet collection while preserving gesture-teaching perutas.
	 * @param {object} record Peruta record.
	 * @param {number} worldZ Peruta world Z.
	 * @param {object} profile Runner collision profile.
	 * @returns {boolean} Whether the peruta is collected this frame.
	 */
	isCollected(record, worldZ, profile) {
		if (!this.actionSatisfied(record.requiredAction, profile)) return false;
		const distanceZ = Math.abs(worldZ - profile.z);
		const distanceX = Math.abs(record.node.position.x - profile.x);
		if (this.powerUps.magnetActive && record.requiredAction === "normal") {
			return distanceZ < COLLISION_CONFIG.magnetZ
				&& distanceX < COLLISION_CONFIG.magnetX;
		}
		const targetY = profile.jumpY + (profile.ducking ? 0.5 : 0.95);
		const verticalClose = Math.abs(record.node.position.y - targetY) < 1.05;
		return distanceZ < COLLISION_CONFIG.collectZ
			&& distanceX < COLLISION_CONFIG.collectX
			&& verticalClose;
	}

	/** @param {string} action Required trail action. @param {object} profile Runner profile. @returns {boolean} */
	actionSatisfied(action, profile) {
		if (action === "jump") {
			return profile.jumpY > COLLISION_CONFIG.jumpClearY * 0.55;
		}
		if (action === "duck") return profile.ducking;
		return true;
	}

	/** @param {object} record Peruta record. @param {number} worldZ Pickup world Z. */
	collect(record, worldZ) {
		record.collected = true;
		record.active = false;
		this.effects.glint(
			record.node.position.x,
			record.node.position.y,
			worldZ
		);
		record.node.visible = false;
		this.progress.collectPeruta(
			record.value || 1,
			this.powerUps.doubleActive
		);
		this.lifetime.addPerutas(1);
		this.missions.record("perutas", 1);
		this.feedback.peruta();
	}
}
