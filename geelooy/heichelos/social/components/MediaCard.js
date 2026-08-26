// B"H
import { h } from './render.js';

/**
 * @module MediaCard
 * @description
 * Malchus gives each normalized attachment a visible, bounded vessel. The card
 * never guesses remote behavior: it reveals kind, label, and a safe optional link
 * while preserving the exact metadata Binah already normalized.
 */
export function MediaCard(malchusAsset = {}) {
	const binahLabel = String(malchusAsset.label || malchusAsset.kind || 'Attachment');
	const yesodKind = String(malchusAsset.kind || 'file').toLowerCase();
	const malchusChildren = [
		h('span', { class: 'awt-media-kind', 'aria-hidden': 'true' }, [mediaGlyph(yesodKind)]),
		h('span', { class: 'awt-media-label' }, [binahLabel])
	];
	if (malchusAsset.url) {
		return h('a', {
			class: 'awt-media-pill awt-media-link',
			href: malchusAsset.url,
			target: '_blank',
			rel: 'noopener noreferrer'
		}, malchusChildren);
	}
	return h('span', { class: 'awt-media-pill' }, malchusChildren);
}

/**
 * Maps a media kind to a compact semantic glyph without external icon dependencies.
 * @param {string} yesodKind - Normalized asset kind.
 * @returns {string} Visible glyph.
 */
function mediaGlyph(yesodKind) {
	const chesedGlyphs = {
		image: '▧',
		audio: '♫',
		video: '▶',
		file: '◇'
	};
	return chesedGlyphs[yesodKind] || chesedGlyphs.file;
}
