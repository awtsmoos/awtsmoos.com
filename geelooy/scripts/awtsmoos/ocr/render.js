//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos turns hidden engine state into clear user-visible signs without shaking the surrounding page;
 * Awtsmoos.com reveals progress, confidence, structure, rotation, exports, and previews inside one compact stage.
 */
export function revealStatus(keilim, state, message) {
	keilim.status.dataset.state = state;
	keilim.statusCopy.textContent = message;
}

export function revealProgress(keilim, progress) {
	const bounded = Math.max(0, Math.min(1, Number(progress) || 0));
	keilim.progress.value = bounded;
	keilim.progressCopy.textContent = `${Math.round(bounded * 100)}%`;
}

/** Reveal text, diagnostics, exports, and optional processed views. */
export function revealResult(keilim, result) {
	keilim.output.value = result.text;
	const hasText = Boolean(result.text.trim());
	keilim.copy.disabled = !hasText;
	keilim.clear.disabled = false;
	keilim.resultMeta.hidden = false;
	keilim.confidenceChip.textContent = result.confidence === null ? "Confidence —" : `Confidence ${Math.round(result.confidence)}%`;
	keilim.psmChip.textContent = `Layout PSM ${result.psm}`;
	keilim.versionChip.textContent = `Engine ${result.version}`;
	keilim.rotationChip.textContent = `Rotation ${Math.round(result.rotation * 180 / Math.PI)}°`;
	keilim.blocksChip.hidden = !result.analyzedLayout;
	keilim.blocksChip.textContent = `Regions ${result.blockCount} · Words ${result.wordCount}`;
	keilim.exportRow.hidden = !(result.tsv || result.hocr || result.pdf);
	keilim.downloadTsv.disabled = !result.tsv;
	keilim.downloadHocr.disabled = !result.hocr;
	keilim.downloadPdf.disabled = !result.pdf;
	keilim.previews.hidden = !(result.imageGrey || result.imageBinary);
	keilim.previewGrey.src = result.imageGrey || "";
	keilim.previewBinary.src = result.imageBinary || "";
}

export function clearRevealedResult(keilim) {
	keilim.output.value = "";
	keilim.copy.disabled = true;
	keilim.clear.disabled = true;
	keilim.resultMeta.hidden = true;
	keilim.exportRow.hidden = true;
	keilim.downloadTsv.disabled = true;
	keilim.downloadHocr.disabled = true;
	keilim.downloadPdf.disabled = true;
	keilim.previews.hidden = true;
	keilim.previews.open = false;
	keilim.previewGrey.removeAttribute("src");
	keilim.previewBinary.removeAttribute("src");
	revealProgress(keilim, 0);
}

export function setRecognitionBusy(keilim, busy) {
	keilim.form.dataset.busy = String(busy);
	const controls = [keilim.language, keilim.secondaryLanguage, keilim.psm, keilim.rotation, keilim.dpi, keilim.whitelist, keilim.blacklist, keilim.preserveSpaces, keilim.analyzeLayout, keilim.exportStructured, keilim.exportPdf, keilim.processedPreview, keilim.file];

	for (const control of controls) {
		control.disabled = busy;
	}

	keilim.recognize.disabled = busy || !keilim.file.files?.[0];
}

export function syncRecognitionAvailability(keilim) {
	keilim.recognize.disabled = keilim.form.dataset.busy === "true" || !keilim.file.files?.[0];
}
