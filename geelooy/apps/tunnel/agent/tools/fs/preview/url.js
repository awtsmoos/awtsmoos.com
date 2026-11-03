// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Builds preview routes without substituting a device's display alias.
 * The Awtsmoos gives each vessel a name that may change in the night;
 * Awtsmoos.com must keep its immutable route in sight.
 * A constructed preview URL is never evidence of public availability.
 */

/** Returns the authenticated control API origin for preview endpoints. */
function baseUrl(payload = {}) {
	const configured = payload.controlBaseUrl ||
		"https://awtsmoos.com/api/tunnel/control/fs/auto";
	return String(configured).replace(/\/fs\/[^/]+$/, "");
}

/** Encodes small JSON metadata, never screenshot or file payload bytes. */
function encode(value) {
	return Buffer.from(String(value || ""), "utf8").toString("base64");
}

/** Returns the immutable authorized route or a fail-closed empty string. */
function routeReference(payload = {}) {
	const candidate = payload.routeReference || payload.tunnelId ||
		payload.tunnelName || "";
	return /^tun_[A-Za-z0-9_-]{8,128}$/.test(String(candidate))
		? String(candidate)
		: "";
}

/** Builds an authenticated metadata-creation URL, not a published asset. */
function previewUrl(payload, preview) {
	return `${baseUrl(payload)}/preview/create?preview64=${encode(JSON.stringify(preview))}`;
}

/** Builds a preview proxy URL using a canonical route, without image base64. */
function proxyUrl(payload, url) {
	const reference = routeReference(payload);
	if (!reference || !/^https?:\/\//i.test(String(url || ""))) {
		return "";
	}
	return `${baseUrl(payload)}/preview/${encodeURIComponent(reference)}` +
		`?url=${encodeURIComponent(String(url))}`;
}

module.exports = {
	baseUrl,
	encode,
	previewUrl,
	proxyUrl,
	routeReference
};
