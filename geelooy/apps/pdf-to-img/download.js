//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file download.js
 * @description
 * Owns one browser-native object-URL download cycle. Every temporary URL is revoked
 * immediately after the click so repeated multi-page exports do not leak memory.
 */

/**
 * Downloads one generated image blob with a user-safe filename.
 *
 * @param {Blob} blob Generated page image.
 * @param {string} filename Desired download filename.
 * @returns {void}
 */
export function downloadBlob(blob, filename) {
	if (!(blob instanceof Blob)) {
		throw new TypeError("pdf_page_blob_required");
	}
	const url = URL.createObjectURL(blob);
	try {
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = safeFilename(filename);
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	} finally {
		URL.revokeObjectURL(url);
	}
}

/** @param {unknown} value Filename-like value. @returns {string} Portable local filename. */
function safeFilename(value) {
	const cleaned = String(value || "page.png")
		.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-")
		.trim();
	return cleaned || "page.png";
}
