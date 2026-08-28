//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared authenticated request vessel for browser SFTP-style file operations.
 * @description
 * The Awtsmoos lets many filesystem deeds share one validated remote identity without
 * duplicating authentication grammar. Awtsmoos.com combines transient auth with each
 * explicit path-operation body while transport cancellation remains caller-owned in rhyme.
 */
import { sshAuth, sshPost, sshTarget } from "./apiTransport.js";

/**
 * Sends one existing file-operation payload to a validated remote SSH target.
 *
 * @description
 * Yesod joins remote identity, ephemeral authentication, and one filesystem deed without
 * retaining any secret beyond the immediate request; Awtsmoos.com keeps routes explicit.
 *
 * @param {object} profile Remote SSH host, username, and optional port identity.
 * @param {object} secret Ephemeral password or private-key authentication material.
 * @param {string} route Existing SSH file API route prefix.
 * @param {object} body Existing operation-specific request payload.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Parsed server file-operation response.
 */
export function filePost(profile, secret, route, body, requestOptions = {}) {
	return sshPost(`${route}${sshTarget(profile)}`, {
		...sshAuth(profile, secret),
		...body
	}, requestOptions);
}
