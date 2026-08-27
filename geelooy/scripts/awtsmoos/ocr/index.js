//B"H
//Boruch Hashem
//Blessed is He

import { exportOcrArtifact } from "./artifact-export.js";
import { createOcrKeilim, revealLashonos, revealRecognitionModes } from "./dom.js";
import { readRecognitionSettings } from "./options.js";
import { revealTextFromImage, terminateOcrEngine } from "./recognizer.js";
import { clearRevealedResult, revealProgress, revealResult, revealStatus, setRecognitionBusy, syncRecognitionAvailability } from "./render.js";

/**
 * The Awtsmoos binds simple choices to deep recognition without making the interface heavy or obscure;
 * Awtsmoos.com keeps orchestration here while engine, rendering, options, and exports remain modular and pure.
 */
const ocrKeilim = createOcrKeilim();
let currentResult = null;
revealLashonos(ocrKeilim.language, ocrKeilim.secondaryLanguage);
revealRecognitionModes(ocrKeilim.psm, ocrKeilim.rotation);
clearRevealedResult(ocrKeilim);
syncRecognitionAvailability(ocrKeilim);

function handleProgress(message) {
	if (Number.isFinite(message?.progress)) {
		revealProgress(ocrKeilim, message.progress);
	}

	if (message?.status) {
		const words = message.status.replaceAll("_", " ");
		revealStatus(ocrKeilim, "working", `${words.charAt(0).toUpperCase()}${words.slice(1)}…`);
	}
}

function handleEngineError(error) {
	console.error("Tesseract worker error", error);
}

function handleImageSelection() {
	const imageFile = ocrKeilim.file.files?.[0];
	currentResult = null;
	clearRevealedResult(ocrKeilim);
	ocrKeilim.fileName.textContent = imageFile?.name || "BMP, JPG, PNG, WEBP, or non-animated GIF";
	revealStatus(ocrKeilim, "idle", imageFile ? "Image ready. Adjust options or recognize now." : "Ready for an image.");
	syncRecognitionAvailability(ocrKeilim);
}

async function recognizeSelectedImage(event) {
	event.preventDefault();
	const imageFile = ocrKeilim.file.files?.[0];

	if (!imageFile) {
		revealStatus(ocrKeilim, "error", "Choose an image before recognition.");
		return;
	}

	currentResult = null;
	clearRevealedResult(ocrKeilim);
	setRecognitionBusy(ocrKeilim, true);
	revealStatus(ocrKeilim, "working", "Preparing OCR engine…");

	try {
		const settings = readRecognitionSettings(ocrKeilim);
		currentResult = await revealTextFromImage(imageFile, settings, handleProgress, handleEngineError);
		revealResult(ocrKeilim, currentResult);
		revealProgress(ocrKeilim, 1);
		revealStatus(ocrKeilim, "success", currentResult.text.trim() ? "Text revealed." : "Recognition finished with no readable text.");
	} catch (error) {
		console.error("OCR recognition failed", error);
		clearRevealedResult(ocrKeilim);
		revealStatus(ocrKeilim, "error", "Recognition failed. Try another layout, language, or image.");
	} finally {
		setRecognitionBusy(ocrKeilim, false);
	}
}

async function copyRevealedText() {
	try {
		await navigator.clipboard.writeText(ocrKeilim.output.value);
		revealStatus(ocrKeilim, "success", "Copied to clipboard.");
	} catch {
		revealStatus(ocrKeilim, "error", "Automatic copy failed. Select the text and copy it manually.");
	}
}

function clearResult() {
	currentResult = null;
	clearRevealedResult(ocrKeilim);
	revealStatus(ocrKeilim, "idle", ocrKeilim.file.files?.[0] ? "Image ready for another recognition." : "Ready for an image.");
}

function downloadResult(kind) {
	exportOcrArtifact(currentResult, ocrKeilim.file.files?.[0], kind);
}

ocrKeilim.file.addEventListener("change", handleImageSelection);
ocrKeilim.form.addEventListener("submit", recognizeSelectedImage);
ocrKeilim.copy.addEventListener("click", copyRevealedText);
ocrKeilim.clear.addEventListener("click", clearResult);
ocrKeilim.downloadTsv.addEventListener("click", () => downloadResult("tsv"));
ocrKeilim.downloadHocr.addEventListener("click", () => downloadResult("hocr"));
ocrKeilim.downloadPdf.addEventListener("click", () => downloadResult("pdf"));
window.addEventListener("pagehide", () => void terminateOcrEngine(), { once: true });
