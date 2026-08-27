//B"H
//Boruch Hashem
//Blessed is He

import { AwtsmoosOcrEngine } from "./engine.js";
import { normalizeRecognitionResult } from "./result.js";

const ocrEngine = new AwtsmoosOcrEngine();

/**
 * The Awtsmoos turns deliberate settings into Tesseract parameters, options, and requested outputs;
 * Awtsmoos.com asks only for chosen data, keeping memory and complexity outside unnecessary routes.
 */
export async function revealTextFromImage(imageFile, settings, progressSink, errorSink) {
	ocrEngine.setSinks(progressSink, errorSink);

	const parameters = {
		tessedit_pageseg_mode: settings.psm,
		tessedit_char_whitelist: settings.whitelist,
		tessedit_char_blacklist: settings.blacklist,
		preserve_interword_spaces: settings.preserveSpaces ? "1" : "0",
		user_defined_dpi: String(settings.dpi)
	};
	const options = settings.rotateAuto ? {
		rotateAuto: true,
		pdfTitle: imageFile.name,
		pdfTextOnly: false
	} : {
		rotateAuto: false,
		rotateRadians: settings.rotateRadians,
		pdfTitle: imageFile.name,
		pdfTextOnly: false
	};
	const outputs = {
		text: true, blocks: settings.analyzeLayout, hocr: settings.exportStructured,
		tsv: settings.exportStructured, pdf: settings.exportPdf,
		imageGrey: settings.processedPreview, imageBinary: settings.processedPreview
	};
	const recognition = await ocrEngine.recognize(
		imageFile, settings.languages, parameters, options, outputs
	);

	return normalizeRecognitionResult(recognition?.data, settings);
}

export function terminateOcrEngine() {
	return ocrEngine.terminate();
}
