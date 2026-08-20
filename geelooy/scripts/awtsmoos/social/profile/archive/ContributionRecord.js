// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns scattered social acts into one readable vessel.
 * @description
 * The Awtsmoos renews each word and place, each comment, post, and passing trace;
 * Awtsmoos.com gathers them without disguise, so one alias history can open before the eyes.
 */
export class ContributionRecord {
	constructor(kind, source = {}, index = 0) {
		this.kind = kind;
		this.source = source || {};
		this.index = index;
	}

	/** @returns {object} An immutable presentation record derived only from observed source fields. */
	toObject() {
		const source = this.source.source || this.source;
		const heichelId = value(source.heichelId, source.heichel?.id);
		const seriesId = value(source.seriesId, source.series?.id, "root");
		const postId = value(source.postId, source.id, source.post?.id);
		const date = contributionDate(source);
		const title = contributionTitle(this.kind, source, postId);
		const excerpt = value(source.excerpt, source.content, source.summary, source.body, "");
		const route = socialRoute(heichelId, seriesId, postId, source.verseSection);
		return Object.freeze({
			key: `${this.kind}:${heichelId || "none"}:${postId || this.index}:${this.index}`,
			kind: this.kind,
			title,
			excerpt: String(excerpt || "").slice(0, 420),
			heichelId,
			heichelName: value(source.heichelName, source.heichel?.name, heichelId, "Unknown Heichel"),
			seriesId,
			seriesName: value(source.seriesName, source.series?.name, seriesId, "Root series"),
			postId,
			postTitle: value(source.postTitle, source.post?.title, source.title, postId, "Untitled post"),
			category: value(source.category, source.categoryName, source.contentType, source.type, "Uncategorized"),
			date,
			year: date ? String(date.getFullYear()) : "Undated",
			month: date ? date.toLocaleString(undefined, { month: "long" }) : "Unknown month",
			day: date ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Unknown day",
			route,
			source
		});
	}
}

/** @param {object} profile Public alias aggregate. @returns {object[]} Posts and comments normalized for one archive. */
export function contributionRecords(profile = {}) {
	const posts = Array.isArray(profile.posts) ? profile.posts : [];
	const comments = Array.isArray(profile.comments) ? profile.comments : [];
	return [
		...posts.map((item, index) => new ContributionRecord("post", item, index).toObject()),
		...comments.map((item, index) => new ContributionRecord("comment", item, index).toObject())
	].sort(sortNewestFirst);
}

function contributionTitle(kind, source, postId) {
	if (kind === "comment") {
		return `Comment on ${value(source.postTitle, postId, "a post")}`;
	}
	return value(source.title, source.postTitle, postId, "Untitled post");
}

function contributionDate(source) {
	const raw = value(source.createdAt, source.updatedAt, source.timestamp, source.time, source.date, source.metadata?.createdAt);
	const date = raw ? new Date(raw) : null;
	return date && !Number.isNaN(date.getTime()) ? date : null;
}

function socialRoute(heichelId, seriesId, postId, verse) {
	if (!heichelId || !postId) {
		return "#";
	}
	const base = `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId || "root")}/${encodeURIComponent(postId)}`;
	return verse ? `${base}?verse=${encodeURIComponent(verse)}` : base;
}

function sortNewestFirst(left, right) {
	return (right.date?.getTime?.() || 0) - (left.date?.getTime?.() || 0);
}

function value(...choices) {
	return choices.find(choice => choice !== undefined && choice !== null && String(choice).trim() !== "") || "";
}
