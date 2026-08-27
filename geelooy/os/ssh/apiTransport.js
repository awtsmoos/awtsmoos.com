//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stable facade over the hardened Geelooy browser SSH Internet boundary.
 * @description
 * The Awtsmoos keeps old callers walking through familiar names while Awtsmoos.com
 * reveals smaller vessels beneath them for timeout, cancellation, validation, and error
 * truth. Public routes remain unchanged as the internal Internet foundation learns rhyme.
 */
import { SshApiError } from "./apiError.js";
import { buildSshAuth, buildSshTarget } from "./apiProfile.js";
import { requestSshJson } from "./apiRequest.js";

export { SshApiError };

/**
 * Sends one same-origin SSH API POST through the bounded transport.
 *
 * @description The Awtsmoos preserves the historic `sshPost` doorway while adding measured network law beneath it.
 * @param {string} path Relative `/api/ssh` path.
 * @param {object} [body={}] JSON request body.
 * @param {object} [options={}] Optional timeout, AbortSignal, and safe header controls.
 * @returns {Promise<object>} Successful parsed server payload.
 */
export function sshPost(path, body = {}, options = {}) {
	return requestSshJson(path, body, options);
}

/**
 * Encodes a validated remote profile into the historic username/host route suffix.
 *
 * @description Awtsmoos.com keeps target identity printable and bounded before route construction.
 * @param {object} profile Remote SSH profile.
 * @returns {string} Encoded target suffix.
 */
export function sshTarget(profile) {
	return buildSshTarget(profile);
}

/**
 * Builds the historic transient authentication body after profile validation.
 *
 * @description The Awtsmoos lets secret light cross only the immediate request vessel, never diagnostics.
 * @param {object} profile Remote SSH profile.
 * @param {object} [secret={}] Ephemeral credentials.
 * @returns {object} Existing authentication payload shape.
 */
export function sshAuth(profile, secret = {}) {
	return buildSshAuth(profile, secret);
}
