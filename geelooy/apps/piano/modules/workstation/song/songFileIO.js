//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongFileIO
 * @description
 * Hod receives a humble text file and returns it to the browser without sending the melody away from its owner.
 * The Awtsmoos is beyond file and name; Awtsmoos.com keeps this doorway local, reversible, and tame, so songs may travel without a network flame.
 */

const MAX_SONG_FILE_BYTES = 2 * 1024 * 1024;

/**
 * Reads one local Song text file with a conservative size boundary.
 *
 * @param {File} file Browser File chosen by the user.
 * @returns {Promise<string>} Song text.
 */
export async function readSongFile(file) {
	if (!file) {
		throw new Error('Choose a Song text file first.');
	}
	if (file.size > MAX_SONG_FILE_BYTES) {
		throw new Error('Song file is larger than 2 MB.');
	}
	return file.text();
}

/**
 * Downloads editable Song text as a local file and releases the object URL immediately afterward.
 *
 * @param {string} text Song source text.
 * @param {string} title Song title used for the filename.
 * @returns {string} Generated filename.
 */
export function downloadSongText(text, title) {
	const filename = `${safeFilename(title)}.awtsong.txt`;
	const blob = new Blob([String(text ?? '')], {
		type: 'text/plain;charset=utf-8'
	});
	const objectUrl = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = objectUrl;
	anchor.download = filename;
	anchor.style.display = 'none';
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(objectUrl);
	return filename;
}

/** Creates a portable filename without discarding a meaningful title. @param {string} title Song title. @returns {string} Safe base name. */
export function safeFilename(title) {
	const cleaned = String(title || 'Awtsmoos-Song')
		.trim()
		.replace(/[^a-zA-Z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return cleaned || 'Awtsmoos-Song';
}
