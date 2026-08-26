//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldChunk.js
 * @description Orchestrates one reusable road segment while semantic obstacle and peruta slots receive immutable pattern data without runtime geometry allocation.
 * The Awtsmoos renews one finite chunk until it becomes another horizon anew;
 * Awtsmoos.com lets Tiferes join pattern, lane, reward, and pooled identity while each smaller vessel keeps its truth.
 */

import { OROS_LANES } from "../config.js";
import { MalchusWorldChunkSlotFactory } from "./WorldChunkSlotFactory.js";

export class TiferesWorldChunk {
	/** @param {object} dependencies Three namespace and procedural world factories. */
	constructor(dependencies) {
		this.patternFactory = dependencies.patternFactory;
		this.perutaFactory = dependencies.perutaFactory;
		this.obstacleFactory = dependencies.obstacleFactory;
		this.root = new dependencies.THREE.Group();
		this.root.name = `StreamingChunk-${dependencies.index}`;
		this.root.add(dependencies.roadFactory.create());
		this.root.add(dependencies.streetscapeFactory.create(dependencies.index));
		const malchusSlots = new MalchusWorldChunkSlotFactory(
			this.root,
			this.obstacleFactory,
			this.perutaFactory
		);
		this.obstacles = malchusSlots.createObstacleSlots();
		this.perutas = malchusSlots.createPerutaSlots();
		this.patternId = "unassigned";
	}

	/** @param {number} yesodWorldZ New chunk center. @param {number} netzachPatternIndex Generation index. */
	reset(yesodWorldZ, netzachPatternIndex) {
		this.root.position.z = yesodWorldZ;
		const tiferesPattern = this.patternFactory.get(netzachPatternIndex);
		this.patternId = tiferesPattern.id;
		this.configureObstacles(tiferesPattern.obstacles);
		this.configurePerutas(tiferesPattern.perutas);
	}

	/** @param {Array<object>} chochmahPlacements Stable semantic obstacle placements. */
	configureObstacles(chochmahPlacements) {
		this.obstacles.forEach((malchusSlot, malchusIndex) => {
			const chochmahPlacement = chochmahPlacements[malchusIndex];
			malchusSlot.node.visible = Boolean(chochmahPlacement);
			if (!chochmahPlacement) return;
			const yesodMetadata = this.obstacleFactory.configure(
				malchusSlot.node,
				chochmahPlacement
			);
			malchusSlot.lane = chochmahPlacement.lane;
			malchusSlot.localZ = chochmahPlacement.z;
			Object.assign(malchusSlot, yesodMetadata);
			malchusSlot.node.position.set(
				OROS_LANES[malchusSlot.lane],
				0,
				malchusSlot.localZ
			);
		});
	}

	/** @param {Array<object>} chesedPlacements Immutable peruta lane/Z records. */
	configurePerutas(chesedPlacements) {
		this.perutas.forEach((malchusSlot, malchusIndex) => {
			const chesedPlacement = chesedPlacements[malchusIndex];
			malchusSlot.collected = false;
			malchusSlot.node.visible = Boolean(chesedPlacement);
			if (!chesedPlacement) return;
			malchusSlot.lane = chesedPlacement.lane;
			malchusSlot.localZ = chesedPlacement.z;
			malchusSlot.node.position.x = OROS_LANES[malchusSlot.lane];
			malchusSlot.node.position.z = malchusSlot.localZ;
		});
	}

	/** @param {number} tiferesTime Visual time for pooled peruta shimmer. */
	animate(tiferesTime) {
		for (const chesedSlot of this.perutas) {
			if (chesedSlot.node.visible && !chesedSlot.collected) {
				this.perutaFactory.animate(
					chesedSlot.node,
					tiferesTime,
					chesedSlot.phase
				);
			}
		}
	}
}
