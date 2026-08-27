// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkRewardPopulator.js
 * @description Places pooled peruta trails and occasional power-ups without owning obstacle-law decisions.
 * The Awtsmoos renews each small reward while Chesed reuses finite vessels along the road;
 * Awtsmoos.com keeps reward placement separate from Gevurah, so gifts and challenges never share a tangled load.
 */

import {
	OROS_LANES,
	POWERUP_CONFIG
} from "../config.js";

const POWERUP_TYPES = Object.freeze([
	"magnet",
	"shield",
	"double"
]);

export class ChesedChunkRewardPopulator {
	/**
	 * @param {object} collectibleFactory Reusable peruta factory.
	 * @param {object} powerUpFactory Reusable power-up factory.
	 */
	constructor(collectibleFactory, powerUpFactory) {
		this.collectibleFactory = collectibleFactory;
		this.powerUpFactory = powerUpFactory;
	}

	/** @param {object} chunk Recyclable chunk. @param {object} trail Trail definition. @param {number} seed Generation seed. */
	populate(chunk, trail, seed) {
		this.addPerutas(chunk, trail?.placements || [], seed);
		this.addPowerUp(chunk, trail, seed);
	}

	/** Places perutas into already-allocated collectible records. */
	addPerutas(chunk, placements, seed) {
		const count = Math.min(
			placements.length,
			chunk.collectibles.length
		);
		for (let index = 0; index < count; index += 1) {
			const placement = placements[index];
			const record = chunk.collectibles[index];
			this.collectibleFactory.configure(record.node, placement);
			record.node.position.set(
				OROS_LANES[placement.lane],
				placement.y || 1.15,
				placement.z
			);
			Object.assign(record, {
				active: true,
				lane: placement.lane,
				localZ: placement.z,
				baseY: placement.y || 1.15,
				phase: seed * 0.37 + index * 0.61,
				value: placement.value || 1,
				requiredAction: placement.action || "normal",
				collected: false,
				missed: false
			});
		}
	}

	/** Places one occasional pooled power-up on a readable trail lane. */
	addPowerUp(chunk, trail, seed) {
		if (
			seed <= 0
			|| seed % POWERUP_CONFIG.spawnEveryChunks !== 3
		) {
			return;
		}
		const record = chunk.powerUps[0];
		if (!record) return;
		const typeIndex = Math.floor(
			seed / POWERUP_CONFIG.spawnEveryChunks
		) % POWERUP_TYPES.length;
		const type = POWERUP_TYPES[typeIndex];
		const lane = trail?.lane ?? (seed + 1) % 3;
		this.powerUpFactory.configure(record.node, type);
		record.node.position.set(OROS_LANES[lane], 1.3, -6);
		Object.assign(record, {
			active: true,
			lane,
			localZ: -6,
			baseY: 1.3,
			kind: type,
			phase: seed * 0.29,
			collected: false
		});
	}
}
