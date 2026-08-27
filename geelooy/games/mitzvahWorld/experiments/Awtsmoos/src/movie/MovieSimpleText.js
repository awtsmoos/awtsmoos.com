// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleText.js
 * @description Adds one line of cinematic text to both native Movie title reality and Reel Studio's generated overlay asset layer.
 * RESPONSIBILITY: create deterministic title assets, native title clips, NLE overlay clips, timing, and portable style from one simple call.
 * NON-RESPONSIBILITY: this module does not draw glyphs, load fonts, or replace the deeper multilingual text API.
 * The Awtsmoos is beyond every letter while speech enters time through finite form; Awtsmoos.com lets one simple word survive both editor preview and native movie norm.
 */

import { nextMovieSimpleId } from './MovieSimpleIds.js';
import {
	addMovieSimpleClip,
	ensureMovieSimpleTrack,
	movieSimpleTiming
} from './MovieSimpleTracks.js';
import { ensureMovieSimpleWorld } from './MovieSimpleWorld.js';

/** Adds simple text with both native and NLE-compatible witnesses. */
export function addMovieSimpleText(project, text, options = {}) {
	const value = String(text || '').trim();
	if (!value) {
		throw new Error('Simple movie text requires non-empty text.');
	}
	ensureMovieSimpleWorld(project);
	const assets = project.nle.assets;
	const id = String(options.id || nextMovieSimpleId('title', assets));
	const timing = movieSimpleTiming(project, options, 3);
	const asset = createTitleAsset(id, value, options);
	assets.push(asset);
	addMovieSimpleClip(
		ensureMovieSimpleTrack(project, 'nle-overlay', 'nle-overlay'),
		createOverlayClip(asset, timing)
	);
	addMovieSimpleClip(
		ensureMovieSimpleTrack(project, 'titles', 'title'),
		createNativeTitleClip(id, value, timing, options)
	);
	return asset;
}

function createTitleAsset(id, text, options) {
	return {
		align: String(options.align || 'center'),
		animation: String(options.animation || 'rise'),
		background: String(options.background || 'rgba(3, 7, 14, .42)'),
		color: String(options.color || '#ffffff'),
		fontSize: bounded(options.fontSize, 24, 160, 64),
		id,
		kind: 'title',
		label: String(options.label || text.slice(0, 48) || 'Title'),
		subtext: String(options.subtext || ''),
		text
	};
}

function createOverlayClip(asset, timing) {
	return {
		assetId: asset.id,
		duration: timing.duration,
		id: `${asset.id}-overlay-clip`,
		label: asset.label,
		start: timing.start
	};
}

function createNativeTitleClip(id, text, timing, options) {
	return {
		duration: timing.duration,
		easing: String(options.easing || 'linear'),
		id: `${id}-native`,
		language: String(options.language || 'en'),
		position: String(options.position || 'center'),
		start: timing.start,
		style: {
			align: String(options.align || 'center'),
			background: String(options.background || 'rgba(3, 7, 14, .42)'),
			color: String(options.color || '#ffffff'),
			fontSize: bounded(options.fontSize, 12, 160, 64),
			fontWeight: bounded(options.fontWeight, 100, 900, 760),
			maximumWidth: bounded(options.maximumWidth, 0.2, 1, 0.82)
		},
		subtitle: options.subtext ? String(options.subtext) : null,
		text,
		variant: String(options.variant || 'title')
	};
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Math.max(
		minimum,
		Math.min(maximum, Number.isFinite(number) ? number : fallback)
	);
}
