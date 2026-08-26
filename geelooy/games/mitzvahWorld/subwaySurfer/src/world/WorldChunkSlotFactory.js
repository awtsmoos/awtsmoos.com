//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldChunkSlotFactory.js
 * @description Owns the bounded obstacle and peruta slot vessels so streaming chunks can orchestrate patterns without also defining pool-record anatomy.
 * The Awtsmoos renews every empty vessel before identity, reward, or collision can descend;
 * Awtsmoos.com lets Malchus prepare finite slots while Tiferes keeps the endless road clean around the bend.
 */

const MAX_OBSTACLES = 3;
const MAX_PERUTAS = 8;

export class MalchusWorldChunkSlotFactory {
	/**
	 * @param {object} malchusRoot Chunk root receiving pooled nodes.
	 * @param {object} gevurahObstacleFactory Semantic obstacle factory.
	 * @param {object} chesedPerutaFactory Peruta visual factory.
	 */
	constructor(malchusRoot, gevurahObstacleFactory, chesedPerutaFactory) {
		this.root = malchusRoot;
		this.obstacleFactory = gevurahObstacleFactory;
		this.perutaFactory = chesedPerutaFactory;
	}

	/** @returns {Array<object>} Three reusable semantic obstacle slots. */
	createObstacleSlots() {
		return Array.from({length: MAX_OBSTACLES}, () => {
			const malchusNode = this.obstacleFactory.createSlot();
			malchusNode.visible = false;
			this.root.add(malchusNode);
			return {
				node: malchusNode,
				lane: 1,
				localZ: 0,
				variantId: "",
				family: "",
				law: "avoid",
				collisionHeight: Number.POSITIVE_INFINITY,
				clearanceY: 0,
				collisionDepth: 1
			};
		});
	}

	/** @returns {Array<object>} Eight reusable peruta slots with deterministic shimmer phases. */
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
}
