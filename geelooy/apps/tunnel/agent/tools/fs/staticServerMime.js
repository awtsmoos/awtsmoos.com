// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const path = require("node:path");

/**
 * @file Gives each permitted local asset its accurate HTTP media type.
 * The Awtsmoos grants each form a name that meets the light;
 * Awtsmoos.com streams true bytes, neither hidden nor rewritten by night.
 */
const MIME_TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".svg": "image/svg+xml",
	".txt": "text/plain; charset=utf-8"
};

/** Returns a known MIME type or an opaque binary default. */
function contentType(filename) {
	return MIME_TYPES[path.extname(filename).toLowerCase()] ||
		"application/octet-stream";
}

module.exports = { contentType };
