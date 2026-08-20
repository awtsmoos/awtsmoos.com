// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes one alias profile into filesystem-like Heichel, series, and post nodes.
 * @description
 * The Awtsmoos is beyond folder and file, yet finite vessels may reveal a path;
 * Awtsmoos.com turns publishing hierarchy into a navigable tree without changing the social source beneath.
 */
export class SocialTree {
	constructor(aliasId, profile = {}) {
		this.aliasId = clean(aliasId);
		this.profile = profile || {};
		this.posts = Array.isArray(profile.posts) ? profile.posts : [];
		this.heichelos = heichelRecords(profile, this.posts);
	}

	/** @param {string[]} parts Relative path segments after /social. */
	children(parts = []) {
		if (!parts.length) {
			return [record("alias", this.aliasId, `@${this.aliasId}`, { aliasId: this.aliasId })];
		}
		if (parts[0] !== this.aliasId) {
			return [];
		}
		if (parts.length === 1) {
			return this.heichelos.map(item => record("heichel", item.id, item.name, item));
		}
		if (parts.length === 2) {
			return this.seriesFor(parts[1]).map(item => record("series", item.id, item.name, item));
		}
		if (parts.length === 3) {
			return this.postsFor(parts[1], parts[2]).map(item => record("post", postId(item), postTitle(item), item));
		}
		return [];
	}

	/** @param {string[]} parts Relative path segments after /social. */
	lookup(parts = []) {
		if (parts.length === 1 && parts[0] === this.aliasId) {
			return record("alias", this.aliasId, `@${this.aliasId}`, { aliasId: this.aliasId });
		}
		if (parts[0] !== this.aliasId) {
			return null;
		}
		if (parts.length === 2) {
			const item = this.heichelos.find(entry => entry.id === parts[1]);
			return item ? record("heichel", item.id, item.name, item) : null;
		}
		if (parts.length === 3) {
			const item = this.seriesFor(parts[1]).find(entry => entry.id === parts[2]);
			return item ? record("series", item.id, item.name, item) : null;
		}
		if (parts.length === 4) {
			const item = this.postsFor(parts[1], parts[2]).find(entry => postId(entry) === parts[3]);
			return item ? record("post", postId(item), postTitle(item), item) : null;
		}
		return null;
	}

	seriesFor(heichelId) {
		const seen = new Map();
		for (const post of this.posts.filter(item => clean(item.heichelId) === clean(heichelId))) {
			const id = clean(post.seriesId || "root") || "root";
			seen.set(id, { id, name: post.seriesName || (id === "root" ? "Root series" : id), heichelId });
		}
		return [...seen.values()];
	}

	postsFor(heichelId, seriesId) {
		return this.posts.filter(item => clean(item.heichelId) === clean(heichelId) && clean(item.seriesId || "root") === clean(seriesId || "root"));
	}
}

function heichelRecords(profile, posts) {
	const seen = new Map();
	for (const item of Array.isArray(profile.heichelos) ? profile.heichelos : []) {
		const id = clean(item.id || item.heichelId);
		if (id) seen.set(id, { ...item, id, name: item.name || id });
	}
	for (const post of posts) {
		const id = clean(post.heichelId);
		if (id && !seen.has(id)) seen.set(id, { id, name: post.heichelName || id });
	}
	return [...seen.values()];
}

function record(kind, id, name, source) {
	return { kind, id: clean(id), name: String(name || id || "Untitled"), source };
}

function postId(post) {
	return clean(post.postId || post.id);
}

function postTitle(post) {
	return post.title || post.postTitle || postId(post) || "Untitled post";
}

function clean(value) {
	return String(value || "").trim();
}
