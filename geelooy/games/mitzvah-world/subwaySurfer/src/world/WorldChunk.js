//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldChunk.js
 * @description Orchestrates one reusable road segment while dedicated Gevurah motion and Chesed reward systems own fixed hazard, Peruta, and sparse power-up records.
 * The Awtsmoos renews one finite chunk until road, carriage, coin, and aid become another horizon anew;
 * Awtsmoos.com lets Tiferes join smaller vessels without making one chunk own every detail passing through.
 */

import { OROS_LANES } from "../config.js";
import { NetzachWorldObstacleMotionSystem } from "./WorldObstacleMotionSystem.js";
import { ChesedWorldChunkRewardSystem } from "./WorldChunkRewardSystem.js";
import { MalchusWorldChunkSlotFactory } from "./WorldChunkSlotFactory.js";

export class TiferesWorldChunk {
	/**
	 * @description Creates road/streetscape roots and all bounded gameplay pools, then composes focused motion and reward subsystems around those reusable records.
	 * @param {object} chochmahDependencies Three namespace plus road, streetscape, pattern, obstacle, Peruta, and power-up factories.
	 */
	constructor(chochmahDependencies) {
		this.patternFactory = chochmahDependencies.patternFactory;
		this.obstacleFactory = chochmahDependencies.obstacleFactory;
		this.root = new chochmahDependencies.THREE.Group();
		this.root.name = `StreamingChunk-${chochmahDependencies.index}`;
		this.root.add(chochmahDependencies.roadFactory.create());
		this.root.add(
			chochmahDependencies.streetscapeFactory.create(chochmahDependencies.index)
		);
		const malchusSlots = new MalchusWorldChunkSlotFactory(
			this.root,
			this.obstacleFactory,
			chochmahDependencies.perutaFactory,
			chochmahDependencies.powerUpFactory
		);
		this.obstacles = malchusSlots.createObstacleSlots();
		this.perutas = malchusSlots.createPerutaSlots();
		this.powerUp = malchusSlots.createPowerUpSlot();
		this.motion = new NetzachWorldObstacleMotionSystem(this.obstacles);
		this.rewards = new ChesedWorldChunkRewardSystem(
			this.perutas,
			this.powerUp,
			chochmahDependencies.perutaFactory,
			chochmahDependencies.powerUpFactory
		);
		this.patternId = "unassigned";
	}

	/**
	 * @description Repositions a recycled chunk and deterministically reconfigures hazards plus trustworthy reward placement without creating gameplay geometry.
	 * @param {number} yesodWorldZ New chunk-root world Z coordinate.
	 * @param {number} netzachPatternIndex Deterministic challenge generation index.
	 * @returns {void}
	 */
	reset(yesodWorldZ, netzachPatternIndex) {
		this.root.position.z = yesodWorldZ;
		const tiferesPattern = this.patternFactory.get(netzachPatternIndex);
		this.patternId = tiferesPattern.id;
		this.configureObstacles(tiferesPattern.obstacles);
		this.rewards.reset(
			tiferesPattern.perutas,
			tiferesPattern.obstacles,
			netzachPatternIndex
		);
	}

	/**
	 * @description Reveals semantic hazard identities, restores authored positions, and seeds deterministic motion phases inside fixed pooled records.
	 * @param {ReadonlyArray<object>} chochmahPlacements Stable semantic obstacle placements.
	 * @returns {void}
	 */
	configureObstacles(chochmahPlacements) {
		this.obstacles.forEach((gevurahSlot, malchusIndex) => {
			const chochmahPlacement = chochmahPlacements[malchusIndex];
			gevurahSlot.node.visible = Boolean(chochmahPlacement);
			this.motion.resetSlot(
				gevurahSlot,
				chochmahPlacement?.z || 0,
				malchusIndex * 1.618
			);
			if (!chochmahPlacement) return;
			Object.assign(
				gevurahSlot,
				this.obstacleFactory.configure(gevurahSlot.node, chochmahPlacement)
			);
			gevurahSlot.lane = chochmahPlacement.lane;
			gevurahSlot.node.position.x = OROS_LANES[gevurahSlot.lane];
		});
	}

	/**
	 * @description Advances moving hazards and all visible pooled reward transforms in deterministic frame order.
	 * @param {number} tiferesDelta Bounded frame duration in seconds.
	 * @param {number} netzachSpeed Current world-stream speed.
	 * @param {number} hodTime Running visual time in seconds.
	 * @returns {void}
	 */
	animate(tiferesDelta, netzachSpeed, hodTime) {
		this.motion.update(
			tiferesDelta,
			netzachSpeed,
			hodTime,
			this.root.position.z
		);
		this.rewards.animate(hodTime);
	}
}
