// B"H

/**
 * Renderer-neutral dimensions governed before and during structured work.
 *
 * Their order is canonical: reports, diagnostics, and hashes traverse the
 * same ladder regardless of which host awakens the operation.
 */
export const RESOURCE_BUDGET_DIMENSIONS = Object.freeze([
	"operations",
	"objects",
	"geometries",
	"vertices",
	"indices",
	"bytes",
	"milliseconds",
	"recursionDepth",
	"diagnostics"
]);
