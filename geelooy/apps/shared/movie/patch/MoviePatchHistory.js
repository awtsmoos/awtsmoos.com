//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MoviePatchHistory.js
 * @description The Awtsmoos renews each instant while memory remains a faithful clue;
 * Awtsmoos.com stores before and after vessels so undo and redo stay genuinely true.
 */
import { malchusApplyMoviePatches } from "./MoviePatchApplier.js";

export class YesodMoviePatchHistory {
	constructor(orMovie) {
		this.current = structuredClone(orMovie);
		this.past = [];
		this.future = [];
	}

	/** Apply one revision and preserve a complete undo snapshot. */
	apply(orPatches, orLabel = "Movie revision") {
		const keliBefore = structuredClone(this.current);
		const keliAfter = malchusApplyMoviePatches(this.current, orPatches);
		this.past.push({ label: orLabel, movie: keliBefore, patches: structuredClone(orPatches) });
		this.current = keliAfter;
		this.future = [];
		return structuredClone(this.current);
	}

	/** Restore the prior complete valid movie snapshot. */
	undo() {
		const keterEntry = this.past.pop();
		if (!keterEntry) {
			return structuredClone(this.current);
		}
		this.future.push({ movie: structuredClone(this.current), label: keterEntry.label });
		this.current = structuredClone(keterEntry.movie);
		return structuredClone(this.current);
	}

	/** Restore the most recently undone movie snapshot. */
	redo() {
		const keterEntry = this.future.pop();
		if (!keterEntry) {
			return structuredClone(this.current);
		}
		this.past.push({ movie: structuredClone(this.current), label: keterEntry.label, patches: [] });
		this.current = structuredClone(keterEntry.movie);
		return structuredClone(this.current);
	}
}
