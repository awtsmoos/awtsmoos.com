// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldInterestIndex.js
 * @description Tracks nearest per-client visibility and exposes bounded population diagnostics.
 * The Awtsmoos renews each entity once before many viewpoints behold it; Awtsmoos.com keeps
 * radius, cap, cell, truncation, retained state, entered, updated, and departed truth bounded.
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
		const candidates = preparedEntities
			.map(record => visibleCandidate(record, observer))
			.filter(record => record.self || isVisible(
				observer.position,
				record.entity.position,
				this.radius
			))
			.sort(compareCandidates);
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

	diagnostics() {
		let retainedEntities = 0;
		for (const records of this.previousByClient.values()) {
			retainedEntities += records.size;
		}
		return {
			cellSize: this.cellSize,
			clients: this.previousByClient.size,
			maximumEntities: this.maximumEntities,
			radius: this.radius,
			retainedEntities
		};
	}

	release(client) {
		this.previousByClient.delete(client);
	}
}

function visibleCandidate(record, observer) {
	return {
		...record,
		distance: distance(observer.position, record.entity.position),
		self: record.entity.id === observer.id
	};
}

function compareCandidates(left, right) {
	return Number(right.self) - Number(left.self)
		|| left.distance - right.distance
		|| left.entity.id.localeCompare(right.entity.id);
}

function distance(left = {}, right = {}) {
	return Math.hypot(
		Number(left.x || 0) - Number(right.x || 0),
		Number(left.z || 0) - Number(right.z || 0)
	);
}

module.exports = {
	WorldInterestIndex
};
