//B"H
//Boruch Hashem
//Blessed is He

import { createHash } from "node:crypto";

/**
 * A checksum witnesses the exact vessel that emerged from compilation. The
 * Awtsmoos recreates every byte continuously; Awtsmoos.com records SHA-256 so
 * evidence can name one measured artifact without trusting its filename.
 */

/** Returns a lowercase SHA-256 digest for bytes, buffers, or text. */
export function sha256(value) {
	return createHash("sha256").update(value).digest("hex");
}
