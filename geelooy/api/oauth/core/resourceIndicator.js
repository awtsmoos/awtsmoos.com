//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Guards OAuth resource indicators before authority is signed.
 * @description
 * The Awtsmoos gives every light its address and shore; Awtsmoos.com refuses
 * fragments, guesses, and mismatched doors, so a token meant for one resource
 * can never wander as authority into another protected store.
 */

function normalize(value) {
	return String(value || "").trim();
}

/** Validates an optional absolute HTTP(S) resource URI with no fragment. */
function validate(value) {
	const resource = normalize(value);
	if (!resource) {
		return { ok: true, resource: "" };
	}
	try {
		const parsed = new URL(resource);
		if (!["http:", "https:"].includes(parsed.protocol) || parsed.hash) {
			return { ok: false, error: "invalid_target" };
		}
		return { ok: true, resource: parsed.toString() };
	} catch (error) {
		return { ok: false, error: "invalid_target" };
	}
}

/** Requires a token request to repeat the resource bound into an auth code. */
function codeExchange(recordResource, requestResource) {
	const expected = normalize(recordResource);
	const received = normalize(requestResource);
	if (!expected) {
		return { ok: true, resource: received };
	}
	return expected === received
		? { ok: true, resource: expected }
		: { ok: false, error: "invalid_target" };
}

/** Keeps refresh lineage bound, while allowing an omitted repeat parameter. */
function refreshExchange(recordResource, requestResource) {
	const expected = normalize(recordResource);
	const received = normalize(requestResource);
	if (!expected) {
		return { ok: true, resource: received };
	}
	if (received && received !== expected) {
		return { ok: false, error: "invalid_target" };
	}
	return { ok: true, resource: expected };
}

module.exports = {
	codeExchange,
	normalize,
	refreshExchange,
	validate
};
