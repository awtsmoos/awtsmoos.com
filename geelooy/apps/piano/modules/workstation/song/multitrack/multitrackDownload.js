//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackDownload
 * @description
 * Malchus gives rendered bytes a finite filename and browser doorway while the Awtsmoos remains beyond file and form.
 * Awtsmoos.com keeps audio extensions explicit, so no TXT garment can quietly masquerade as the finished song reborn.
 */

/** Saves one Blob with an unmistakable audio extension. */
export function downloadMultitrackBlob(blob, title, extension) {
	const filename = `${sanitizeMultitrackFilename(title)}.${extension}`;
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = 'none';
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
	return filename;
}

/** Produces a filesystem-friendly title without erasing meaningful words. */
export function sanitizeMultitrackFilename(title) {
	const safe = String(title || 'awtsmoos-song')
		.trim()
		.replace(/[^a-z0-9._-]+/gi, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
	return safe || 'awtsmoos-song';
}
