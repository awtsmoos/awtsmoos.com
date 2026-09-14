//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file files.js
 * @description
 * Converts local File objects into parsed first-party PDF documents and queue cards.
 * Files stay in browser memory; this module performs no upload, network request, or
 * third-party parsing call before revealing their page count to the user.
 */

import { createCard, updateControls } from "./cards.js";
import { addPdf } from "./state.js";
import { loadPdf } from "./native-pdf/index.js";

/**
 * Parses every PDF-like file in one user selection independently.
 *
 * @param {FileList|File[]} files User-selected files.
 * @returns {Promise<void>} Resolves after every accepted file has been attempted.
 */
export async function handleFiles(files) {
	for (const file of Array.from(files || [])) {
		if (!isPdf(file)) {
			continue;
		}
		try {
			const pdf = await loadPdf(await file.arrayBuffer());
			const data = addPdf({
				id: crypto.randomUUID(),
				file,
				pdfObj: pdf,
				numPages: pdf.numPages,
				fileName: baseName(file.name)
			});
			await createCard(data);
		} catch (error) {
			console.error('B"H PDF could not be parsed.', error);
			revealFileFailure(file.name, error);
		}
	}
	updateControls();
}

/** @param {File} file Candidate input. @returns {boolean} Whether it should enter PDF parsing. */
function isPdf(file) {
	return file?.type === "application/pdf"
		|| /\.pdf$/i.test(String(file?.name || ""));
}

/** @param {string} filename Original local name. @returns {string} Extension-free display name. */
function baseName(filename) {
	return String(filename || "document.pdf").replace(/\.pdf$/i, "") || "document";
}

/** @param {string} filename Local filename. @param {unknown} error Parser failure. @returns {void} */
function revealFileFailure(filename, error) {
	const code = String(error?.code || error?.message || "pdf_parse_failed");
	const message = code === "encrypted_pdf_not_supported"
		? `${filename}: encrypted PDFs are not supported yet.`
		: `${filename}: this PDF could not be decoded.`;
	window.alert(message);
}
