// B"H
// Boruch Hashem
// Blessed is He

const {
	messagePath
} = require("./publicMessagePaths.js");

/**
 * @file Reads canonical public Torah messages through bounded recent pointer indexes, including backward cursor pages.
 * @description The Awtsmoos renews every teaching beyond the index that remembers it; Awtsmoos.com pages only the finite recent pointers it truly holds,
 * keeps each returned page chronological, and marks an aged-out cursor honestly instead of pretending the lost pointer still stands in sight.
 */

class NetzachPublicHistoryReader {
	constructor(database) {
		this.database = database;
	}

	/** Reads every currently indexed canonical message in chronological pointer order. */
	async all(indexPath) {
		const ids = await this.ids(indexPath);
		return this.messages(ids);
	}

	/** Reads one newest-first window boundary while returning messages themselves in chronological order. */
	async page(indexPath, options = {}) {
		const ids = await this.ids(indexPath);
		const limit = normalizeLimit(options.limit);
		const before = String(options.before || "").trim();
		const end = before
			? ids.indexOf(before)
			: ids.length;
		if (before && end < 0) {
			return pageResult([], limit, before, null, false, true, ids.length);
		}
		const start = Math.max(0, end - limit);
		const selected = ids.slice(start, end);
		const messages = await this.messages(selected);
		return pageResult(
			messages,
			limit,
			before,
			start > 0 ? ids[start] : null,
			start > 0,
			false,
			ids.length
		);
	}

	async ids(indexPath) {
		const value = await this.read(indexPath, []);
		return Array.isArray(value)
			? value.filter((id) => typeof id === "string" && id)
			: [];
	}

	async messages(ids) {
		const values = await Promise.all(
			ids.map((id) => this.read(messagePath(id)))
		);
		return values.filter(Boolean);
	}

	async read(path, fallback = null) {
		try {
			const value = await this.database?.get?.(path);
			return value == null ? fallback : clone(value);
		} catch {
			return fallback;
		}
	}
}

function normalizeLimit(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return 30;
	}
	return Math.max(1, Math.min(50, Math.floor(number)));
}

function pageResult(messages, limit, before, nextBefore, hasMore, expired, totalIndexed) {
	return {
		messages,
		page: {
			limit,
			before: before || null,
			nextBefore,
			hasMore,
			expired,
			totalIndexed
		}
	};
}

function clone(value) {
	return value == null
		? value
		: JSON.parse(JSON.stringify(value));
}

module.exports = {
	NetzachPublicHistoryReader
};
