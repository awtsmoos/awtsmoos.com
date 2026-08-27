// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews one bounded segment again and again along the road;
 * Awtsmoos.com lets a finite vessel carry an endless procedural load.
 */

import { OROS_LANES } from "../config.js";

const MAX_OBSTACLES = 3;
const MAX_PERUTAS = 8;

export class TiferesWorldChunk {
	/** @param {object} dependencies Three.js and procedural world factories. */
	constructor(dependencies) {
		this.THREE = dependencies.THREE;
		this.index = dependencies.index;
		this.patternFactory = dependencies.patternFactory;
		this.perutaFactory = dependencies.perutaFactory;
		this.obstacleFactory = dependencies.obstacleFactory;
		this.root = new this.THREE.Group();
		this.root.name = `StreamingChunk-${this.index}`;
		this.root.add(dependencies.roadFactory.create());
		this.root.add(dependencies.streetscapeFactory.create(this.index));
		this.obstacles = this.createObstacleSlots();
		this.perutas = this.createPerutaSlots();
	}

	/** @returns {Array<object>} Reusable obstacle slot records. */
	createObstacleSlots() {
		return Array.from({ length: MAX_OBSTACLES }, (_, slotIndex) => {
			const node = this.obstacleFactory.create(slotIndex % 2 ? "cart" : "barrier");
			node.visible = false;
			this.root.add(node);
			return { node, lane: 1, localZ: 0, height: node.userData.collisionHeight || 1.05 };
		});
	}

	/** @returns {Array<object>} Reusable peruta slot records. */
	createPerutaSlots() {
		return Array.from({ length: MAX_PERUTAS }, (_, slotIndex) => {
			const node = this.perutaFactory.create();
			node.visible = false;
			this.root.add(node);
			return { node, lane: 1, localZ: 0, collected: false, phase: slotIndex * 0.73 };
		});
	}

	/**
	 * Repositions this chunk and reveals a deterministic content pattern.
	 * @param {number} worldZ New chunk center Z.
	 * @param {number} patternIndex Pattern-generation index.
	 */
	reset(worldZ, patternIndex) {
		this.root.position.z = worldZ;
		const pattern = this.patternFactory.get(patternIndex);
		this.configureObstacles(pattern.obstacles);
		this.configurePerutas(pattern.perutas);
	}

	/** @param {Array<Array<number>>} placements Lane/Z tuples for obstacles. */
	configureObstacles(placements) {
		this.obstacles.forEach((slot, index) => {
			const placement = placements[index];
			slot.node.visible = Boolean(placement);
			if (!placement) return;
			[slot.lane, slot.localZ] = placement;
			slot.node.position.set(OROS_LANES[slot.lane], 0, slot.localZ);
		});
	}

	/** @param {Array<Array<number>>} placements Lane/Z tuples for perutas. */
	configurePerutas(placements) {
		this.perutas.forEach((slot, index) => {
			const placement = placements[index];
			slot.collected = false;
			slot.node.visible = Boolean(placement);
			if (!placement) return;
			[slot.lane, slot.localZ] = placement;
			slot.node.position.x = OROS_LANES[slot.lane];
			slot.node.position.z = slot.localZ;
		});
	}

	/** @param {number} time Running visual time for peruta shimmer and spin. */
	animate(time) {
		for (const slot of this.perutas) {
			if (slot.node.visible && !slot.collected) {
				this.perutaFactory.animate(slot.node, time, slot.phase);
			}
		}
	}
}
