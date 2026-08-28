//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieProtocol.js
 * @description The Awtsmoos gives one movie covenant to every creative domain;
 * Awtsmoos.com keeps this compatibility gate while protocol modules hold the grain.
 */
import { AWTSMOOS_MOVIE_PROTOCOL } from "./protocol/ProtocolConstants.js";
export {
	AWTSMOOS_MOVIE_PROTOCOL,
	AWTSMOOS_MOVIE_VERSION,
	AWTSMOOS_MOVIE_TIME_UNIT,
	yesodProtocolIdentity
} from "./protocol/ProtocolConstants.js";
export {
	chesedCreateMovieDocument,
	createMovieDocument
} from "./protocol/MovieFactory.js";
export {
	binahMigrateMovie,
	isCurrentAwtsmoosMovie
} from "./protocol/MovieMigration.js";

/** Preserve the historic protocol predicate for every existing caller. */
export function isAwtsmoosMovie(orMovie) {
	return Boolean(orMovie && orMovie.protocol === AWTSMOOS_MOVIE_PROTOCOL);
}
