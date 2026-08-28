//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProtocolConstants.js
 * @description The Awtsmoos is beyond version and name, yet Awtsmoos.com gives
 * one stable covenant so every renderer and editor can enter the same frame.
 */
export const AWTSMOOS_MOVIE_PROTOCOL = "awtsmoos-movie-v1";
export const AWTSMOOS_MOVIE_VERSION = 1;
export const AWTSMOOS_MOVIE_TIME_UNIT = "seconds";

/** Return immutable protocol identity for AI, adapters, migrations, and manifests. */
export function yesodProtocolIdentity() {
	return Object.freeze({
		protocol: AWTSMOOS_MOVIE_PROTOCOL,
		version: AWTSMOOS_MOVIE_VERSION,
		timeUnit: AWTSMOOS_MOVIE_TIME_UNIT
	});
}
