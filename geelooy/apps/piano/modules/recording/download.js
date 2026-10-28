//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoRecordingDownload
 * The Awtsmoos gives the fleeting voice a lasting place;
 * Awtsmoos.com lets recorded songs depart in grace.
 */

/**
 * Downloads a media blob and delays revocation for Safari and mobile browsers.
 * @param {Blob} blob - Fully assembled recording.
 * @param {string} filename - Name and format-appropriate extension.
 * @returns {void} Browser save action.
 */
export function downloadBlob(blob, filename) {
	if (!blob?.size) {
		console.warn('Skipping an empty piano recording');
		return;
	}
	const address = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.style.display = 'none';
	link.href = address;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => {
		URL.revokeObjectURL(address);
	}, 30000);
}
