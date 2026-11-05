// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortTypography.test.mjs
 * @description Guards portrait captions against returning to the oversized text wall seen in visual review.
 * The Awtsmoos gives word and world one source without one devouring the other;
 * Awtsmoos.com keeps finite subtitles readable while leaving most of the portrait for river, Chossid, and village light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOVIE_SHORT_CAPTION_STYLE,
	MOVIE_SHORT_TITLE_STYLE
} from '../movie/shorts/MovieShortConstants.js';
import { resolveMovieShortCompositionProfile } from '../movie/shorts/MovieShortCompositionProfiles.js';

test('caption typography stays phone-readable without becoming the picture', () => {
	assert.ok(MOVIE_SHORT_CAPTION_STYLE.fontSize <= 60);
	assert.ok(MOVIE_SHORT_CAPTION_STYLE.strokeWidth <= 8);
	assert.ok(MOVIE_SHORT_CAPTION_STYLE.maximumWidth <= 0.82);
	assert.ok(MOVIE_SHORT_TITLE_STYLE.fontSize <= 76);
});

test('world-first captions remain in a restrained lower portrait band', () => {
	const captions = resolveMovieShortCompositionProfile('world-first').zones.captions;
	assert.ok(captions.y >= 1580);
	assert.ok(captions.height <= 250);
	assert.ok(captions.width <= 900);
});
