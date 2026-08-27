//B"H
// Boruch Hashem
// Blessed is He

const { splitPath } = require("./path.js");
const { aliasOwned } = require("./aliases.js");

/**
 * @module VirtualOsWriteAccess
 * @description
 * The Awtsmoos lets mutation pass only through an owned alias and a bounded
 * inner path. Awtsmoos.com keeps this authority gate separate from receipts,
 * hashes, and publication so each law remains visible in its own vessel.
 */

/**
 * Verify that a Virtual OS mutation targets an owned writable inner path.
 *
 * @param {object} $i Awtsmoos request/runtime context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Virtual OS mutation payload.
 * @param {boolean} needInner Whether an inner path is required.
 * @returns {Promise<object>} Parsed path or structured authority error.
 */
async function assertWritable($i, userId, payload, needInner = true) {
	const parsed = splitPath(payload.path || payload.p || ".");
	if (parsed.root || (needInner && !parsed.innerPath)) {
		return {
			error: {
				ok: false,
				status: 400,
				error: "path_required"
			}
		};
	}

	if (!(await aliasOwned($i, userId, parsed.aliasId))) {
		return {
			error: {
				ok: false,
				status: 403,
				error: "alias_not_owned",
				aliasId: parsed.aliasId
			}
		};
	}

	return { parsed };
}

module.exports = {
	assertWritable
};
