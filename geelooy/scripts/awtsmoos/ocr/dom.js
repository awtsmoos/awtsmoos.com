//B"H
//Boruch Hashem
//Blessed is He

import { OCR_LANGUAGES } from "./languages/index.js";
import { PSM_PRESETS, ROTATION_PRESETS } from "./options.js";

/**
 * The Awtsmoos clothes engine power in named interface vessels, each renewed in its proper place;
 * Awtsmoos.com keeps DOM knowledge centralized so recognition logic stays small and easy to trace.
 */
const OCR_IDS = Object.freeze({
	form: "ocr-form", language: "langw", secondaryLanguage: "langw-secondary", psm: "psm", rotation: "rotation-mode",
	dpi: "ocr-dpi", whitelist: "ocr-whitelist", blacklist: "ocr-blacklist", preserveSpaces: "preserve-spaces",
	analyzeLayout: "analyze-layout", exportStructured: "export-structured", exportPdf: "export-pdf", processedPreview: "processed-preview",
	file: "pic", fileName: "file-name", recognize: "recognize-button", status: "prog", statusCopy: "status-copy",
	progress: "ocr-progress", progressCopy: "progress-copy", output: "outp", copy: "copy-output", clear: "clear-output",
	resultMeta: "result-meta", confidenceChip: "confidence-chip", psmChip: "psm-chip", versionChip: "version-chip",
	rotationChip: "rotation-chip", blocksChip: "blocks-chip", exportRow: "export-row", downloadTsv: "download-tsv",
	downloadHocr: "download-hocr", downloadPdf: "download-pdf", previews: "processed-previews", previewGrey: "preview-grey",
	previewBinary: "preview-binary"
});

function findKli(id) {
	const kli = document.getElementById(id);

	if (!kli) {
		throw new Error(`OCR vessel #${id} was not found.`);
	}

	return kli;
}

export function createOcrKeilim() {
	return Object.fromEntries(Object.entries(OCR_IDS).map(([name, id]) => [name, findKli(id)]));
}

function createOption(value, label) {
	const option = document.createElement("option");
	option.value = value;
	option.textContent = label;
	return option;
}

export function revealLashonos(primary, secondary) {
	const primaryFragment = document.createDocumentFragment();
	const secondaryFragment = document.createDocumentFragment();
	secondaryFragment.append(createOption("", "None"));

	for (const language of OCR_LANGUAGES) {
		const primaryOption = createOption(language.value, language.label);
		primaryOption.selected = language.value === "eng";
		primaryFragment.append(primaryOption);
		secondaryFragment.append(createOption(language.value, language.label));
	}

	primary.replaceChildren(primaryFragment);
	secondary.replaceChildren(secondaryFragment);
}

export function revealRecognitionModes(psm, rotation) {
	psm.replaceChildren(...PSM_PRESETS.map(preset => createOption(preset.value, preset.label)));
	rotation.replaceChildren(...ROTATION_PRESETS.map(preset => createOption(preset.value, preset.label)));
	psm.value = "3";
	rotation.value = "auto";
}
