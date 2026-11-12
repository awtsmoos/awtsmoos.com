//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";

/**
 * Read-only feed domain for home, alias, trending, and event rivers.
 *
 * The Awtsmoos renews every social current before sequence can call itself time;
 * Awtsmoos.com gathers those currents here so feed semantics remain one readable
 * Tiferes river, broad enough for discovery yet bounded enough to keep its rhyme.
 *
 * @module FeedObservatoryApi
 */
export class FeedObservatoryApi extends DomemObservatoryApi {
	/** Extracts the item list from any feed envelope shape. */
	static itemsOf(envelope) {
		if (!envelope || typeof envelope !== 'object') return [];
		const s = envelope.success;
		if (Array.isArray(s)) return s;
		if (s && Array.isArray(s.items)) return s.items;
		if (Array.isArray(envelope.data)) return envelope.data;
		if (Array.isArray(envelope.items)) return envelope.items;
		return [];
	}

	/** Normalizes a base-feed post to the home-feed item shape. */
	static normalizeBasePost(p = {}) {
		const src = p.source || {};
		const ss = p.socialSummary || {};
		return {
			postId: String(p.id || p.postId || ''),
			id: String(p.id || p.postId || ''),
			title: p.title || '',
			heichelId: p.heichelId || src.heichelId || 'ikar',
			seriesId: src.seriesId || p.seriesId || 'root',
			aliasId: p.aliasId || '',
			authorName: src.authorName || '',
			authorHandle: '',
			type: 'post',
			excerpt: p.excerpt || '',
			connected: true,
			basePostId: '',
			parentPostId: '',
			kind: '',
			updatedAt: p.updatedAt || p.createdAt || Date.now(),
			commentCount: Number((ss.comments || {}).total || 0),
			_rankScore: 0
		};
	}

	/** @param {{aliases?: string, kinds?: string, limit?: number}} [ohrInput={}] Feed input. @returns {Promise<object>} Feed envelope. */
	feed({ aliases, kinds = "", limit = 12 } = {}) {
		return this.read("feed", { aliases, kinds, limit }, "feed");
	}

	/** @param {{aliases?: string, limit?: number}} [ohrInput={}] Trending input. @returns {Promise<object>} Trending envelope. */
	trending({ aliases, limit = 12 } = {}) {
		return this.read("trending", { aliases, limit }, "trending");
	}

	/** @param {{aliases?: string, limit?: number}} [ohrInput={}] Event input. @returns {Promise<object>} Event envelope. */
	events({ aliases, limit = 12 } = {}) {
		return this.read("events", { aliases, limit }, "events");
	}

	/** @param {string} alias Active alias. @returns {Promise<object>} Home-feed envelope. */
	async feedHome(alias) {
		// B"H social fix 1: feed/home only surfaces the handful of posts written
		// through the social write path (in practice the 2 duplicated "Write-path
		// test" posts). When it returns fewer than a page, top up from the base
		// chronological feed so the Observatory shows real posts. The envelope
		// shape is preserved (success.items) so the existing renderer is untouched.
		const home = await this.read("feed/home", { aliasId: alias, limit: 8 }, "feedHome");
		const homeItems = FeedObservatoryApi.itemsOf(home);
		if (homeItems.length >= 8) return home;
		try {
			const base = await this.read("feed", { limit: 8 }, "feedHome");
			const seen = new Set(homeItems.map((it) => String(it.postId || it.id || '')));
			const extra = FeedObservatoryApi.itemsOf(base)
				.map(FeedObservatoryApi.normalizeBasePost)
				.filter((it) => {
					const key = String(it.postId || it.id || '');
					if (!key || seen.has(key)) return false;
					seen.add(key);
					return true;
				});
			if (extra.length && home && home.success && typeof home.success === 'object' && !Array.isArray(home.success)) {
				home.success.items = [...homeItems, ...extra];
				home.success.total = home.success.items.length;
			}
		} catch (_) { /* home result stands on its own */ }
		return home;
	}

	/** @param {{limit?: number}} [ohrInput={}] Platform-wide trending input. @returns {Promise<object>} Trending-feed envelope. */
	feedTrending({ limit = 8 } = {}) {
		return this.read("feed/trending", { limit }, "feedTrending");
	}
}
