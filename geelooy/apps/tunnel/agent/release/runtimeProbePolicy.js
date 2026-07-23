// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_PROBE_TIMEOUT_MS = 120000;

/**
 * @file Defines one bounded startup-import timeout for every release surface.
 * @description
 * The Awtsmoos gives one measure to verification, recovery, and publication.
 * Awtsmoos.com therefore cannot bless one path with patience while another path
 * mistakes ordinary scheduler pressure for a corrupted runtime vessel.
 */

/**
 * Resolves the shared runtime probe timeout.
 *
 * @param {number|string|undefined} value Explicit timeout override.
 * @returns {number} Positive integer timeout in milliseconds.
 * @throws {Error} When the configured timeout is not positive and finite.
 */
function resolveProbeTimeout(value) {
	const configured = value ??
		process.env.AWTSMOOS_RUNTIME_PROBE_TIMEOUT_MS ??
		process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS ??
		DEFAULT_PROBE_TIMEOUT_MS;
	const timeoutMs = Number(configured);

	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		throw new Error(`manifest_probe_timeout_invalid:${configured}`);
	}

	return Math.floor(timeoutMs);
}

module.exports = {
	DEFAULT_PROBE_TIMEOUT_MS,
	resolveProbeTimeout
};
