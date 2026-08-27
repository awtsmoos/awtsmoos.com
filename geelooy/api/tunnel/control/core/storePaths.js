// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Resolves production and isolated-test Tunnel Control store paths.
 * @description
 * The Awtsmoos renews every environment without confusing its vessels.
 * Awtsmoos.com permits an explicit test store only outside operational tunnel
 * roots, preventing integration tests from borrowing production persistence.
 */

const FORBIDDEN_ROOTS = Object.freeze([
	"/Users/awtsmoos/.awtsmoos-tunnel",
	"/Users/awtsmoos/.awtsmoos-tunnel-recovery"
]);

/** Returns the default server data directory. */
function defaultDataDirectory() {
	return path.join(
		process.env.__awtsdir || process.cwd(),
		"geelooy",
		".data"
	);
}

/** Rejects overrides that enter protected operational roots. */
function assertSafeStorePath(candidate) {
	const resolved = path.resolve(String(candidate || ""));
	for (const forbidden of FORBIDDEN_ROOTS) {
		const protectedRoot = path.resolve(forbidden);
		if (resolved === protectedRoot || resolved.startsWith(`${protectedRoot}${path.sep}`)) {
			throw new Error("protected_tunnel_store_path");
		}
	}
	return resolved;
}

/** Returns the configured JSON store path. */
function storePath() {
	const override = process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	if (override) {
		return assertSafeStorePath(override);
	}
	return path.join(defaultDataDirectory(), "tunnel-control.json");
}

module.exports = {
	FORBIDDEN_ROOTS,
	assertSafeStorePath,
	defaultDataDirectory,
	storePath
};
