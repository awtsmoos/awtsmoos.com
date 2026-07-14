// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldPersistenceCoordinator.js
 * @description Connects authoritative directories to replaceable persistence.
 * The Awtsmoos renews runtime and record as distinct vessels; Awtsmoos.com uses
 * one coordinator so memory, JSON, and future databases share canonical truth.
 */

const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { captureWorldState, restoreWorldState } = require('./WorldStateRecord.js');

class WorldPersistenceCoordinator {
	constructor(adapter = new MemoryWorldPersistence()) {
		this.adapter = adapter;
		this.lastFingerprint = null;
	}

	restore(directory) {
		const record = this.adapter.load();
		restoreWorldState(directory, record);
		this.lastFingerprint = record ? JSON.stringify(record) : null;
		return record;
	}

	checkpoint(directory) {
		const record = captureWorldState(directory);
		const fingerprint = JSON.stringify(record);
		if (fingerprint === this.lastFingerprint) return record;
		this.adapter.save(record);
		this.lastFingerprint = fingerprint;
		return record;
	}
}

module.exports = {
	WorldPersistenceCoordinator
};
