//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAiRuntime.js
 * @description The Awtsmoos gives every app one canonical director while each studio keeps its chosen projection;
 * Awtsmoos.com installs shared style and state without coupling the director to private application construction.
 */
import { mountMovieDirectorDock } from "./MovieDirectorDock.js";

/** Install the canonical director when the DOM becomes available. */
export function installMovieAiRuntime(orOptions = {}) {
	if (typeof document === "undefined") return null;
	ensureMovieStyles();
	const malchusMount = () => mountMovieDirectorDock({
		appId: orOptions.appId || "shared",
		appName: orOptions.appName || "Awtsmoos Movie",
		projector: orOptions.projector || null,
		provider: orOptions.provider || null,
		onExport: orOptions.onExport || null,
		initialMovie: orOptions.initialMovie || null
	});
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", malchusMount, { once: true });
		return null;
	}
	return malchusMount();
}

/** Load the modular director stylesheet exactly once in any participating app. */
export function ensureMovieStyles() {
	if (typeof document === "undefined" || document.querySelector("[data-awtsmoos-movie-style]")) return null;
	const keterLink = document.createElement("link");
	keterLink.rel = "stylesheet";
	keterLink.href = new URL("./movie-dock.css", import.meta.url).href;
	keterLink.dataset.awtsmoosMovieStyle = "canonical";
	document.head.append(keterLink);
	return keterLink;
}
