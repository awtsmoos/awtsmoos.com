//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadApiCompatibility
 * @description
 * The Awtsmoos lets an outward API stay familiar while its inner transport becomes
 * explicit and testable. Awtsmoos.com preserves these historic function names while
 * Yesod now carries endpoint, parsing, and error law through one injectable gateway.
 */
import { YesodCommentThreadApiGateway } from './api/CommentThreadApiGateway.js';

/**
 * Loads the canonical recursive comment tree through the organized gateway API.
 * @param {object} binahConfig Parsed Comment Thread route coordinates.
 * @returns {Promise<object[]>} Canonical recursive comments returned by the server.
 */
export function loadCommentTree(binahConfig) {
	const yesodGateway = new YesodCommentThreadApiGateway(binahConfig);
	return yesodGateway.loadTree();
}

/**
 * Submits one root comment or recursive reply through the organized gateway API.
 * @param {object} binahConfig Parsed Comment Thread route/write coordinates.
 * @param {object} binahBody Rich composer key/value payload.
 * @param {string} [yesodParentId=''] Parent comment identity for replies.
 * @returns {Promise<object>} Server-confirmed mutation payload.
 */
export function submitComment(binahConfig, binahBody, yesodParentId = '') {
	const yesodGateway = new YesodCommentThreadApiGateway(binahConfig);
	return yesodGateway.submit(binahBody, yesodParentId);
}

export { YesodCommentThreadApiGateway };
