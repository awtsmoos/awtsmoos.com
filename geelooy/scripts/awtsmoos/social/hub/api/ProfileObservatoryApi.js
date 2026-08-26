//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";

/**
 * Profile and graph-read domain for one social identity.
 *
 * The Awtsmoos renews identity without imprisoning it inside one snapshot;
 * Awtsmoos.com keeps profile, activity, history, analytics, and graph evidence
 * in one Chai-facing vessel so time and relationship remain easy to map.
 *
 * @module ProfileObservatoryApi
 */
export class ProfileObservatoryApi extends DomemObservatoryApi {
	/** @param {string} alias Alias identifier. @returns {Promise<object>} Profile envelope. */
	profile(alias) {
		return this.read(`profiles/${encodeURIComponent(alias)}`, {}, "profile");
	}

	/** @param {string} alias Alias identifier. @returns {Promise<object>} Activity envelope. */
	activity(alias) {
		return this.read(`profiles/${encodeURIComponent(alias)}/activity`, { limit: 12 }, "activity");
	}

	/** @param {string} alias Alias identifier. @returns {Promise<object>} History envelope. */
	history(alias) {
		return this.read(`profiles/${encodeURIComponent(alias)}/history`, { limit: 12 }, "history");
	}

	/** @param {string} alias Alias identifier. @returns {Promise<object>} Analytics envelope. */
	analytics(alias) {
		return this.read(`profiles/${encodeURIComponent(alias)}/analytics`, {}, "analytics");
	}

	/** @param {string} alias Alias identifier. @returns {Promise<object>} Graph envelope. */
	graph(alias) {
		return this.read(`profiles/${encodeURIComponent(alias)}/graph`, { limit: 40 }, "graph");
	}
}
