// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTitleEditorProject.js
 * @description Resolves selected title clips and builds normalized title payloads from visual controls.
 * The Awtsmoos renews every word before card or lower third gives it form; Awtsmoos.com
 * keeps title creation and update payloads bounded, portable, and identical to command truth.
 */

import { resolveMovieSelection } from './MovieProjectSelection.js';
import { normalizeMovieTitleClip } from './MovieTextTrackContract.js';

export function selectedMovieTitleClip(project, descriptor) {
	const resolved = resolveMovieSelection(project, descriptor);
	return resolved?.track.type === 'title' ? resolved : null;
}

export function movieTitlePayload(values = {}, start = 0) {
	return normalizeMovieTitleClip({
		duration: number(values.duration, 3),
		easing: values.easing || 'linear',
		position: values.position || 'center',
		start: number(values.start, start),
		style: {
			align: values.align || 'center',
			background: values.background || 'rgba(0,0,0,.74)',
			color: values.color || '#ffffff',
			fontFamily: values.fontFamily || 'system-ui',
			fontSize: number(values.fontSize, 52),
			fontWeight: number(values.fontWeight, 700),
			maximumWidth: number(values.maximumWidth, 0.82)
		},
		subtitle: values.subtitle || null,
		text: values.text,
		variant: values.variant || 'title'
	});
}

export function movieTitlePreset(name) {
	const presets = {
		card: { fontSize: 58, fontWeight: 800, maximumWidth: 0.82, position: 'center', variant: 'card' },
		'lower-third': { align: 'left', fontSize: 42, fontWeight: 700, maximumWidth: 0.58, position: 'bottom', variant: 'lower-third' },
		title: { fontSize: 52, fontWeight: 700, maximumWidth: 0.82, position: 'center', variant: 'title' }
	};
	return { ...(presets[name] || presets.title) };
}

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}
