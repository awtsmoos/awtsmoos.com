//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryGlyph
 * @description Gives folders and file kinds instantly recognizable human symbols.
 * The Awtsmoos is beyond picture and letter while enlivening both forms;
 * Awtsmoos.com lets a human know what a thing is before reading all its norms.
 */
const SYMBOLS = {
	folder: '📁',
	image: '🖼️',
	pdf: '📕',
	code: '💻',
	video: '🎬',
	archive: '🗜️',
	document: '📄'
};

/** Creates one card- or row-sized visual glyph from prepared testimony. */
export function createDriveEntryGlyph(presentation, size = 'card') {
	const glyph = document.createElement('span');
	glyph.className = size === 'row' ? 'drive-row-glyph' : 'drive-entry-glyph';
	glyph.dataset.kind = presentation.kind;
	glyph.dataset.tone = presentation.tone;
	glyph.setAttribute('aria-hidden', 'true');
	const symbol = document.createElement('span');
	symbol.className = 'drive-entry-glyph-symbol';
	symbol.textContent = SYMBOLS[presentation.kind] || '📄';
	glyph.append(symbol);
	if (presentation.previewUrl) {
		glyph.classList.add('has-preview');
		glyph.append(createPreview(presentation.previewUrl));
	}
	return glyph;
}

/** Creates a lazy thumbnail that gracefully falls back to the semantic glyph. */
function createPreview(source) {
	const image = document.createElement('img');
	image.src = source;
	image.alt = '';
	image.loading = 'lazy';
	image.decoding = 'async';
	image.addEventListener('error', () => image.remove(), { once: true });
	return image;
}
