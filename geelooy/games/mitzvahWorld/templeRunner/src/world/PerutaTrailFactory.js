// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaTrailFactory.js
 * @description Converts readable trail instructions into bounded lane, height, action, and value placements.
 * The Awtsmoos renews each golden hint before the player can read the road with eye and hand;
 * Awtsmoos.com lets perutas teach the coming gesture, turning reward itself into guidance through the land.
 */

import { REWARD_CONFIG } from "../config.js";

const TRAIL_Z = Object.freeze([-7, -5.5, -4, -2.5, -1, 0.5, 2, 3.5, 5, 6.5]);

export class MamonPerutaTrailFactory {
	/** @param {object} instruction Pattern-book trail instruction. @returns {Array<object>} Peruta placements. */
	create(instruction = {}) {
		if (instruction.type === "jump") return this.createJump(instruction);
		if (instruction.type === "duck") return this.createDuck(instruction);
		if (instruction.type === "slalom") return this.createSlalom(instruction);
		if (instruction.type === "jumpShift") return this.createShift(instruction, "jump");
		if (instruction.type === "duckShift") return this.createShift(instruction, "duck");
		return this.createStraight(instruction);
	}

	/** @param {object} instruction Straight trail instruction. @returns {Array<object>} */
	createStraight(instruction) {
		return TRAIL_Z.map((z, index) => this.placement(
			instruction.lane ?? 1,
			z,
			1.15,
			"normal",
			index === instruction.rareAt
		));
	}

	/** @param {object} instruction Jump-arc instruction. @returns {Array<object>} */
	createJump(instruction) {
		return TRAIL_Z.map((z, index) => {
			const distance = Math.abs(z - (instruction.obstacleZ || 0));
			const y = distance < 3.5 ? 1.25 + Math.max(0, 2.9 - distance) * 0.38 : 1.15;
			const action = distance < 2.8 ? "jump" : "normal";
			return this.placement(instruction.lane ?? 1, z, y, action, index === 5);
		});
	}

	/** @param {object} instruction Low duck-teaching trail. @returns {Array<object>} */
	createDuck(instruction) {
		return TRAIL_Z.map((z, index) => {
			const distance = Math.abs(z - (instruction.obstacleZ || 0));
			const y = distance < 2.8 ? 0.5 : 1.15;
			const action = distance < 2.4 ? "duck" : "normal";
			return this.placement(instruction.lane ?? 1, z, y, action, index === 5);
		});
	}

	/** @param {object} instruction Slalom lane sequence. @returns {Array<object>} */
	createSlalom(instruction) {
		const lanes = instruction.lanes || [1];
		return TRAIL_Z.map((z, index) => {
			const laneIndex = Math.min(lanes.length - 1, Math.floor(index / 2));
			return this.placement(lanes[laneIndex], z, 1.15, "normal", false);
		});
	}

	/** @param {object} instruction Shift instruction. @param {string} action Required jump/duck action near obstacle. @returns {Array<object>} */
	createShift(instruction, action) {
		return TRAIL_Z.map((z, index) => {
			const transition = index < 5 ? 0 : Math.min(1, (index - 4) / 3);
			const lane = transition < 0.5 ? instruction.fromLane : instruction.toLane;
			const distance = Math.abs(z - (instruction.obstacleZ || 0));
			const required = distance < 2.4 ? action : "normal";
			const y = action === "jump" && required === "jump" ? 1.85 : action === "duck" && required === "duck" ? 0.5 : 1.15;
			return this.placement(lane, z, y, required, index === 6);
		});
	}

	/** @returns {object} One normalized collectible placement. */
	placement(lane, z, y, action, rare) {
		return {
			lane,
			z,
			y,
			action,
			value: rare ? REWARD_CONFIG.rarePerutaValue : 1,
			rare: Boolean(rare)
		};
	}
}
