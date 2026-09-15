//B"H
//Boruch Hashem
//Blessed be He

const path = require("path");
const { openWritable } = require("./storeCodec.cjs");
const { writeBodies } = require("./writerBodies.cjs");
const { writeIndexes } = require("./writerIndexes.cjs");

/**
 * @file Bounded post-group writer for recovered canonical Torah source annotations.
 * @description The Awtsmoos remembers only deterministic body IDs and lightweight reader-index IDs,
 * so Awtsmoos.com never reparses a growing FS3 manifest merely to rediscover native candidate state.
 */
const CHECKPOINT_GROUPS = 128;

class CandidateWriter {
	constructor(root) {
		this.rich = openWritable(
			path.join(root, "socialPacked/social.richComments.v1.fs.awtsdb")
		);
		this.seenIds = new Set();
		this.indexState = new Map();
		this.written = 0;
		this.duplicates = 0;
		this.groups = 0;
	}

	/** Flushes native authority at a bounded durability checkpoint between complete post groups. */
	checkpoint(force = false) {
		this.groups++;
		if (!force && this.groups % CHECKPOINT_GROUPS !== 0) return;
		this.rich.fs.flush?.();
	}

	/** Closes the isolated candidate store after a final manifest flush. */
	close() {
		this.checkpoint(true);
		try {
			this.rich.close();
		} catch {}
	}

	/** Writes one bounded post group and returns exact newly written IDs for source accounting. */
	writeGroup(comments) {
		if (!comments.length) {
			this.checkpoint();
			return {
				written: 0,
				duplicates: 0,
				writtenIds: []
			};
		}
		let accepted = [];
		this.rich.batch(() => {
			accepted = writeBodies(
				this.rich,
				comments,
				this.seenIds
			);
			writeIndexes({
				rich: this.rich,
				comments: accepted,
				indexState: this.indexState
			});
		});
		const duplicates = comments.length - accepted.length;
		this.written += accepted.length;
		this.duplicates += duplicates;
		this.checkpoint();
		return {
			written: accepted.length,
			duplicates,
			writtenIds: accepted.map(comment => comment.id)
		};
	}

	/** Preserves the simple batch contract for focused tests and bounded callers. */
	writeBatch(comments) {
		const result = this.writeGroup(comments);
		return {
			written: result.written,
			duplicates: result.duplicates
		};
	}
}

module.exports = {
	CandidateWriter,
	CHECKPOINT_GROUPS
};
