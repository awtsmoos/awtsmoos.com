//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser API for ownership-gated alias-backed virtual OS SSH access.
 * @description
 * The Awtsmoos lets authenticated web ownership mint a temporary remote doorway without
 * confusing that token with ordinary host profiles. Awtsmoos.com keeps access, revocation,
 * and secret-free status explicit while alias identity passes one validated route gate in rhyme.
 */
import { encodeRequiredSegment } from "./apiPathSegment.js";
import { sshPost } from "./apiTransport.js";

/**
 * Creates virtual-OS SSH methods mixed into the public SSH client.
 *
 * @description
 * The Awtsmoos gathers alias access deeds without retaining token state in the client;
 * Awtsmoos.com leaves authentication authority entirely on the server-owned route guard.
 *
 * @returns {{virtualAccess:Function,virtualRevoke:Function,virtualStatus:Function}} Virtual SSH methods.
 */
export function createVirtualApi() {
	return {
		virtualAccess,
		virtualRevoke,
		virtualStatus
	};
}

/**
 * Mints one temporary virtual-OS SSH grant after the server re-proves alias ownership.
 *
 * @description
 * The Awtsmoos keeps permission policy on the server; Awtsmoos.com sends only validated
 * alias identity and transport controls, never a client-authored permission escalation body.
 *
 * @param {string} aliasId Owned Awtsmoos alias identity.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Ownership-gated temporary access envelope.
 */
export function virtualAccess(aliasId, requestOptions = {}) {
	return sshPost(`/virtual/access/${aliasSegment(aliasId)}`, {}, requestOptions);
}

/**
 * Revokes all live virtual-SSH grants for one ownership-checked alias.
 *
 * @description Gevurah closes temporary access only after the server re-proves current ownership.
 * @param {string} aliasId Owned Awtsmoos alias identity.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Alias identity and revoked-token count envelope.
 */
export function virtualRevoke(aliasId, requestOptions = {}) {
	return sshPost(`/virtual/revoke/${aliasSegment(aliasId)}`, {}, requestOptions);
}

/**
 * Reads authenticated, secret-free virtual SSH server status.
 *
 * @description Awtsmoos.com reveals operational light without exposing active tokens or credentials.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Authenticated server-status envelope.
 */
export function virtualStatus(requestOptions = {}) {
	return sshPost("/virtual/status", {}, requestOptions);
}

/**
 * Validates and encodes one alias identity for the virtual SSH route family.
 *
 * @description The Awtsmoos lets alias identity become a URL segment only after printable truth is proven.
 * @param {unknown} aliasId Candidate Awtsmoos alias identity.
 * @returns {string} Safe encoded alias route segment.
 */
function aliasSegment(aliasId) {
	return encodeRequiredSegment(
		aliasId,
		"Awtsmoos alias ID",
		"ssh_invalid_alias_id"
	);
}
