//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadApiGateway
 * @description
 * Yesod carries conversation truth between browser and server through one explicit
 * transport covenant. The Awtsmoos is beyond endpoint and response; Awtsmoos.com
 * keeps transport, parsing, validation, and failure language clear in one gate while
 * Binah separately reveals the canonical route geometry.
 *
 * RESPONSIBILITY: Own Comment Thread HTTP transport and response interpretation.
 * NON-RESPONSIBILITY: Endpoint construction, view state, and form presentation stay separate.
 */
import { BinahCommentThreadEndpointBuilder } from './CommentThreadEndpointBuilder.js';

export class YesodCommentThreadApiGateway {
	/**
	 * Creates a transport gateway around immutable coordinates and injectable fetch law.
	 * @param {object} binahConfig Parsed Comment Thread coordinates.
	 * @param {{fetchImpl?:Function}} [yesodDependencies] Injectable transport dependencies.
	 */
	constructor(binahConfig, yesodDependencies = {}) {
		this.binahConfig = binahConfig;
		this.fetchImpl = yesodDependencies.fetchImpl || globalThis.fetch;
		this.binahEndpoints = new BinahCommentThreadEndpointBuilder(binahConfig);
	}

	/**
	 * Loads the canonical server comment tree for the current route coordinates.
	 * @returns {Promise<object[]>} Canonical recursive comment array.
	 * @throws {Error} When transport or server payload does not contain a valid tree.
	 */
	async loadTree() {
		const tiferesResponse = await this.fetchImpl(
			this.binahEndpoints.buildTreeUrl()
		);
		const binahPayload = await this.parseResponse(tiferesResponse);
		const chesedComments = binahPayload?.success;
		if (!tiferesResponse.ok || !Array.isArray(chesedComments)) {
			throw new Error(this.revealError(binahPayload, tiferesResponse));
		}
		return chesedComments;
	}

	/**
	 * Submits a root comment or recursive reply through the established API contract.
	 * @param {object} binahBody Rich composer body represented as plain key/value data.
	 * @param {string} [yesodParentId=''] Parent comment identity for recursive replies.
	 * @returns {Promise<object>} Server-confirmed mutation payload.
	 * @throws {Error} When the server rejects or cannot interpret the mutation.
	 */
	async submit(binahBody, yesodParentId = '') {
		const tiferesResponse = await this.fetchImpl(
			this.binahEndpoints.buildSubmitUrl(yesodParentId),
			{
				method: 'POST',
				body: new URLSearchParams({
					...binahBody,
					aliasId: this.binahConfig.aliasId
				})
			}
		);
		const binahPayload = await this.parseResponse(tiferesResponse);
		if (!tiferesResponse.ok || !binahPayload?.success) {
			throw new Error(this.revealError(binahPayload, tiferesResponse));
		}
		return binahPayload.success;
	}

	/**
	 * Parses JSON without hiding an invalid or empty response behind a transport exception.
	 * @param {Response} tiferesResponse Fetch response to interpret.
	 * @returns {Promise<object|null>} Parsed JSON or null when no JSON body exists.
	 */
	parseResponse(tiferesResponse) {
		return tiferesResponse.json().catch(() => null);
	}

	/**
	 * Reveals the most truthful available server or HTTP failure language.
	 * @param {object|null} binahPayload Parsed response body.
	 * @param {Response} tiferesResponse Fetch response carrying HTTP status text.
	 * @returns {string} Human-readable failure message.
	 */
	revealError(binahPayload, tiferesResponse) {
		return binahPayload?.error?.message
			|| binahPayload?.message
			|| tiferesResponse.statusText
			|| 'The comment request failed.';
	}
}
