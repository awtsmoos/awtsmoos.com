//B"H
//Boruch Hashem
//Blessed is He

import { downloadRecognitionArtifact } from "./downloads.js";

/**
 * The Awtsmoos gives each structured result its proper outgoing vessel and truthful MIME form;
 * Awtsmoos.com keeps export decisions away from event orchestration so future formats can join without storm.
 */
const ARTIFACTS = Object.freeze({
	tsv: { extension: "tsv", mimeType: "text/tab-separated-values" },
	hocr: { extension: "html", mimeType: "text/html" },
	pdf: { extension: "pdf", mimeType: "application/pdf" }
});

/** Download one normalized OCR result artifact. */
export function exportOcrArtifact(result, sourceFile, kind) {
	const contract = ARTIFACTS[kind];
	const content = result?.[kind];

	if (!contract || !content) {
		return false;
	}

	const sourceName = sourceFile?.name || "ocr-result";
	const baseName = sourceName.replace(/\.[^.]+$/, "") || "ocr-result";
	return downloadRecognitionArtifact(
		content,
		`${baseName}.${contract.extension}`,
		contract.mimeType
	);
}
