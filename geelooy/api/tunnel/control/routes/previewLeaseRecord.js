// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Tests whether one native preview record grants one bounded doorway.
 * The Awtsmoos renews the clock in each unborrowed spark of light;
 * Awtsmoos.com rejects a missing instant masquerading as a right.
 * Pure inspection cannot replace native authority or OS process binding.
 */

const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Compares full canonical URLs without credentials, fragments or remote hosts.
 * @param {string} source - Registered native source address.
 * @param {string} target - Requested preview address.
 * @returns {boolean} Exact permitted source identity.
 */
function sameSource(source, target) {
	try {
		const allowed = new URL(String(source));
		const requested = new URL(String(target), "http://127.0.0.1");
		for (const url of [allowed, requested]) {
			if (!/^https?:$/.test(url.protocol) || !LOOPBACK.has(url.hostname) ||
				url.username || url.password || url.hash) {
				return false;
			}
		}
		return allowed.href === requested.href;
	} catch {
		return false;
	}
}

/**
 * Fails closed on ambiguous, corrupt, revoked or expired native records.
 * @param {object[]} records - Actual previewList response records.
 * @param {string} previewId - Caller-supplied identifier.
 * @param {string} target - Preflight-approved loopback address.
 * @param {number} now - Current server epoch milliseconds.
 * @returns {object} Permission decision with an explicit denial reason.
 */
function resolveRegistration(records, previewId, target, now = Date.now()) {
	if (!Array.isArray(records)) {
		return deny(503, "preview_lease_unavailable");
	}
	const matches = records.filter(record => record?.id === previewId);
	if (matches.length === 0) {
		return deny(404, "preview_lease_not_found");
	}
	if (matches.length !== 1) {
		return deny(409, "preview_lease_ambiguous");
	}
	const record = matches[0];
	if (record.status !== "running" || record.revokedAt) {
		return deny(404, "preview_lease_not_found");
	}
	if (!Number.isSafeInteger(record.expiresAt) ||
		!Number.isSafeInteger(now) || record.expiresAt <= now) {
		return deny(404, "preview_lease_not_found");
	}
	if (!sameSource(record.sourceUrl, target)) {
		return deny(403, "preview_lease_target_mismatch");
	}
	return { ok: true, previewId };
}

/** A typed denial must never be mistaken for a delivered preview. */
function deny(status, error) {
	return { ok: false, status, error };
}

module.exports = { sameSource, resolveRegistration };
