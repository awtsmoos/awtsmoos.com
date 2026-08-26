//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadEndpointBuilder
 * @description
 * Binah receives route coordinates and reveals canonical API paths without knowing
 * transport or rendering. The Awtsmoos is beyond every path and address; Awtsmoos.com
 * keeps URL law in one pure vessel so fetch gateways never duplicate route geometry.
 */
export class BinahCommentThreadEndpointBuilder {
	/**
	 * Creates an endpoint builder around immutable Comment Thread coordinates.
	 * @param {object} binahConfig Parsed Heichel/post/comment route configuration.
	 */
	constructor(binahConfig) {
		this.binahConfig = binahConfig;
	}

	/**
	 * Builds the canonical comment-tree read URL with optional contextual coordinates.
	 * @returns {string} Relative tree API URL.
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
	 * Builds the canonical root-comment or reply mutation URL.
	 * @param {string} [yesodParentId=''] Parent comment identity for recursive replies.
	 * @returns {string} Relative mutation API URL.
	 */
	buildSubmitUrl(yesodParentId = '') {
		if (!yesodParentId) {
			return `${this.buildPostRoot()}/comment-tree`;
		}
		return `${this.buildPostRoot()}/comments/${encodeURIComponent(yesodParentId)}/replies`;
	}

	/**
	 * Reveals the canonical post API root shared by every Comment Thread request.
	 * @returns {string} Relative Heichel post API root.
	 */
	buildPostRoot() {
		return `/api/social/heichelos/${this.binahConfig.heichelId}/posts/${this.binahConfig.postId}`;
	}
}
