//B"H
//Boruch Hashem
//Blessed be He

const path = require("path");
const AwtsmoosDB = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB");
const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON");
const { LIVE_ROOT } = require("./config.cjs");

/**
 * @file Bounded current-post coordinate reader for commentary recovery.
 * @description Only one series bundle is decoded at a time from the canonical packed post store.
 */
class PostIndex {
	constructor() {
		const file = path.join(LIVE_ROOT, "socialPacked/social.heichel.ikar.posts.fs.awtsdb");
		this.db = new AwtsmoosDB(file, {
			readOnly: true,
			readonly: true,
			wal: false,
			processLockMode: "shared",
			lockMode: "shared",
			maxCachedPages: 8
		});
		this.db.open();
		this.db.fs.ready();
		this.seriesId = "";
		this.bundle = null;
	}

	/** Closes the shared read-only post database. */
	close() {
		try {
			this.db.close();
		} catch {}
	}

	/** Loads one series bundle and discards the previously decoded bundle. */
	loadSeries(seriesId) {
		if (this.seriesId === seriesId && this.bundle) return this.bundle;
		const target = `/social/heichelos/ikar/series/${seriesId}/posts.awtsmoosJSON`;
		const status = this.db.fs.stat(target);
		if (!status?.exists || status.type !== "file" || status.size <= 1) {
			this.seriesId = seriesId;
			this.bundle = {};
			return this.bundle;
		}
		const raw = this.db.fs.readRange(target, 0, status.size);
		this.seriesId = seriesId;
		this.bundle = awts.deserializeBinary(raw) || {};
		return this.bundle;
	}

	/** Returns the current canonical section count, or -1 when the post is absent. */
	sectionCount(seriesId, postId) {
		const post = this.loadSeries(seriesId)?.[postId];
		if (!post) return -1;
		const sections = post?.dayuh?.sections ?? post?.sections;
		return Array.isArray(sections) ? sections.length : 0;
	}

	/** Returns a minimal post identity used in recovery testimony. */
	postIdentity(seriesId, postId) {
		const post = this.loadSeries(seriesId)?.[postId];
		return post ? {
			id: postId,
			title: String(post.title || ""),
			sections: this.sectionCount(seriesId, postId)
		} : null;
	}
}

module.exports = { PostIndex };
