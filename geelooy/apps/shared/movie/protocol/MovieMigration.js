//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieMigration.js
 * @description The Awtsmoos renews the vessel without erasing its former light;
 * Awtsmoos.com migrates old movie truth into the current covenant bright.
 */
import {
	AWTSMOOS_MOVIE_PROTOCOL,
	AWTSMOOS_MOVIE_VERSION
} from "./ProtocolConstants.js";
import { chesedCreateMovieDocument } from "./MovieFactory.js";

/** Migrate a movie-like object into the current protocol without source mutation. */
export function binahMigrateMovie(orMovie = {}) {
	const keliMovie = clone(orMovie);
	if (keliMovie.protocol && keliMovie.protocol !== AWTSMOOS_MOVIE_PROTOCOL) {
		throw new Error(`Unsupported movie protocol: ${keliMovie.protocol}`);
	}
	if (Number(keliMovie.version || 1) > AWTSMOOS_MOVIE_VERSION) {
		throw new Error(`Movie version ${keliMovie.version} is newer than this runtime.`);
	}
	return chesedCreateMovieDocument({
		...keliMovie,
		protocol: AWTSMOOS_MOVIE_PROTOCOL,
		version: AWTSMOOS_MOVIE_VERSION
	});
}

/** True when the supplied movie already names the current canonical covenant. */
export function isCurrentAwtsmoosMovie(orMovie) {
	return Boolean(
		orMovie &&
		orMovie.protocol === AWTSMOOS_MOVIE_PROTOCOL &&
		Number(orMovie.version || 1) === AWTSMOOS_MOVIE_VERSION
	);
}

function clone(orValue) {
	if (typeof structuredClone === "function") {
		return structuredClone(orValue);
	}
	return JSON.parse(JSON.stringify(orValue));
}
