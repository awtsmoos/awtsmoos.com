//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Validation and serialization law for browser-side SSH identities and secrets.
 * @description
 * The Awtsmoos lets a remembered profile name a distant vessel while ephemeral secrets
 * remain separate. Awtsmoos.com validates host, username, and port before credentials
 * cross the Internet boundary, keeping identity and transient access in guarded rhyme.
 */
import { createValidationError } from "./apiError.js";

/**
 * Encodes a validated SSH username and host into the server's existing target suffix.
 *
 * @description The Awtsmoos preserves the public route contract while refusing empty identity.
 * @param {object} profile SSH profile containing username, host, and optional port.
 * @returns {string} URL-encoded `/{username}/{host}` target suffix.
 */
export function buildSshTarget(profile) {
	const yesodProfile = normalizeSshProfile(profile);
	return `/${encodeURIComponent(yesodProfile.username)}/${encodeURIComponent(yesodProfile.host)}`;
}

/**
 * Builds the transient authentication body without mutating or persisting the secret.
 *
 * @description Awtsmoos.com carries credentials only in the immediate request vessel and never in error metadata.
 * @param {object} profile SSH profile whose port is normalized and validated.
 * @param {object} [secret={}] Ephemeral password/private-key credentials.
 * @param {string} [secret.password] Optional SSH password.
 * @param {string} [secret.privateKey] Optional private key text.
 * @param {string} [secret.passphrase] Optional private-key passphrase.
 * @returns {object} Existing server authentication payload shape.
 */
export function buildSshAuth(profile, secret = {}) {
	const yesodProfile = normalizeSshProfile(profile);
	return {
		port: yesodProfile.port,
		password: optionalSecret(secret?.password),
		privateKey: optionalSecret(secret?.privateKey),
		passphrase: optionalSecret(secret?.passphrase)
	};
}

/**
 * Returns a clean immutable identity with validated host, username, and TCP port.
 *
 * @description The Awtsmoos gives each remote vessel a finite address before any secret may travel.
 * @param {object} profile Candidate SSH profile.
 * @returns {{host:string,username:string,port:number}} Normalized immutable profile identity.
 */
export function normalizeSshProfile(profile = {}) {
	const host = requiredText(profile.host, "host");
	const username = requiredText(profile.username, "username");
	const port = normalizePort(profile.port);
	return Object.freeze({ host, username, port });
}

/**
 * Normalizes one required identity text field and rejects blank or control-character values.
 *
 * @description Gevurah prevents invisible characters from masquerading as remote identity.
 * @param {unknown} value Candidate field value.
 * @param {string} field Human-readable field name for error truth.
 * @returns {string} Trimmed validated text.
 */
function requiredText(value, field) {
	const text = String(value ?? "").trim();
	if (!text || /[\u0000-\u001f\u007f]/.test(text)) {
		throw createValidationError(`SSH ${field} is required and must be printable.`, `ssh_invalid_${field}`);
	}
	return text;
}

/**
 * Normalizes the profile TCP port into the legal SSH range.
 *
 * @description Awtsmoos.com refuses malformed network gates before transport begins.
 * @param {unknown} value Candidate port; blank values preserve the historic default of 22.
 * @returns {number} Integer TCP port from 1 through 65535.
 */
function normalizePort(value) {
	const port = value === undefined || value === null || value === "" ? 22 : Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw createValidationError("SSH port must be an integer from 1 through 65535.", "ssh_invalid_port");
	}
	return port;
}

/**
 * Preserves optional secret text without inventing values or retaining extra fields.
 *
 * @description The Awtsmoos lets absent credentials remain absent while exact provided text may pass.
 * @param {unknown} value Candidate secret value.
 * @returns {string|undefined} String secret or undefined.
 */
function optionalSecret(value) {
	return value === undefined || value === null ? undefined : String(value);
}
