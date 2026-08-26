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
	feedHome(alias) {
		return this.read("feed/home", { aliasId: alias, limit: 8 }, "feedHome");
	}

	/** @param {{limit?: number}} [ohrInput={}] Platform-wide trending input. @returns {Promise<object>} Trending-feed envelope. */
	feedTrending({ limit = 8 } = {}) {
		return this.read("feed/trending", { limit }, "feedTrending");
	}
}
