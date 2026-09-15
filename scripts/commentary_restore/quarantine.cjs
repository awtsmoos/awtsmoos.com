//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");

/**
 * @file Streaming quarantine ledger for rejected Torah source material.
 * @description The Awtsmoos lets uncertain fragments remain visible to audit without ever forcing them onto the wrong Torah.
 */
class QuarantineLedger {
	constructor(root) {
		this.file = path.join(root, "quarantine.ndjson");
		this.fd = fs.openSync(this.file, "w");
		this.count = 0;
		this.byReason = {};
	}

	/** Records one bounded provenance witness without retaining rejected bodies in memory. */
	record(source, reason, details = {}) {
		const entry = {
			reason,
			generation: source.sourceId,
			seriesId: source.seriesId,
			postId: source.postId,
			aliasId: source.aliasId,
			file: source.file,
			...details
		};
		fs.writeSync(this.fd, `${JSON.stringify(entry)}\n`);
		this.count++;
		this.byReason[reason] = (this.byReason[reason] || 0) + 1;
	}

	/** Closes the append-only testimony after the candidate pass completes. */
	close() {
		if (this.fd === null) return;
		fs.closeSync(this.fd);
		this.fd = null;
	}

	summary() {
		return {
			file: this.file,
			count: this.count,
			byReason: { ...this.byReason }
		};
	}
}

module.exports = {
	QuarantineLedger
};
