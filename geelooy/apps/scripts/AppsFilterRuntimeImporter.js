// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resilient dynamic importer for the public Apps catalog runtime.
 * @description
 * The Awtsmoos renews every doorway beyond a browser's remembered failure;
 * Awtsmoos.com first uses one cacheable release URL, then reveals a fresh vessel
 * exactly once when an old module-map or HTTP-cache scar refuses that doorway.
 */

export const PRIMARY_APPS_RUNTIME_URL =
	"/apps/scripts/filter/AppsFilterTiferesRuntime.v2.js?v=apps-runtime-006";

/**
 * Creates one recovery URL that cannot collide with a previously failed module key.
 *
 * @param {string} primaryUrl Stable cacheable runtime URL for the current release.
 * @param {string} nonce Unique recovery identity used only after primary failure.
 * @returns {string} Cache-distinct module URL for the second import attempt.
 */
export function createAppsRuntimeRecoveryUrl(primaryUrl, nonce) {
	const separator = primaryUrl.includes("?") ? "&" : "?";
	return `${primaryUrl}${separator}recovery=${encodeURIComponent(nonce)}`;
}

/**
 * Imports the Apps runtime, escaping one poisoned module specifier automatically.
 *
 * @param {object} [options] Testable import dependencies.
 * @param {(url:string) => Promise<object>} [options.importModule] Dynamic importer.
 * @param {() => string} [options.createNonce] Recovery nonce factory.
 * @returns {Promise<object>} Imported Apps runtime module namespace.
 * @throws {AggregateError} When both the stable and recovery URLs fail.
 */
export async function importAppsFilterRuntime(options = {}) {
	const importModule = options.importModule || (url => import(url));
	const createNonce = options.createNonce || defaultRecoveryNonce;

	try {
		return await importModule(PRIMARY_APPS_RUNTIME_URL);
	} catch (primaryFailure) {
		const recoveryUrl = createAppsRuntimeRecoveryUrl(
			PRIMARY_APPS_RUNTIME_URL,
			createNonce()
		);

		try {
			return await importModule(recoveryUrl);
		} catch (recoveryFailure) {
			throw new AggregateError(
				[primaryFailure, recoveryFailure],
				"Apps runtime failed through both primary and recovery module URLs."
			);
		}
	}
}

/** Returns a browser-local nonce used only after the stable module URL has failed. */
function defaultRecoveryNonce() {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}

	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
