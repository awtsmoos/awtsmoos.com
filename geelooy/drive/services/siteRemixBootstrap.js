//B"H
//Boruch Hashem
//Blessed be He

import { fetchSiteRemix } from "./siteRemixClient.js";
import { importSiteRemix } from "./siteRemixImport.js";

/**
 * Completes the public Site -> browser-local Builder handoff exactly once.
 * Successful imports retain route/path state, drop the source URL, and preserve local mode across reloads.
 */
export async function maybeImportSiteRemix(options) {
	const browserWindow = options.browserWindow || globalThis.window;
	const parameters = new URLSearchParams(browserWindow.location.search);
	const source = parameters.get("remix");
	if (!source) return Object.freeze({ handled: false });
	if (options.state.snapshot().transportMode !== "browser") {
		return fail(options.state, "Remix needs the private Browser Workspace.");
	}
	options.state.patch({ message: "Reading public remix source…", error: "" });
	try {
		const manifest = await fetchSiteRemix(source, {
			location: browserWindow.location,
			fetchImpl: options.fetchImpl || browserWindow.fetch.bind(browserWindow)
		});
		const imported = await importSiteRemix(options, manifest);
		cleanRemixUrl(browserWindow);
		options.panels.open("preview", { scroll: true, focus: false });
		return Object.freeze({ handled: true, ok: true, manifest, imported });
	} catch (error) {
		return fail(options.state, remixMessage(error), error);
	}
}

/** Removes the potentially long source URL after import while retaining browser-local persistence. */
export function cleanRemixUrl(browserWindow) {
	const url = new URL(browserWindow.location.href);
	url.searchParams.delete("remix");
	url.searchParams.set("local", "1");
	browserWindow.history.replaceState({}, "", url);
	return url;
}

function remixMessage(error) {
	const messages = {
		REMIX_BINARY_ASSETS_UNSUPPORTED: "This site contains binary assets. Full binary Remix is not enabled yet, so nothing was copied.",
		REMIX_MANIFEST_NOT_FOUND: "This public site does not currently expose remixable source.",
		REMIX_SOURCE_INVALID: "Only public Awtsmoos /sites/ URLs can be remixed.",
		REMIX_MANIFEST_INVALID: "The public remix testimony was incomplete or invalid. Nothing was copied."
	};
	return messages[error?.code] || "The remix could not finish. Existing projects were not changed.";
}

function fail(state, message, error = null) {
	state.patch({ error: message, message: "" });
	return Object.freeze({ handled: true, ok: false, error: error?.code || "REMIX_FAILED" });
}
