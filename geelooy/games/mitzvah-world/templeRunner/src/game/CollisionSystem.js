//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CollisionSystem.js
 * @description Resolves clean passes, mission-aware near misses, grazes, shield saves, and fatal contacts against three obstacle laws.
 * The Awtsmoos renews every meeting between runner and road before consequence can appear;
 * Awtsmoos.com lets bravery become both mastery and Hod progress without confusing a close escape with a touch or fear.
 */

import { COLLISION_CONFIG, OLAM_CONFIG } from "../config.js";

export class GevurahCollisionSystem {
	/** @description Binds world, runner, state, powers, progress, missions, feedback, effects, and optional hit callback. @param {object} dependencies Collision runtime collaborators. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.onHit = dependencies.onHit || (() => {});
	}

	/** @description Tests active obstacles once against the runner's current action profile. @returns {void} */
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

	/** @description Resolves direct contact, graze, or one-time near-miss mastery by lateral distance. @param {object} record Obstacle record. @param {object} profile Runner action profile. @param {number} xDistance Lateral separation. @returns {void} */
	resolveProximity(record, profile, xDistance) {
		if (xDistance < COLLISION_CONFIG.obstacleX) {
			if (this.isSafe(record.law, profile)) this.resolveClean(record);
			else this.resolveDirectHit(record);
			return;
		}
		if (xDistance < COLLISION_CONFIG.grazeX) {
			this.resolveGraze(record);
			return;
		}
		if (xDistance < COLLISION_CONFIG.nearMissX && !record.nearMissed) {
			record.nearMissed = true;
			this.progress.nearMiss();
			this.missions?.record?.("nearMisses", 1);
			this.feedback.nearMiss();
		}
	}

	/** @param {object} record Direct-contact obstacle. @returns {void} */
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

	/** @param {object} record Close side contact that teaches without ending the run. @returns {void} */
	resolveGraze(record) {
		record.resolved = true;
		this.state.stumble();
		this.progress.breakStreak();
		this.effects.dust(record.node.position.x, 0, OLAM_CONFIG.runnerZ);
		this.feedback.stumble();
	}

	/** @param {object} record Safely passed obstacle record. @returns {void} */
	resolveClean(record) {
		record.resolved = true;
		this.progress.cleanAction();
	}

	/** @param {string} law Obstacle law. @param {object} profile Runner action profile. @returns {boolean} Whether the current action clears the law. */
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
