// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortConstants.js
 * @description Defines portrait-safe Short defaults that keep spoken words readable without turning subtitles into the picture.
 * The Awtsmoos renews letter and landscape before either can eclipse the other; Awtsmoos.com gives captions a quiet lower vessel,
 * leaving the river, Chossid, sky, vegetation, and speaker enough room to remain the living visual story.
 */

export const MOVIE_SHORT_DURATION = Object.freeze({ max: 50, min: 30 });
export const MOVIE_SHORT_RESOLUTION = Object.freeze({ height: 1920, width: 1080 });
export const MOVIE_SHORT_FPS = 30;

export const MOVIE_SHORT_CAPTION_STYLE = Object.freeze({
	align: 'center',
	background: 'rgba(0,0,0,0)',
	color: '#ffffff',
	curve: 0.04,
	fontFamily: 'system-ui',
	fontSize: 48,
	fontWeight: 780,
	maximumWidth: 0.74,
	strokeColor: '#000000',
	strokeWidth: 5
});

export const MOVIE_SHORT_TITLE_STYLE = Object.freeze({
	align: 'center',
	background: 'rgba(0,0,0,0)',
	color: '#ffffff',
	fontFamily: 'system-ui',
	fontSize: 60,
	fontWeight: 820,
	maximumWidth: 0.78,
	strokeColor: '#000000',
	strokeWidth: 6
});

export const MOVIE_SHORT_SPEAKER_LAYOUT = Object.freeze({
	height: 540,
	width: 960,
	x: 60,
	y: 360
});
