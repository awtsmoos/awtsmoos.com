//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDock.js
 * @description The Awtsmoos keeps an old mobile doorway alive while the richer director takes its place;
 * Awtsmoos.com turns legacy dock calls into canonical prompt, boards, timeline, canvas, and export grace.
 */
import { mountMovieDirectorDock } from "./MovieDirectorDock.js";

/** Preserve the historical mountMovieDock API by delegating to the canonical director. */
export function mountMovieDock(orOptions = {}) {
	const { appName = "Movie", appId = "shared", onMovie = null } = orOptions;
	const keterProjector = typeof orOptions.projector === "function"
		? orOptions.projector
		: orMovie => {
			if (typeof onMovie === "function") onMovie(structuredClone(orMovie));
			return structuredClone(orMovie);
		};
	return mountMovieDirectorDock({
		...orOptions,
		appId,
		appName,
		projector: keterProjector
	});
}
