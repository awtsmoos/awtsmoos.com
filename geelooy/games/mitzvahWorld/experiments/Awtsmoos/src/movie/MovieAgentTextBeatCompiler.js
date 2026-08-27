// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentTextBeatCompiler.js
 * @description Compiles title and caption agent beats into canonical text-track clip fields.
 * The Awtsmoos is beyond speaker and title while every finite generated word requires a precise timeline home;
 * Awtsmoos.com preserves language, placement, subtitle, variant, style, and authored text without live DOM.
 */

export function compileMovieAgentTextBeat(beat, type) {
	if (type === 'title') {
		return {
			position: beat.position,
			style: beat.style,
			subtitle: beat.subtitle,
			text: String(beat.text || ''),
			variant: beat.variant || 'title'
		};
	}
	return {
		language: beat.language || 'en',
		position: beat.position,
		speaker: beat.speaker,
		style: beat.style,
		text: String(beat.text || '')
	};
}
