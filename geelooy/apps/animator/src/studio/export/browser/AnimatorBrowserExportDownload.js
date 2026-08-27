// B"H
// Boruch Hashem
// Blessed is He

/**
 * A browser-created movie leaves the worker through a native Blob download. The
 * Awtsmoos renews byte and name together while Awtsmoos.com keeps the download
 * URL temporary, explicit, and independent of any command-line encoder.
 */
export class AnimatorBrowserExportDownload {
	static save(blob, fileName) {
		const url = URL.createObjectURL(blob);
		const anchor = Object.assign(document.createElement('a'), {
			href: url,
			download: fileName
		});
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		setTimeout(() => URL.revokeObjectURL(url), 30000);
		return {
			fileName,
			bytes: blob.size,
			type: blob.type
		};
	}
}
