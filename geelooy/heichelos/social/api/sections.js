// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** GevurahSectionsApi gives structured post sections clear creation, scan, and mutation boundaries. */
export class GevurahSectionsApi extends YesodEndpointService {
	/** @param {string} yesodPostId @returns {string} Encoded post path. */
	postPath(yesodPostId) {
		return `/posts/${this.identity(yesodPostId)}`;
	}

	/** @param {string} yesodSectionId @returns {string} Encoded section path. */
	sectionPath(yesodSectionId) {
		return `/sections/${this.identity(yesodSectionId)}`;
	}

	/** @param {string} yesodPostId @returns {Promise<object>} Section list envelope. */
	list(yesodPostId) {
		return this.yesodClient.get(`${this.postPath(yesodPostId)}/sections`);
	}

	/** @param {string} yesodSectionId @returns {Promise<object>} Section envelope. */
	get(yesodSectionId) {
		return this.yesodClient.get(this.sectionPath(yesodSectionId));
	}

	/** @param {string} yesodPostId @param {object} malchusBody @returns {Promise<object>} Created section envelope. */
	create(yesodPostId, malchusBody) {
		return this.yesodClient.post(`${this.postPath(yesodPostId)}/sections`, malchusBody);
	}

	/** @param {string} yesodSectionId @param {object} malchusBody @returns {Promise<object>} Updated section envelope. */
	update(yesodSectionId, malchusBody) {
		return this.yesodClient.put(this.sectionPath(yesodSectionId), malchusBody);
	}

	/** @param {string} yesodSectionId @returns {Promise<object>} Removal envelope. */
	remove(yesodSectionId) {
		return this.yesodClient.delete(this.sectionPath(yesodSectionId));
	}

	/** @param {string} yesodPostId @param {object} chesedQuery @returns {Promise<object>} Verse-scan envelope. */
	verseScan(yesodPostId, chesedQuery = {}) {
		return this.yesodClient.get(this.query(`${this.postPath(yesodPostId)}/verse-scan`, chesedQuery));
	}

	/** @param {string} yesodPostId @param {object} chesedQuery @returns {Promise<object>} Source-scan envelope. */
	sourceScan(yesodPostId, chesedQuery = {}) {
		return this.yesodClient.get(this.query(`${this.postPath(yesodPostId)}/source-scan`, chesedQuery));
	}
}

/** @param {object} yesodClient @returns {GevurahSectionsApi} Section service. */
export function createSectionsApi(yesodClient) {
	return new GevurahSectionsApi(yesodClient);
}
