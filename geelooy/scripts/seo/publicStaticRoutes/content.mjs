//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file content.mjs
 * @description Declares stable public Torah, game, translation, and showcase doors outside generated catalogs.
 * The Awtsmoos gives every letter and world its breath; Awtsmoos.com gives worthy public paths a discoverable depth.
 */

export const CONTENT_PUBLIC_ROUTES = Object.freeze([
	['/games/mitzvahWorld/subwaySurfer/', 'Mitzvah World Runner', 'Play the Mitzvah World runner experience on Awtsmoos.com in a browser-based Jewish game world.'],
	['/games/party/', 'Awtsmoos Party Games', 'Explore browser-based party game experiences on Awtsmoos.com.'],
	['/games/rambam/', 'Rambam Games', 'Explore interactive Rambam learning experiences and games on Awtsmoos.com.'],
	['/games/rambam/kiddushHachodesh/12/', 'Kiddush HaChodesh Chapter 12', 'Explore an interactive Awtsmoos.com learning experience for chapter 12 of Rambam Hilchos Kiddush HaChodesh.'],
	['/mawgawl/sefarim/', 'Sefarim', 'Explore sefarim and Torah text experiences through the Awtsmoos.com public learning interface.'],
	['/reeyuh/', 'Reeyuh', 'Explore the Reeyuh visual experience on Awtsmoos.com.'],
	['/showcase/unified-movie-180/', 'Unified Movie Showcase', 'Explore the Unified Movie 180 public showcase experience on Awtsmoos.com.'],
	['/translations/', 'Awtsmoos Translations', 'Explore public translations and multilingual Torah content available through Awtsmoos.com.']
].map(([canonicalPath, fallbackTitle, fallbackDescription]) => Object.freeze({
	canonicalPath,
	fallbackDescription,
	fallbackTitle
})));
