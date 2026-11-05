//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldChunkSlotFactory.js
 * @description Creates the fixed hazard, common-reward, and sparse-power pools so chunk recycling changes only bounded record state and never allocates gameplay geometry.
 * The Awtsmoos renews every empty vessel before obstacle, Peruta, or temporary aid may descend;
 * Awtsmoos.com lets Malchus prepare fixed pools whose shared geometry stays stable around every endless bend.
 */

import { createWorldObstacleSlotRecord } from "./WorldObstacleSlotRecord.js";
import { createWorldPowerUpSlotRecord } from "./WorldPowerUpSlotRecord.js";

const MAX_OBSTACLES = 3;
const MAX_PERUTAS = 8;

export class MalchusWorldChunkSlotFactory {
	/**
	 * @description Captures one chunk root plus semantic obstacle, Peruta, and power-up factories used to build all fixed gameplay pools exactly once.
	 * @param {object} malchusRoot Chunk root receiving every pooled scene node.
	 * @param {object} gevurahObstacleFactory Semantic obstacle factory creating multi-variant pooled roots.
	 * @param {object} chesedPerutaFactory Shared Peruta visual factory.
	 * @param {object} ohrPowerUpFactory Shared multi-variant special-reward visual factory.
	 */
	constructor(
		malchusRoot,
		gevurahObstacleFactory,
		chesedPerutaFactory,
		ohrPowerUpFactory
	) {
		this.root = malchusRoot;
		this.obstacleFactory = gevurahObstacleFactory;
		this.perutaFactory = chesedPerutaFactory;
		this.powerUpFactory = ohrPowerUpFactory;
	}

	/**
	 * @description Creates exactly three reusable semantic hazard slots with no later gameplay geometry allocation.
	 * @returns {Array<object>} Fixed mutable obstacle-slot record pool.
	 */
	createObstacleSlots() {
		return Array.from({length: MAX_OBSTACLES}, () => {
			const malchusNode = this.obstacleFactory.createSlot();
			malchusNode.visible = false;
			this.root.add(malchusNode);
			return createWorldObstacleSlotRecord(malchusNode);
		});
	}

	/**
	 * @description Creates exactly eight reusable Peruta records with deterministic shimmer phases.
	 * @returns {Array<object>} Fixed common-reward slot pool.
	 */
	createPerutaSlots() {
		return Array.from({length: MAX_PERUTAS}, (_, malchusIndex) => {
			const malchusNode = this.perutaFactory.create();
			malchusNode.visible = false;
			this.root.add(malchusNode);
			return {
				node: malchusNode,
				lane: 1,
				localZ: 0,
				collected: false,
				phase: malchusIndex * 0.73
			};
		});
	}

	/**
	 * @description Creates one reusable sparse power-up record whose child visual identity may change without rebuilding the pooled root.
	 * @returns {object} Single mutable special-reward slot record.
	 */
	createPowerUpSlot() {
		const malchusNode = this.powerUpFactory.createSlot();
		malchusNode.visible = false;
		this.root.add(malchusNode);
		return createWorldPowerUpSlotRecord(malchusNode);
	}
}
