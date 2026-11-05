// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentTextBeatCompiler.js
 * @description Compiles title and caption agent beats into canonical multilingual text-track fields with optional secondary text.
 * The Awtsmoos is beyond speaker, language, left, and right while every finite generated word requires a precise timeline home;
 * Awtsmoos.com preserves primary and accompanying Unicode text without creating competing caption tracks or live DOM assumptions.
 */

import { normalizeMovieSecondaryText } from './MovieSecondaryTextContract.js';
import { normalizeMovieTextDirection } from './MovieTextDirection.js';

export function compileMovieAgentTextBeat(beat, type) {
	const language = String(beat.language || 'en');
	const direction = normalizeMovieTextDirection(beat.direction, language);
	if (type === 'title') {
		return {
			direction,
			language,
			position: beat.position,
			style: beat.style,
			subtitle: beat.subtitle,
			text: String(beat.text || ''),
			variant: beat.variant || 'title'
		};
	}
	return {
		direction,
		language,
		position: beat.position,
		secondaryCaption: normalizeMovieSecondaryText(beat.secondaryCaption),
		speaker: beat.speaker,
		style: beat.style,
		text: String(beat.text || '')
	};
}
