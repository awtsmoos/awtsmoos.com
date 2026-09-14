//B"H
//Boruch Hashem
//Blessed be He

const path = require("path");
const richPaths = require("../../geelooy/api/social/helper/comments/richCommentPaths.js");
const { uniqueCommentUrl } = require("../../geelooy/api/social/helper/comments/richCommentSchema.js");
const {
	openWritable,
	writeValue
} = require("./storeCodec.cjs");
const { writeIndexes } = require("./writerIndexes.cjs");

/**
 * @file Batched candidate writer for recovered canonical Torah commentary.
 * @description Candidate writes checkpoint periodically, then close flushes the complete isolated generation before verification.
 */
const CHECKPOINT_BATCHES = 256;

class CandidateWriter {
	constructor(root) {
		this.rich = openWritable(
			path.join(root, "socialPacked/social.richComments.v1.fs.awtsdb")
		);
		this.alias = openWritable(
			path.join(root, "socialPacked/social.aliasCommentIndex.fs.awtsdb")
		);
		this.written = 0;
		this.duplicates = 0;
		this.batches = 0;
	}

	/** Flushes the two candidate stores at a bounded durability checkpoint. */
	checkpoint(force = false) {
		this.batches++;
		if (!force && this.batches % CHECKPOINT_BATCHES !== 0) return;
		this.rich.fs.flush?.();
		this.alias.fs.flush?.();
	}

	/** Closes both isolated candidate stores after a final complete flush. */
	close() {
		this.checkpoint(true);
		for (const db of [this.rich, this.alias]) {
			try {
				db.close();
			} catch {}
		}
	}

	/** Writes one validated source-file batch and updates only its local indexes. */
	writeBatch(comments) {
		if (!comments.length) {
			this.checkpoint();
			return { written: 0, duplicates: 0 };
		}
		const accepted = [];
		for (const comment of comments) {
			const context = {
				heichelId: "ikar",
				postId: comment.postId,
				commentId: comment.id,
				verseSection: comment.verseSection
			};
			const target = richPaths.commentPath(context);
			if (this.rich.fs.stat(target)?.exists) {
				this.duplicates++;
				continue;
			}
			comment.url = uniqueCommentUrl(comment);
			writeValue(this.rich, target, comment);
			writeValue(
				this.rich,
				richPaths.uniquePath({ commentId: comment.id }),
				{
					heichelId: "ikar",
					postId: comment.postId,
					seriesId: comment.seriesId
				}
			);
			accepted.push(comment);
			this.written++;
		}
		writeIndexes({
			rich: this.rich,
			alias: this.alias,
			comments: accepted
		});
		this.checkpoint();
		return {
			written: accepted.length,
			duplicates: comments.length - accepted.length
		};
	}
}

module.exports = {
	CandidateWriter,
	CHECKPOINT_BATCHES
};
