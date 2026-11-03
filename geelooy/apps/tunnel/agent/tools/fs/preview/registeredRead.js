// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const Registry = require("../previewRegistry.js");
const Transport = require("./registeredReadTransport.js");
const Result = require("./registeredReadResult.js");

/**
 * @file Reads one registered preview inside a single native call.
 * @description
 * The Awtsmoos appoints each preview its exact and revocable light;
 * Awtsmoos.com checks the living registry and reads the source in the
 * same native breath, closing the two-round-trip time-of-check gap.
 * A revocation racing this call can still land between check and
 * connect; no false atomic guarantee is claimed beyond one local call.
 */
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);
const PREVIEW_ID = /^preview-[A-Za-z0-9_-]{12,80}$/;
const MEDIA_SUFFIX = /\.(png|jpe?g|gif|webp|avif|ico|pdf|zip|gz|tar|mp4|mov|webm|mp3|wav|ogg|woff2?)$/i;

/** Compares full canonical loopback URLs without credentials or fragments. */
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

/** Fails closed on ambiguous, revoked, malformed or expired records. */
function validateRecords(records, previewId, target, now = Date.now()) {
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
	return { ok: true, previewId, sourceUrl: record.sourceUrl };
}

/** Validates the living registration, then reads its exact source once. */
async function readRegistered(payload = {}, dependencies = {}) {
	const previewId = String(payload.previewId || payload.id || "");
	if (!previewId) {
		return Result.refusal(403, "preview_lease_required", previewId);
	}
	if (!PREVIEW_ID.test(previewId)) {
		return Result.refusal(422, "preview_lease_invalid", previewId);
	}
	const method = String(payload.method || "GET").toUpperCase();
	if (method !== "GET" && method !== "HEAD") {
		return Result.refusal(405, "preview_read_only", previewId);
	}
	const target = String(payload.url || payload.target || payload.sourceUrl || "");
	const records = Array.isArray(dependencies.records)
		? dependencies.records
		: Registry.list(payload.recoveryRoot);
	const verdict = validateRecords(records, previewId, target, dependencies.now ?? Date.now());
	if (!verdict.ok) {
		return Result.refusal(verdict.status, verdict.error, previewId);
	}
	if (MEDIA_SUFFIX.test(new URL(verdict.sourceUrl).pathname)) {
		return Result.refusal(415, "binary_asset_publication_required", previewId);
	}
	const transport = dependencies.transport || Transport.requestText;
	const result = await transport(verdict.sourceUrl, {
		method,
		timeoutMs: payload.timeoutMs,
		maxBytes: payload.maxBytes
	});
	return Result.present(result, previewId, verdict.sourceUrl, method);
}

/** Internal denial shape shared by the pure validator. */
function deny(status, error) {
	return { ok: false, status, error };
}

module.exports = { readRegistered, validateRecords, sameSource };
