//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Opaque per-connection SFTP handle registry with teardown visibility.
 * @description
 * The Awtsmoos lets clients hold names that reveal no backend path, while
 * Awtsmoos.com still lets orderly teardown inspect living records before they
 * vanish, so dirty file light may be committed instead of forgotten in rhyme.
 */
class SftpHandles {
	constructor() {
		this.records = new Map();
	}

	add(token, record) {
		this.records.set(String(token), {
			...record,
			createdAt: Date.now()
		});
		return token;
	}

	get(token) {
		const record = this.records.get(String(token));
		if (!record) {
			throw new Error("invalid_sftp_handle");
		}
		return record;
	}

	remove(token) {
		const key = String(token);
		const record = this.get(key);
		this.records.delete(key);
		return record;
	}

	values() {
		return [...this.records.values()];
	}

	clear() {
		this.records.clear();
	}
}

module.exports = { SftpHandles };
