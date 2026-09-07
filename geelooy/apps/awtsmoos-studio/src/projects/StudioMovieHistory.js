//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieHistory.js
 * @description Adapts the shared reversible movie-patch history to Studio's already-canonical whole-document editor commits.
 * The Awtsmoos renews the complete movie while each change still remembers the vessel that came before;
 * Awtsmoos.com translates changed top-level movie fields into shared validated patches so undo and redo use the repository's existing door.
 */

import { YesodMoviePatchHistory } from '../../../shared/movie/patch/MoviePatchHistory.js';
import { MoviePatchKind, yesodMoviePatch } from '../../../shared/movie/patch/MoviePatchKinds.js';

export class StudioMovieHistory {
	constructor(movie) {
		this.reset(movie);
	}

	/** Begin a fresh history lineage when a different project or template is loaded. */
	reset(movie) {
		this.history = new YesodMoviePatchHistory(movie);
		return structuredClone(movie);
	}

	/** Record one canonical whole-document revision using shared safe top-level field patches. */
	record(movie, label = 'Studio movie edit') {
		const patches = createMovieFieldPatches(this.history.current, movie, label);
		if (!patches.length) {
			return structuredClone(this.history.current);
		}
		return this.history.apply(patches, label);
	}

	undo() {
		return this.history.undo();
	}

	redo() {
		return this.history.redo();
	}

	canUndo() {
		return this.history.past.length > 0;
	}

	canRedo() {
		return this.history.future.length > 0;
	}
}

/** Build only changed top-level MovieDocument patches; validation happens in the shared applier after the batch. */
function createMovieFieldPatches(current, next, label) {
	return Object.keys(next || {}).flatMap(field => {
		if (sameValue(current?.[field], next[field])) {
			return [];
		}
		return [yesodMoviePatch(
			MoviePatchKind.SET_MOVIE_FIELD,
			{ field },
			next[field],
			label
		)];
	});
}

function sameValue(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}
