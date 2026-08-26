//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadApiGateway
 * @description
 * Yesod carries conversation truth between browser and server through one explicit
 * transport covenant. The Awtsmoos is beyond endpoint and response; Awtsmoos.com
 * keeps URL construction, parsing, validation, and failure language clear in one gate.
 *
 * RESPONSIBILITY: Own Comment Thread HTTP transport and response interpretation.
 * NON-RESPONSIBILITY: View state and form presentation belong to higher UI vessels.
 */

export class YesodCommentThreadApiGateway {
	/**
	 * Creates a transport gateway around one immutable route configuration.
	 * @param {object} binahConfig Parsed Comment Thread coordinates.
	 * @param {{fetchImpl?:Function}} [yesodDependencies] Injectable transport dependencies.
	 */
	constructor(binahConfig, yesodDependencies = {}) {
		this.binahConfig = binahConfig;
		this.fetchImpl = yesodDependencies.fetchImpl || globalThis.fetch;
	}

	/**
	 * Loads the canonical server comment tree for the current route coordinates.
	 * @returns {Promise<object[]>} Canonical recursive comment array.
	 * @throws {Error} When transport or server payload does not contain a valid tree.
	 */
	async loadTree() {
		const tiferesResponse = await this.fetchImpl(this.buildTreeUrl());
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
			this.buildSubmitUrl(yesodParentId),
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
	 * Builds the read endpoint with optional verse/subsection coordinates.
	 * @returns {string} Relative canonical comment-tree URL.
	 */
	buildTreeUrl() {
		const yesodQuery = new URLSearchParams();
		if (this.binahConfig.verseSection) {
			yesodQuery.set('verseSection', this.binahConfig.verseSection);
		}
		if (this.binahConfig.subsectionId) {
			yesodQuery.set('subsectionId', this.binahConfig.subsectionId);
		}
		const tiferesSuffix = yesodQuery.size ? `?${yesodQuery}` : '';
		return `${this.buildPostRoot()}/comment-tree${tiferesSuffix}`;
	}

	/**
	 * Builds the mutation endpoint for roots or replies without duplicating route law.
	 * @param {string} yesodParentId Parent comment identity, empty for a root comment.
	 * @returns {string} Relative canonical mutation URL.
	 */
	buildSubmitUrl(yesodParentId) {
		if (!yesodParentId) {
			return `${this.buildPostRoot()}/comment-tree`;
		}
		return `${this.buildPostRoot()}/comments/${encodeURIComponent(yesodParentId)}/replies`;
	}

	/**
	 * Reveals the canonical API root for the configured Heichel post.
	 * @returns {string} Relative API root shared by read and write endpoints.
	 */
	buildPostRoot() {
		return `/api/social/heichelos/${this.binahConfig.heichelId}/posts/${this.binahConfig.postId}`;
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
