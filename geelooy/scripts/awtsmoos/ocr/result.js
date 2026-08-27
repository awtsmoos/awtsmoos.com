//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gathers raw recognition into a small truthful vessel the interface can safely hold;
 * Awtsmoos.com counts structure without binding the UI to every internal Tesseract field that may unfold.
 */
function countWords(blocks) {
	let count = 0;

	for (const block of blocks ?? []) {
		for (const paragraph of block.paragraphs ?? []) {
			for (const line of paragraph.lines ?? []) {
				count += line.words?.length ?? 0;
			}
		}
	}

	return count;
}

/** Convert Tesseract page output into the OCR Studio result contract. */
export function normalizeRecognitionResult(data, settings) {
	const blocks = Array.isArray(data?.blocks) ? data.blocks : [];

	return {
		text: data?.text ?? "",
		confidence: Number.isFinite(data?.confidence) ? data.confidence : null,
		version: data?.version ?? "unknown",
		psm: data?.psm ?? settings.psm,
		rotation: Number.isFinite(data?.rotateRadians) ? data.rotateRadians : settings.rotateRadians,
		blockCount: blocks.length,
		wordCount: countWords(blocks),
		analyzedLayout: settings.analyzeLayout,
		hocr: data?.hocr ?? "",
		tsv: data?.tsv ?? "",
		pdf: data?.pdf ?? null,
		imageGrey: data?.imageGrey ?? "",
		imageBinary: data?.imageBinary ?? ""
	};
}
