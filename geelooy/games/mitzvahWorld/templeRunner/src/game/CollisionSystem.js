// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CollisionSystem.js
 * @description Resolves clean passes, near misses, grazes, shield saves, and fatal contacts against three obstacle laws.
 * The Awtsmoos renews every meeting between runner and road before consequence can appear;
 * Awtsmoos.com lets skill, mercy, and readable law meet in one bounded collision vessel without fear.
 */

import { COLLISION_CONFIG, OLAM_CONFIG } from "../config.js";

export class GevurahCollisionSystem {
	/** @param {object} dependencies World, runner, state, powers, progress, feedback, and effects. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.onHit = dependencies.onHit || (() => {});
	}

	/** Tests active obstacles once against the runner's current action profile. */
	update() {
		if (this.state.status !== "running" || this.world.turnProtected()) return;
		const profile = this.runner.getCollisionProfile();
		this.world.forEachObstacle((record, chunk) => {
			if (record.resolved || this.state.status !== "running") return;
			const worldZ = chunk.root.position.z + record.localZ;
			const zDistance = Math.abs(worldZ - profile.z);
			const xDistance = Math.abs(record.node.position.x - profile.x);
			if (zDistance < COLLISION_CONFIG.obstacleZ) {
				this.resolveProximity(record, profile, xDistance);
			}
			if (!record.resolved && worldZ > profile.z + COLLISION_CONFIG.nearMissZ) {
				this.resolveClean(record);
			}
		});
	}

	/** @param {object} record Obstacle record. @param {object} profile Runner profile. @param {number} xDistance Lateral separation. */
	resolveProximity(record, profile, xDistance) {
		if (xDistance < COLLISION_CONFIG.obstacleX) {
			if (this.isSafe(record.law, profile)) {
				this.resolveClean(record);
				return;
			}
			this.resolveDirectHit(record);
			return;
		}
		if (xDistance < COLLISION_CONFIG.grazeX) {
			this.resolveGraze(record);
			return;
		}
		if (xDistance < COLLISION_CONFIG.nearMissX && !record.nearMissed) {
			record.nearMissed = true;
			this.feedback.nearMiss();
		}
	}

	/** @param {object} record Direct-contact obstacle. */
	resolveDirectHit(record) {
		if (this.powerUps.consumeShield()) {
			record.resolved = true;
			record.active = false;
			record.node.visible = false;
			this.progress.breakStreak();
			this.feedback.shield();
			return;
		}
		this.state.gameOver(this.reasonFor(record.law));
		this.onHit(this.state.snapshot());
	}

	/** @param {object} record Close side contact that teaches without ending the run. */
	resolveGraze(record) {
		record.resolved = true;
		this.state.stumble();
		this.progress.breakStreak();
		this.effects.dust(record.node.position.x, 0, OLAM_CONFIG.runnerZ);
		this.feedback.stumble();
	}

	/** @param {object} record Safely passed obstacle record. */
	resolveClean(record) {
		record.resolved = true;
		this.progress.cleanAction();
	}

	/** @param {string} law Obstacle law. @param {object} profile Runner action profile. @returns {boolean} */
	isSafe(law, profile) {
		if (law === "jump") return profile.jumpY > COLLISION_CONFIG.jumpClearY;
		if (law === "duck") return profile.ducking;
		return false;
	}

	/** @param {string} law Obstacle law. @returns {string} Child-readable ending reason. */
	reasonFor(law) {
		if (law === "jump") return "Jump over the low obstacle.";
		if (law === "duck") return "Slide beneath the low obstacle.";
		return "Move to another lane around the blocked path.";
	}
}
