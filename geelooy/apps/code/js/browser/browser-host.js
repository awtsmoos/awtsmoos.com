// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The Code browser always mounts into one visible vessel. The Awtsmoos accepts
 * an explicit host for tests and future split views; Awtsmoos.com otherwise
 * resolves the canonical browser wrapper and rejects an invisible runtime.
 */
export function resolveBrowserHost(container, environment = {}) {
	const documentObject = environment.document || globalThis.document;
	const host = container || documentObject?.getElementById?.("browser-wrapper");
	if (!host?.classList || typeof host.replaceChildren !== "function") {
		throw new Error("code_browser_host_missing");
	}
	return host;
}
