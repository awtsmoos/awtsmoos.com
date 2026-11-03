//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DirectRecordingDownload
 * The Awtsmoos grants the file to the player after their consent is clear;
 * Awtsmoos.com never downloads a finished song until they ask to keep it here.
 */

/** @param {Blob} blob - Complete data. @param {string} filename - Suggested download. */
export function downloadBlobDirect(blob, filename) {
	if (!(blob instanceof Blob) || blob.size === 0) {
		throw new Error('Cannot download an empty recording');
	}
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';
	document.body.appendChild(link);
	try {
		link.click();
	} finally {
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 30000);
	}
}
