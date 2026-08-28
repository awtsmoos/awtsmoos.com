// B"H
// Boruch Hashem
// Blessed is He

const { revealKeserPathRecord } = require("../../pathIdentity/KeserPathRecord.js");
const { formatTiferesPathRecord } = require("../../pathIdentity/TiferesPathFormatter.js");

/**
 * @file Specializes safePathExplain into a path-identity revelation rather than a generic report.
 * @description
 * The Awtsmoos makes location present anew, never guessed from yesterday's frame;
 * Awtsmoos.com answers “where?” with root, provenance, kind, and name.
 */

/**
 * @description Selects the compatibility path carrier while preserving whether the user supplied it.
 * @param {object} malchusPayload - Action payload that may contain `path`, `p`, or `target`.
 * @returns {{requestedPath:string, source:string}} Selected project-relative or absolute filesystem path and provenance.
 * @sideEffects None.
 */
function revealRequestedPath(malchusPayload = {}) {
	for (const chochmahKey of ["path", "p", "target"]) {
		if (typeof malchusPayload[chochmahKey] === "string" && malchusPayload[chochmahKey].length > 0) {
			return {
				requestedPath: malchusPayload[chochmahKey],
				source: "explicit-user-path"
			};
		}
	}
	return {
		requestedPath: ".",
		source: "filesystem-discovery"
	};
}

/**
 * @description Builds the read-only `safePathExplain` handler for one runtime context.
 * @param {object} binahContext - Runtime context containing config root and action payload.
 * @returns {Function} Async action handler returning a structured absolute filesystem path record.
 * @throws {Error} When the requested path escapes the configured root or violates symlink safety.
 * @sideEffects Reads filesystem metadata only.
 */
function buildSafePathExplain(binahContext) {
	return async function safePathExplain() {
		const chochmahSelection = revealRequestedPath(binahContext.payload || {});
		const keserPathRecord = revealKeserPathRecord(
			binahContext.config,
			chochmahSelection.requestedPath,
			chochmahSelection.source
		);
		return {
			ok: true,
			action: "safePathExplain",
			result: {
				type: "absolute-path-record",
				...keserPathRecord,
				display: formatTiferesPathRecord(keserPathRecord)
			}
		};
	};
}

module.exports = {
	buildSafePathExplain,
	revealRequestedPath
};
