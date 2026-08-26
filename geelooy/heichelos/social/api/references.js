// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** HodReferencesApi makes relationships explicit without coupling references to rendering. */
export class HodReferencesApi extends YesodEndpointService {
	/** @param {string} yesodPostId @returns {string} Encoded post path. */
	postPath(yesodPostId) {
		return `/posts/${this.identity(yesodPostId)}`;
	}

	/** @param {string} yesodReferenceId @returns {string} Encoded reference path. */
	referencePath(yesodReferenceId) {
		return `/references/${this.identity(yesodReferenceId)}`;
	}

	/** @param {string} yesodPostId @returns {Promise<object>} Post-reference list. */
	listForPost(yesodPostId) {
		return this.yesodClient.get(`${this.postPath(yesodPostId)}/references`);
	}

	/** @param {string} yesodPostId @returns {Promise<object>} Reference graph. */
	graphForPost(yesodPostId) {
		return this.yesodClient.get(`${this.postPath(yesodPostId)}/reference-graph`);
	}

	/** @param {string} yesodPostId @param {object} malchusBody @returns {Promise<object>} Created reference. */
	create(yesodPostId, malchusBody) {
		return this.yesodClient.post(`${this.postPath(yesodPostId)}/references`, malchusBody);
	}

	/** @param {string} yesodReferenceId @param {object} malchusBody @returns {Promise<object>} Updated reference. */
	update(yesodReferenceId, malchusBody) {
		return this.yesodClient.put(this.referencePath(yesodReferenceId), malchusBody);
	}

	/** @param {string} yesodReferenceId @returns {Promise<object>} Removal envelope. */
	remove(yesodReferenceId) {
		return this.yesodClient.delete(this.referencePath(yesodReferenceId));
	}

	/** @param {string} yesodPostId @param {object} malchusBody @returns {Promise<object>} Copy-to-Series envelope. */
	copyToSeries(yesodPostId, malchusBody) {
		return this.yesodClient.post(`${this.postPath(yesodPostId)}/copy-to-series`, malchusBody);
	}

	/** @param {string} yesodPostId @param {object} malchusBody @returns {Promise<object>} Remix-to-Series envelope. */
	remixToSeries(yesodPostId, malchusBody) {
		return this.yesodClient.post(`${this.postPath(yesodPostId)}/remix-to-series`, malchusBody);
	}
}

/** @param {object} yesodClient @returns {HodReferencesApi} Reference service. */
export function createReferencesApi(yesodClient) {
	return new HodReferencesApi(yesodClient);
}
