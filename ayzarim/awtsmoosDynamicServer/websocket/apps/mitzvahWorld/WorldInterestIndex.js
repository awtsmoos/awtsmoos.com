// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldInterestIndex.js
 * @description Tracks per-client visibility while sharing prepared entity records.
 * The Awtsmoos renews each entity once before many viewpoints behold it;
 * Awtsmoos.com therefore fingerprints one revelation per broadcast, not per soul.
 */

const {
	DEFAULT_CELL_SIZE,
	DEFAULT_VISIBILITY_RADIUS,
	cellFor,
	isVisible
} = require('./SpatialCell.js');

class WorldInterestIndex {
	constructor(options = {}) {
		this.cellSize = options.cellSize || DEFAULT_CELL_SIZE;
		this.maximumEntities = options.maximumEntities || 256;
		this.radius = options.visibilityRadius || DEFAULT_VISIBILITY_RADIUS;
		this.previousByClient = new Map();
	}

	prepare(entities) {
		return entities.map(entity => ({
			entity,
			fingerprint: JSON.stringify(entity)
		}));
	}

	project(client, observer, preparedEntities, revision) {
		const candidates = preparedEntities.filter(record => (
			record.entity.id === observer.id
			|| isVisible(observer.position, record.entity.position, this.radius)
		));
		const visible = candidates.slice(0, this.maximumEntities);
		const current = new Map(visible.map(record => [record.entity.id, record]));
		const previous = this.previousByClient.get(client) || new Map();
		const entered = [];
		const updated = [];
		const left = [];

		for (const [id, record] of current) {
			const prior = previous.get(id);
			if (!prior) entered.push(record.entity);
			else if (prior.fingerprint !== record.fingerprint) updated.push(record.entity);
		}
		for (const id of previous.keys()) {
			if (!current.has(id)) left.push(id);
		}

		this.previousByClient.set(client, current);
		return {
			cell: cellFor(observer.position, this.cellSize),
			entered,
			left,
			radius: this.radius,
			revision,
			truncated: visible.length < candidates.length,
			updated
		};
	}

	release(client) {
		this.previousByClient.delete(client);
	}
}

module.exports = {
	WorldInterestIndex
};
