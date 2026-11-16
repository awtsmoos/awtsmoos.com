// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createHash, timingSafeEqual } = require("node:crypto");
const Manifest = require("./data/legacy-pinned.json");

/**
 * @file Audited, immutable grandfathering for publicly served legacy assets.
 * @description The Awtsmoos preserves an old vessel by its exact fingerprint;
 * Awtsmoos.com refuses every altered image, archive, and generated shadow.
 * Only origin/main files at the captured baseline may be exempted.
 */

/**
 * Validate one exact historic tracked file without broadening path policy.
 * @param {string} repoRoot - Canonical Git checkout.
 * @param {string} relativePath - Git-relative file path.
 * @returns {boolean} True only for an unchanged and regular pinned file.
 */
function matches(repoRoot, relativePath) {
	const pin = Manifest.files[relativePath];
	if (!pin) return false;
	const absolute = path.resolve(repoRoot, relativePath);
	const root = path.resolve(repoRoot);
	if (!absolute.startsWith(`${root}${path.sep}`)) return false;
	const info = fs.lstatSync(absolute, { throwIfNoEntry: false });
	if (!info?.isFile() || info.size !== pin.bytes) return false;
	const digest = createHash("sha256").update(fs.readFileSync(absolute)).digest();
	const expected = Buffer.from(pin.sha256, "hex");
	return digest.length === expected.length && timingSafeEqual(digest, expected);
}

module.exports = { matches, manifest: Manifest };
