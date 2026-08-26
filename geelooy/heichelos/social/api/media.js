// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** YesodMediaApi keeps attachment manifests and cue metadata beneath one stable media foundation. */
export class YesodMediaApi extends YesodEndpointService {
	/** @param {string} yesodPostId @returns {string} Encoded post path. */
	postPath(yesodPostId) {
		return `/posts/${this.identity(yesodPostId)}`;
	}

	/** @param {string} yesodMediaId @returns {string} Encoded media path. */
	mediaPath(yesodMediaId) {
		return `/media/${this.identity(yesodMediaId)}`;
	}

	/** @param {string} yesodPostId @returns {Promise<object>} Attachment list. */
	attachments(yesodPostId) {
		return this.yesodClient.get(`${this.postPath(yesodPostId)}/attachments`);
	}

	/** @param {string} yesodPostId @param {object} malchusBody @returns {Promise<object>} Added attachment. */
	addAttachment(yesodPostId, malchusBody) {
		return this.yesodClient.post(`${this.postPath(yesodPostId)}/attachments`, malchusBody);
	}

	/** @param {string} yesodMediaId @returns {Promise<object>} Removal envelope. */
	removeAttachment(yesodMediaId) {
		return this.yesodClient.delete(this.mediaPath(yesodMediaId));
	}

	/** @param {string} yesodMediaId @returns {Promise<object>} Audio manifest. */
	audioManifest(yesodMediaId) {
		return this.yesodClient.get(`${this.mediaPath(yesodMediaId)}/audio-manifest`);
	}

	/** @param {string} yesodMediaId @returns {Promise<object>} Waveform data. */
	waveform(yesodMediaId) {
		return this.yesodClient.get(`${this.mediaPath(yesodMediaId)}/waveform`);
	}

	/** @param {string} yesodMediaId @returns {Promise<object>} Slideshow manifest. */
	slideshowManifest(yesodMediaId) {
		return this.yesodClient.get(`${this.mediaPath(yesodMediaId)}/slideshow-manifest`);
	}

	/** @param {string} yesodMediaId @param {object} malchusBody @returns {Promise<object>} Cue creation envelope. */
	cue(yesodMediaId, malchusBody) {
		return this.yesodClient.post(`${this.mediaPath(yesodMediaId)}/cues`, malchusBody);
	}
}

/** @param {object} yesodClient @returns {YesodMediaApi} Media service. */
export function createMediaApi(yesodClient) {
	return new YesodMediaApi(yesodClient);
}
