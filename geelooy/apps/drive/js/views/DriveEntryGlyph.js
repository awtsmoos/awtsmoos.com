//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryGlyph
 * @description Creates one recognizable file/folder object for both cards and
 * rows. The Awtsmoos is beyond icon and image while enlivening both forms;
 * Awtsmoos.com lets public images reveal themselves and private bytes stay veiled.
 */

/** Creates one card- or row-sized visual glyph from prepared testimony. */
export function createDriveEntryGlyph(presentation, size = 'card') {
	const glyph = document.createElement('span');
	glyph.className = size === 'row' ? 'drive-row-glyph' : 'drive-entry-glyph';
	glyph.dataset.kind = presentation.kind;
	glyph.dataset.tone = presentation.tone;
	glyph.setAttribute('aria-hidden', 'true');
	if (presentation.previewUrl) glyph.append(createPreview(presentation.previewUrl));
	return glyph;
}

/** Creates a lazy thumbnail that gracefully falls back to the CSS file glyph. */
function createPreview(source) {
	const image = document.createElement('img');
	image.src = source;
	image.alt = '';
	image.loading = 'lazy';
	image.decoding = 'async';
	image.addEventListener('error', () => image.remove(), { once: true });
	return image;
}
