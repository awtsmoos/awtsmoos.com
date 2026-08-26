// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** MalchusSeriesApi gives ordered social collections one explicit lifecycle contract. */
export class MalchusSeriesApi extends YesodEndpointService {
	/** @param {string} yesodSeriesId @returns {string} Encoded Series path. */
	seriesPath(yesodSeriesId) {
		return `/series/${this.identity(yesodSeriesId)}`;
	}

	/** @param {string} yesodSeriesId @returns {Promise<object>} Series envelope. */
	get(yesodSeriesId) {
		return this.yesodClient.get(this.seriesPath(yesodSeriesId));
	}

	/** @param {object} malchusBody @returns {Promise<object>} Created Series. */
	create(malchusBody) {
		return this.yesodClient.post('/series', malchusBody);
	}

	/** @param {string} yesodSeriesId @param {object} malchusBody @returns {Promise<object>} Updated Series. */
	update(yesodSeriesId, malchusBody) {
		return this.yesodClient.put(this.seriesPath(yesodSeriesId), malchusBody);
	}

	/** @param {string} yesodSeriesId @returns {Promise<object>} Removal envelope. */
	remove(yesodSeriesId) {
		return this.yesodClient.delete(this.seriesPath(yesodSeriesId));
	}

	/** @param {string} yesodSeriesId @returns {Promise<object>} Series posts. */
	posts(yesodSeriesId) {
		return this.yesodClient.get(`${this.seriesPath(yesodSeriesId)}/posts`);
	}

	/** @param {string} yesodSeriesId @param {object} malchusBody @returns {Promise<object>} Added post envelope. */
	addPost(yesodSeriesId, malchusBody) {
		return this.yesodClient.post(`${this.seriesPath(yesodSeriesId)}/posts`, malchusBody);
	}

	/** @param {string} yesodSeriesId @param {object} malchusBody @returns {Promise<object>} Added subseries envelope. */
	addSubseries(yesodSeriesId, malchusBody) {
		return this.yesodClient.post(`${this.seriesPath(yesodSeriesId)}/subseries`, malchusBody);
	}

	/** @param {string} yesodSeriesId @param {object} malchusBody @returns {Promise<object>} Reorder envelope. */
	reorder(yesodSeriesId, malchusBody) {
		return this.yesodClient.post(`${this.seriesPath(yesodSeriesId)}/reorder`, malchusBody);
	}

	/** @param {string} yesodSeriesId @returns {Promise<object>} Series references. */
	references(yesodSeriesId) {
		return this.yesodClient.get(`${this.seriesPath(yesodSeriesId)}/references`);
	}
}

/** @param {object} yesodClient @returns {MalchusSeriesApi} Series service. */
export function createSeriesApi(yesodClient) {
	return new MalchusSeriesApi(yesodClient);
}
