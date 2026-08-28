//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieRevisionService.js
 * @description The Awtsmoos changes revelation without erasing identity or name;
 * Awtsmoos.com asks AI for narrow patches so revision touches only the intended frame.
 */
import { aiMovieContract } from "../AiMovieContract.js";
import { YesodMoviePatchHistory } from "../patch/MoviePatchHistory.js";
import { MoviePatchKinds } from "../patch/MoviePatchKinds.js";

export class TiferesMovieRevisionService {
	constructor(orMovie, orProvider = null) {
		this.provider = orProvider;
		this.history = new YesodMoviePatchHistory(orMovie);
	}

	/** Request or apply a surgical revision and return the new canonical movie. */
	async revise(orRequest, orPatches = null) {
		let keterPatches = orPatches;
		if (!keterPatches && typeof this.provider?.reviseMovie === "function") {
			keterPatches = await this.provider.reviseMovie({
				movie: structuredClone(this.history.current),
				request: String(orRequest || ""),
				contract: aiMovieContract(),
				allowedPatchKinds: [...MoviePatchKinds]
			});
		}
		if (!Array.isArray(keterPatches)) {
			throw new Error("Revision requires provider patches or an explicit patch list.");
		}
		return this.history.apply(keterPatches, String(orRequest || "Movie revision"));
	}

	/** Undo the last AI or human revision using the same canonical history. */
	undo() {
		return this.history.undo();
	}

	/** Redo the last undone revision. */
	redo() {
		return this.history.redo();
	}
}
