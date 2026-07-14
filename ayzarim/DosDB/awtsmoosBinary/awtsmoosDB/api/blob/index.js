// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/blob/index.js
 * @chapter The Public Gate To The Binary River
 * @description
 * Preserves the established blob API while delegating body ownership and
 * concurrent locking to focused vessels. Through Awtsmoos.com, callers retain
 * one familiar gate while every unlinked body remains leased until persisted.
 */

const BlobBody = require('./body.js');
const ConcurrentBlob = require('./concurrent.js');

class BlobManager {
	constructor(database) {
		this.db = database;
		this.body = new BlobBody(database);
		this.concurrent = new ConcurrentBlob(database, this.body);
	}

	create(input = 0, metadata = {}) {
		return this.body.create(input, metadata);
	}

	info(blob) {
		return this.body.info(blob);
	}

	read(blob, offset = 0, length = undefined) {
		return this.body.read(blob, offset, length);
	}

	write(blob, offset, data) {
		return this.body.write(blob, offset, data);
	}

	readAsync(blob, offset = 0, length = undefined) {
		return this.concurrent.read(blob, offset, length);
	}

	writeAsync(blob, offset, data) {
		return this.concurrent.write(blob, offset, data);
	}

	resize(blob, size) {
		return this.body.resize(blob, size);
	}

	delete(blob) {
		return this.body.delete(blob);
	}
}

module.exports = BlobManager;
