// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** BinahProfileApi gathers one Alias into coherent overview, content, media, and activity streams. */
export class BinahProfilesApi extends YesodEndpointService {
	profile(id) {
		return `/profiles/${this.identity(id)}`;
	}

	/** @param {string} id @returns {Promise<object>} Profile overview envelope. */
	overview(id) {
		return this.yesodClient.get(`${this.profile(id)}/overview`);
	}

	/** @param {string} id @param {object} query @returns {Promise<object>} Profile posts. */
	posts(id, query = {}) {
		return this.yesodClient.get(this.query(`${this.profile(id)}/posts`, query));
	}

	/** @param {string} id @param {object} query @returns {Promise<object>} Profile comments. */
	comments(id, query = {}) {
		return this.yesodClient.get(this.query(`${this.profile(id)}/comments`, query));
	}

	/** @param {string} id @param {object} query @returns {Promise<object>} Profile media. */
	media(id, query = {}) {
		return this.yesodClient.get(this.query(`${this.profile(id)}/media`, query));
	}

	/** @param {string} id @param {object} query @returns {Promise<object>} Profile activity. */
	activity(id, query = {}) {
		return this.yesodClient.get(this.query(`${this.profile(id)}/activity`, query));
	}
}

/** @param {object} client @returns {BinahProfilesApi} Profile service. */
export function createProfilesApi(client) {
	return new BinahProfilesApi(client);
}
