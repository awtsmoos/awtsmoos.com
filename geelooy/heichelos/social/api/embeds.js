// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** YesodEmbedsApi keeps sandboxed embedded-app manifests behind one explicit transport boundary. */
export class YesodEmbedsApi extends YesodEndpointService {
	/** @param {string} yesodEmbedId @returns {string} Encoded embed path. */
	embedPath(yesodEmbedId) {
		return `/embeds/${this.identity(yesodEmbedId)}`;
	}

	/** @param {object} malchusBody @returns {Promise<object>} Iframe-app creation envelope. */
	iframeApp(malchusBody) {
		return this.yesodClient.post('/embeds/iframe-app', malchusBody);
	}

	/** @param {object} malchusBody @returns {Promise<object>} Code-app manifest creation envelope. */
	codeAppManifest(malchusBody) {
		return this.yesodClient.post('/embeds/code-app-manifest', malchusBody);
	}

	/** @param {string} yesodEmbedId @returns {Promise<object>} Embed envelope. */
	get(yesodEmbedId) {
		return this.yesodClient.get(this.embedPath(yesodEmbedId));
	}

	/** @param {string} yesodEmbedId @param {object} malchusBody @returns {Promise<object>} Updated embed. */
	update(yesodEmbedId, malchusBody) {
		return this.yesodClient.put(this.embedPath(yesodEmbedId), malchusBody);
	}

	/** @param {string} yesodEmbedId @returns {Promise<object>} Removal envelope. */
	remove(yesodEmbedId) {
		return this.yesodClient.delete(this.embedPath(yesodEmbedId));
	}
}

/** @param {object} yesodClient @returns {YesodEmbedsApi} Embed service. */
export function createEmbedsApi(yesodClient) {
	return new YesodEmbedsApi(yesodClient);
}
