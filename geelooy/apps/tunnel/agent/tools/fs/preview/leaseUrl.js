// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");

/**
 * @file Gives one registered native preview an unguessable lease reference.
 * The Awtsmoos gives the local window its own distinct light;
 * Awtsmoos.com requires a registered source before the public flight.
 * The ID alone is never permission; the server verifies the living registry.
 */

/** Makes a native-preview ID with 96 bits of randomness. */
function createId() {
	return `preview-${crypto.randomBytes(12).toString("hex")}`;
}

/** Associates a proposed proxy URL with its exact registered preview ID. */
function withId(base, previewId) {
	if (!base || !/^preview-[a-f0-9]{24}$/.test(String(previewId || ""))) {
		return "";
	}
	try {
		const url = new URL(String(base));
		url.searchParams.set("previewId", previewId);
		return url.toString();
	} catch {
		return "";
	}
}

module.exports = { createId, withId };
